"""
ingredient_parser.py
~~~~~~~~~~~~~~~~~~~~
Robust ingredient-line parser that handles real-world recipe formats:

    "2 1/2 cups all-purpose flour, sifted"
    "1 large egg, beaten"
    "salt and pepper to taste"
    "3 (15-oz) cans diced tomatoes"
    "½ tsp vanilla extract"
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field
from fractions import Fraction
from typing import Optional


# ---------------------------------------------------------------------------
# Vocabulary
# ---------------------------------------------------------------------------

UNIT_ALIASES: dict[str, str] = {
    # teaspoon
    "tsp": "tsp", "teaspoon": "tsp", "teaspoons": "tsp", "t": "tsp",
    # tablespoon
    "tbsp": "tbsp", "tablespoon": "tbsp", "tablespoons": "tbsp", "tbs": "tbsp",
    # cup
    "cup": "cup", "cups": "cup", "c": "cup",
    # weight – metric
    "g": "g", "gram": "g", "grams": "g",
    "kg": "kg", "kilogram": "kg", "kilograms": "kg",
    # weight – imperial
    "oz": "oz", "ounce": "oz", "ounces": "oz",
    "lb": "lb", "pound": "lb", "pounds": "lb",
    # volume – metric
    "ml": "ml", "milliliter": "ml", "milliliters": "ml", "millilitre": "ml",
    "l": "l", "liter": "l", "liters": "l", "litre": "l", "litres": "l",
    # volume – kitchen
    "pt": "pt", "pint": "pt", "pints": "pt",
    "qt": "qt", "quart": "qt", "quarts": "qt",
    "gal": "gal", "gallon": "gal", "gallons": "gal",
    # loose / count
    "pinch": "pinch", "pinches": "pinch",
    "dash": "dash", "dashes": "dash",
    "clove": "clove", "cloves": "clove",
    "slice": "slice", "slices": "slice",
    "piece": "piece", "pieces": "piece",
    "can": "can", "cans": "can",
    "package": "package", "packages": "package", "pkg": "package",
    "bunch": "bunch", "bunches": "bunch",
    "sprig": "sprig", "sprigs": "sprig",
    "stalk": "stalk", "stalks": "stalk",
    "head": "head", "heads": "head",
    "sheet": "sheet", "sheets": "sheet",
}

MODIFIERS: frozenset[str] = frozenset({
    # prep style
    "chopped", "finely chopped", "roughly chopped", "coarsely chopped",
    "diced", "minced", "sliced", "thinly sliced", "grated", "shredded",
    "crushed", "mashed", "pureed", "blended",
    "ground", "crumbled", "julienned", "halved", "quartered",
    # state
    "fresh", "dried", "frozen", "canned", "packed", "drained", "rinsed",
    "toasted", "roasted", "cooked", "raw", "uncooked", "softened",
    "melted", "chilled", "room temperature",
    # size
    "large", "medium", "small", "extra-large", "xl",
    # cut specifics
    "boneless", "skinless", "bone-in", "skin-on", "peeled", "deveined",
    "trimmed", "pitted", "seeded",
    # quality / type markers
    "heaping", "level", "packed", "scant",
    "unsalted", "salted", "low-sodium", "reduced-fat", "full-fat",
    "whole", "skim", "2%", "nonfat",
})

# Unicode vulgar fractions → ascii equivalents
_UNICODE_FRACTIONS: dict[str, str] = {
    "½": "1/2", "⅓": "1/3", "⅔": "2/3",
    "¼": "1/4", "¾": "3/4",
    "⅕": "1/5", "⅖": "2/5", "⅗": "3/5", "⅘": "4/5",
    "⅙": "1/6", "⅚": "5/6",
    "⅛": "1/8", "⅜": "3/8", "⅝": "5/8", "⅞": "7/8",
}

_FRACTION_RE   = re.compile(r"\d+/\d+")
_RANGE_RE      = re.compile(
    r"(\d+(?:\.\d+)?(?:/\d+)?)\s*[-\u2013\u2014to]+\s*(\d+(?:\.\d+)?(?:/\d+)?)"
)


# ---------------------------------------------------------------------------
# Result model
# ---------------------------------------------------------------------------

@dataclass
class ParsedIngredient:
    raw: str
    quantity: Optional[float] = None
    quantity_max: Optional[float] = None   # set when a range is given
    unit: Optional[str] = None
    ingredient: Optional[str] = None
    modifiers: list[str] = field(default_factory=list)
    note: Optional[str] = None             # text after comma, e.g. "sifted"
    preparation: Optional[str] = None      # parenthetical prep note

    def __str__(self) -> str:
        parts: list[str] = []
        if self.quantity is not None:
            qty = (
                f"{self.quantity}\u2013{self.quantity_max}"
                if self.quantity_max else str(self.quantity)
            )
            parts.append(qty)
        if self.unit:
            parts.append(self.unit)
        if self.modifiers:
            parts.append(", ".join(self.modifiers))
        if self.ingredient:
            parts.append(self.ingredient)
        if self.note:
            parts.append(f"({self.note})")
        return " ".join(parts)

    def to_dict(self) -> dict:
        return {
            "raw": self.raw,
            "quantity": self.quantity,
            "quantity_max": self.quantity_max,
            "unit": self.unit,
            "ingredient": self.ingredient,
            "modifiers": self.modifiers,
            "note": self.note,
            "preparation": self.preparation,
        }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _normalise_unicode(text: str) -> str:
    """Replace unicode fractions and normalise whitespace."""
    for uc, asc in _UNICODE_FRACTIONS.items():
        text = text.replace(uc, f" {asc} ")
    text = unicodedata.normalize("NFKC", text)
    return " ".join(text.split())


def _to_float(token: str) -> Optional[float]:
    """Convert a string token that may be '3', '1/2', or '1.5' to float."""
    token = token.strip()
    try:
        if "/" in token:
            return float(Fraction(token))
        return float(token)
    except (ValueError, ZeroDivisionError):
        return None


def _parse_quantity(tokens: list[str]) -> tuple[Optional[float], Optional[float], list[str]]:
    """
    Extract an optional quantity (and optional max for ranges) from the front
    of the token list. Returns (quantity, quantity_max, remaining_tokens).
    """
    if not tokens:
        return None, None, tokens

    raw_qty = tokens[0]

    # Range in first token: "1-2" or "1/2-3/4"
    range_match = _RANGE_RE.fullmatch(raw_qty)
    if range_match:
        lo = _to_float(range_match.group(1))
        hi = _to_float(range_match.group(2))
        return lo, hi, tokens[1:]

    qty = _to_float(raw_qty)
    if qty is None:
        return None, None, tokens

    tokens = tokens[1:]

    # Mixed number: integer followed immediately by a fraction token
    if tokens and _FRACTION_RE.fullmatch(tokens[0]):
        frac = _to_float(tokens[0])
        if frac is not None:
            qty += frac
            tokens = tokens[1:]

    return qty, None, tokens


def _extract_note(text: str) -> tuple[str, Optional[str]]:
    """
    Split on the first comma that is NOT inside parentheses.
    Returns (main_text, note_or_None).
    """
    depth = 0
    for i, ch in enumerate(text):
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        elif ch == "," and depth == 0:
            return text[:i].strip(), text[i + 1:].strip() or None
    return text, None


def _extract_preparation(text: str) -> tuple[str, Optional[str]]:
    """Pull out the first parenthetical as a 'preparation' note."""
    match = re.search(r"\(([^)]+)\)", text)
    if not match:
        return text, None
    prep = match.group(1).strip()
    cleaned = (text[: match.start()] + text[match.end():]).strip()
    return cleaned, prep


def _split_modifiers(tokens: list[str]) -> tuple[list[str], list[str]]:
    """
    Greedily match multi-word modifiers first, then single-word ones.
    Returns (matched_modifiers, remaining_tokens).
    """
    found: list[str] = []
    remaining = list(tokens)

    changed = True
    while changed:
        changed = False
        for length in range(3, 0, -1):           # longest-match first
            for i in range(len(remaining) - length + 1):
                phrase = " ".join(remaining[i: i + length])
                if phrase in MODIFIERS:
                    found.append(phrase)
                    del remaining[i: i + length]
                    changed = True
                    break
            if changed:
                break

    return found, remaining


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def parse_ingredient(text: str) -> ParsedIngredient:
    """
    Parse a single ingredient line into a :class:`ParsedIngredient`.

    Handles:
    * Unicode fractions (½, ¾, …)
    * Mixed numbers ("2 1/2 cups")
    * Quantity ranges ("1-2 tbsp")
    * Parenthetical size qualifiers ("3 (15-oz) cans")
    * Post-comma notes ("flour, sifted")
    * Multi-word modifiers ("finely chopped", "room temperature")
    * "to taste" / "as needed" shorthand
    """
    result = ParsedIngredient(raw=text)

    low = text.lower().strip()

    # --- shortcut: "to taste" / "as needed" ingredients ---
    if re.search(r"\bto taste\b|\bas needed\b", low):
        result.note = "to taste"
        cleaned = re.sub(r",?\s*(to taste|as needed)", "", low).strip()
        result.ingredient = cleaned or None
        return result

    # --- normalisation ---
    low = _normalise_unicode(low)

    # --- parenthetical prep note, e.g. "(15-oz)" ---
    low, result.preparation = _extract_preparation(low)

    # --- post-comma note, e.g. ", sifted" ---
    low, result.note = _extract_note(low)

    tokens = low.split()
    if not tokens:
        return result

    # --- quantity (with optional mixed-number / range handling) ---
    result.quantity, result.quantity_max, tokens = _parse_quantity(tokens)

    # --- unit ---
    if tokens:
        candidate = tokens[0].rstrip(".")
        if candidate in UNIT_ALIASES:
            result.unit = UNIT_ALIASES[candidate]
            tokens = tokens[1:]

    # --- modifiers + ingredient name ---
    result.modifiers, remaining = _split_modifiers(tokens)
    result.ingredient = " ".join(remaining) if remaining else None

    return result


def parse_ingredients(lines: list[str]) -> list[ParsedIngredient]:
    """Convenience wrapper to parse a list of ingredient lines."""
    return [parse_ingredient(line) for line in lines if line.strip()]


# ---------------------------------------------------------------------------
# CLI demo
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import json

    SAMPLES = [
        "2 1/2 cups all-purpose flour, sifted",
        "1 large egg, beaten",
        "½ tsp vanilla extract",
        "3 (15-oz) cans diced tomatoes",
        "salt and pepper to taste",
        "1-2 tbsp olive oil",
        "200g boneless skinless chicken breast, thinly sliced",
        "1 bunch fresh cilantro, finely chopped",
        "2 cloves garlic, minced",
        "0.5 l whole milk",
        "¾ cup unsalted butter, room temperature",
        "pinch of cayenne pepper",
        "2 large ripe bananas, mashed",
    ]

    for sample in SAMPLES:
        parsed = parse_ingredient(sample)
        print(f"\nInput : {sample!r}")
        print(f"Output: {json.dumps(parsed.to_dict(), indent=2)}")
