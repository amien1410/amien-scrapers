"""
pipeline/pipeline_steps.py
~~~~~~~~~~~~~~~~~~~~~~~~~~
Pure, stateless transformation functions — one per pipeline stage.

Each step accepts a :class:`RecipeRecord` dataclass and returns a *new*
instance with the relevant fields populated.  Immutable inputs make the
functions trivially testable and safe to run concurrently.

Step contract
-------------
* Input:  ``RecipeRecord``  (partially or fully populated)
* Output: ``RecipeRecord``  (same object type, enriched fields)
* Errors: raises ``PipelineStepError`` (wraps the original exception with
          context), letting the runner decide retry / skip / dead-letter
          policy without losing the original traceback.
"""

from __future__ import annotations

import logging
import re
import unicodedata
from dataclasses import dataclass, field, replace
from typing import Any

from config.constants import COOKING_METHODS, MODIFIERS, MULTI_WORD_MODIFIERS
from ingredient_parsing.ingredient_parser import parse_ingredient
from instruction_parsing.step_splitter import split_steps
from metadata.allergen_detector import detect_allergens
from metadata.cooking_method_detector import detect_cooking_methods
from nutrition.nutrition_estimator import estimate_recipe_nutrition
from search.embedding_generator import generate_recipe_embedding

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------

@dataclass(slots=True)
class RecipeRecord:
    """
    Carries a recipe through every pipeline stage.

    Raw fields are populated at fetch time; enriched fields are filled
    progressively by each step.
    """
    # --- raw (from DB) ---
    id:           str
    title:        str
    ingredients:  list[str]         # raw text lines
    instructions: str               # raw instruction block

    # --- enriched (filled by pipeline steps) ---
    parsed_ingredients: list[dict]   = field(default_factory=list)
    steps:              list[str]    = field(default_factory=list)
    metadata:           dict         = field(default_factory=dict)
    nutrition:          dict         = field(default_factory=dict)
    embedding:          list[float] | None = None

    @classmethod
    def from_row(cls, row: dict[str, Any]) -> "RecipeRecord":
        """Construct from a raw DB row (RealDictRow or plain dict)."""
        return cls(
            id=str(row["id"]),
            title=row["title"] or "",
            ingredients=list(row.get("ingredients") or []),
            instructions=row.get("instructions") or "",
        )


# ---------------------------------------------------------------------------
# Step error
# ---------------------------------------------------------------------------

class PipelineStepError(Exception):
    """Wraps an exception raised inside a pipeline step with extra context."""

    def __init__(self, step: str, recipe_id: str, cause: Exception) -> None:
        self.step      = step
        self.recipe_id = recipe_id
        self.cause     = cause
        super().__init__(f"[step={step}] [recipe_id={recipe_id}] {type(cause).__name__}: {cause}")

    def __cause__(self) -> Exception:          # type: ignore[override]
        return self.cause


# ---------------------------------------------------------------------------
# Encoding / text normalization helpers
# ---------------------------------------------------------------------------

# Mojibake patterns produced by latin-1/utf-8 double-encoding
_MOJIBAKE: dict[str, str] = {
    "â€"":  "–",   "â€™": "'",  "â€œ": "\u201c",
    "â€\x9d": "\u201d", "Ã©": "é",  "Ã ": "à",
    "â€"":  "—",   "â€¦": "…",  "Â½":  "½",
    "Â¼":   "¼",   "Â¾": "¾",
}
_MOJIBAKE_RE = re.compile("|".join(re.escape(k) for k in _MOJIBAKE))

_MULTI_SPACE_RE = re.compile(r"\s{2,}")


def _fix_encoding(text: str) -> str:
    """Repair common mojibake sequences and normalise unicode."""
    text = _MOJIBAKE_RE.sub(lambda m: _MOJIBAKE[m.group()], text)
    text = unicodedata.normalize("NFKC", text)
    return _MULTI_SPACE_RE.sub(" ", text).strip()


def _build_embedding_text(record: RecipeRecord) -> str:
    """
    Concatenate the recipe fields most useful for semantic search into a
    single string for the embedding model.
    """
    ingredient_names = [
        i.get("ingredient", "")
        for i in record.parsed_ingredients
        if i.get("ingredient")
    ]
    methods = record.metadata.get("methods", [])
    parts = filter(None, [
        record.title,
        ", ".join(ingredient_names),
        ", ".join(methods),
    ])
    return " | ".join(parts)


# ---------------------------------------------------------------------------
# Pipeline steps
# ---------------------------------------------------------------------------

def clean_recipe(record: RecipeRecord) -> RecipeRecord:
    """
    Stage 1 — Sanitise raw text fields.

    * Repairs mojibake / double-encoded characters
    * Strips leading/trailing whitespace
    * Drops blank ingredient lines
    """
    try:
        clean_title = _fix_encoding(record.title)
        clean_ingredients = [
            _fix_encoding(line)
            for line in record.ingredients
            if line and line.strip()
        ]
        clean_instructions = _fix_encoding(record.instructions)

        return replace(
            record,
            title=clean_title,
            ingredients=clean_ingredients,
            instructions=clean_instructions,
        )
    except Exception as exc:
        raise PipelineStepError("clean_recipe", record.id, exc) from exc


def parse_ingredients(record: RecipeRecord) -> RecipeRecord:
    """
    Stage 2 — Parse each raw ingredient line into a structured dict.

    Delegates to :func:`ingredient_parsing.ingredient_parser.parse_ingredient`.
    Lines that fail to parse are kept as ``{"raw": line}`` so the pipeline
    continues rather than crashing.
    """
    try:
        structured: list[dict] = []
        for line in record.ingredients:
            try:
                parsed = parse_ingredient(line)
                structured.append(
                    parsed.to_dict() if hasattr(parsed, "to_dict") else parsed
                )
            except Exception as exc:
                logger.warning(
                    "Ingredient parse failed [recipe=%s]: %r — %s",
                    record.id, line, exc,
                )
                structured.append({"raw": line, "parse_error": str(exc)})

        return replace(record, parsed_ingredients=structured)
    except Exception as exc:
        raise PipelineStepError("parse_ingredients", record.id, exc) from exc


def parse_instructions(record: RecipeRecord) -> RecipeRecord:
    """
    Stage 3 — Split the raw instruction block into numbered steps.

    Empty or whitespace-only steps are filtered out.
    """
    try:
        raw_steps = split_steps(record.instructions)
        steps = [s.strip() for s in raw_steps if s and s.strip()]
        return replace(record, steps=steps)
    except Exception as exc:
        raise PipelineStepError("parse_instructions", record.id, exc) from exc


def extract_metadata(record: RecipeRecord) -> RecipeRecord:
    """
    Stage 4 — Derive structured metadata from parsed fields.

    Currently extracts:
    * ``methods``   — cooking techniques detected in the instructions
    * ``allergens`` — major allergen groups present in the ingredients
    * ``step_count`` — integer count of parsed steps
    """
    try:
        methods   = detect_cooking_methods(record.instructions)
        allergens = detect_allergens(record.parsed_ingredients)

        metadata = {
            "methods":    methods,
            "allergens":  allergens,
            "step_count": len(record.steps),
        }
        return replace(record, metadata=metadata)
    except Exception as exc:
        raise PipelineStepError("extract_metadata", record.id, exc) from exc


def estimate_nutrition(record: RecipeRecord) -> RecipeRecord:
    """Stage 5 — Estimate per-serving nutrition from parsed ingredients."""
    try:
        nutrition = estimate_recipe_nutrition(record.parsed_ingredients)
        return replace(record, nutrition=nutrition)
    except Exception as exc:
        raise PipelineStepError("estimate_nutrition", record.id, exc) from exc


def generate_embeddings(record: RecipeRecord) -> RecipeRecord:
    """
    Stage 6 — Generate a semantic embedding vector for similarity search.

    The embedding input combines the title, ingredient names, and detected
    cooking methods to capture the recipe's identity concisely.
    """
    try:
        text      = _build_embedding_text(record)
        embedding = generate_recipe_embedding(text)
        return replace(record, embedding=embedding)
    except Exception as exc:
        raise PipelineStepError("generate_embeddings", record.id, exc) from exc


# ---------------------------------------------------------------------------
# Ordered step registry — consumed by PipelineRunner
# ---------------------------------------------------------------------------

PIPELINE_STEPS = [
    clean_recipe,
    parse_ingredients,
    parse_instructions,
    extract_metadata,
    estimate_nutrition,
    generate_embeddings,
]
