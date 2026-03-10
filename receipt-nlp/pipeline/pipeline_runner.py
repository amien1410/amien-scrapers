"""
pipeline/pipeline_runner.py
~~~~~~~~~~~~~~~~~~~~~~~~~~~
Orchestrates the recipe enrichment pipeline.

Architecture
------------
``PipelineRunner`` owns the fetch → process → persist loop for a single
batch of raw recipes.  It is intentionally stateless between batches so
it can be used safely from multiple threads (each thread holds its own
runner instance if needed) or called repeatedly from a scheduler.

Processing model
----------------
Steps are applied sequentially from ``PIPELINE_STEPS``.  Each step is
wrapped in individual try/except so a failure in, say, ``generate_embeddings``
does not discard the nutrition or metadata already computed — those fields
are still written to the DB, and the failed step is recorded in
``processing_errors``.

Retry policy
------------
Transient per-recipe failures are retried up to ``settings.max_retries``
times with exponential back-off.  Recipes that exhaust retries are written
to a ``dead_letter`` table rather than silently dropped.
"""

from __future__ import annotations

import json
import logging
import time
from dataclasses import asdict, dataclass, field
from typing import Callable

from config.database import db_pool, execute, fetch_all, insert_recipe_enriched
from config.database import EnrichedRecipe
from config.settings import settings
from pipeline.pipeline_steps import (
    PIPELINE_STEPS,
    PipelineStepError,
    RecipeRecord,
    clean_recipe,
    estimate_nutrition,
    extract_metadata,
    generate_embeddings,
    parse_ingredients,
    parse_instructions,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Metrics / run summary
# ---------------------------------------------------------------------------

@dataclass
class RunSummary:
    total:      int = 0
    succeeded:  int = 0
    failed:     int = 0
    skipped:    int = 0
    duration_s: float = 0.0

    @property
    def success_rate(self) -> float:
        return self.succeeded / self.total if self.total else 0.0

    def __str__(self) -> str:
        return (
            f"RunSummary(total={self.total}, succeeded={self.succeeded}, "
            f"failed={self.failed}, skipped={self.skipped}, "
            f"duration={self.duration_s:.1f}s, "
            f"success_rate={self.success_rate:.1%})"
        )


# ---------------------------------------------------------------------------
# SQL
# ---------------------------------------------------------------------------

_FETCH_UNPROCESSED = """
    SELECT id, title, ingredients, instructions
    FROM   recipes_raw
    WHERE  processed = false
      AND  dead_letter = false
    ORDER  BY id
    LIMIT  %s
"""

_MARK_PROCESSED = """
    UPDATE recipes_raw
    SET    processed  = true,
           updated_at = NOW()
    WHERE  id = %s
"""

_DEAD_LETTER = """
    INSERT INTO pipeline_dead_letter (recipe_id, error, created_at)
    VALUES (%s, %s, NOW())
    ON CONFLICT (recipe_id) DO UPDATE
        SET error      = EXCLUDED.error,
            created_at = NOW()
"""

_MARK_DEAD_LETTER = """
    UPDATE recipes_raw
    SET    dead_letter = true,
           updated_at  = NOW()
    WHERE  id = %s
"""


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------

class PipelineRunner:
    """
    Fetches a batch of unprocessed recipes, runs every enrichment step, and
    persists the results.

    Parameters
    ----------
    steps:
        Ordered list of pipeline step callables.  Defaults to
        ``PIPELINE_STEPS`` from ``pipeline_steps``.  Override in tests.
    batch_size:
        How many raw recipes to fetch per run.  Defaults to
        ``settings.pipeline_batch_size``.
    max_retries:
        Per-recipe retry limit before dead-lettering.
    """

    def __init__(
        self,
        steps:       list[Callable[[RecipeRecord], RecipeRecord]] | None = None,
        batch_size:  int | None = None,
        max_retries: int | None = None,
    ) -> None:
        self.steps       = steps or PIPELINE_STEPS
        self.batch_size  = batch_size  or settings.pipeline_batch_size
        self.max_retries = max_retries or settings.max_retries
        self._backoff    = settings.retry_backoff_base

    # ------------------------------------------------------------------ DB

    def fetch_unprocessed(self) -> list[RecipeRecord]:
        rows = fetch_all(_FETCH_UNPROCESSED, (self.batch_size,))
        return [RecipeRecord.from_row(row) for row in rows]

    def _mark_processed(self, recipe_id: str) -> None:
        execute(_MARK_PROCESSED, (recipe_id,))

    def _dead_letter(self, recipe_id: str, error: str) -> None:
        execute(_DEAD_LETTER,      (recipe_id, error))
        execute(_MARK_DEAD_LETTER, (recipe_id,))
        logger.warning("Recipe %s moved to dead-letter queue.", recipe_id)

    def _persist(self, record: RecipeRecord) -> None:
        enriched = EnrichedRecipe(
            recipe_id=record.id,
            title=record.title,
            ingredients=record.parsed_ingredients,
            steps=record.steps,
            metadata=record.metadata,
            nutrition=record.nutrition,
            embedding=record.embedding,
        )
        insert_recipe_enriched(enriched)

    # ------------------------------------------------------------------ Processing

    def _apply_steps(self, record: RecipeRecord) -> RecipeRecord:
        """
        Apply each step in order.  A ``PipelineStepError`` in a non-critical
        step is logged and the record continues with whatever was computed
        before the failure.  Re-raises for steps marked critical (currently
        ``clean_recipe`` and ``parse_ingredients``).
        """
        CRITICAL_STEPS = {clean_recipe, parse_ingredients}

        for step in self.steps:
            try:
                record = step(record)
            except PipelineStepError as exc:
                if step in CRITICAL_STEPS:
                    raise
                # Non-critical: log, record the error in metadata, carry on
                logger.warning("Non-critical step skipped: %s", exc)
                record.metadata.setdefault("processing_errors", []).append(
                    {"step": exc.step, "error": str(exc.cause)}
                )
        return record

    def process_recipe(self, record: RecipeRecord) -> bool:
        """
        Run all pipeline steps on a single recipe with retry + back-off.

        Returns ``True`` on success, ``False`` if the recipe was dead-lettered.
        """
        last_exc: Exception | None = None

        for attempt in range(1, self.max_retries + 2):   # +1 for the initial try
            try:
                record  = self._apply_steps(record)
                self._persist(record)
                self._mark_processed(record.id)
                logger.info(
                    "✓ Recipe %s processed (attempt %d).", record.id, attempt
                )
                return True

            except Exception as exc:
                last_exc = exc
                if attempt <= self.max_retries:
                    delay = self._backoff ** attempt
                    logger.warning(
                        "Recipe %s — attempt %d/%d failed (%s); retrying in %.1fs.",
                        record.id, attempt, self.max_retries + 1, exc, delay,
                    )
                    time.sleep(delay)
                else:
                    break

        # Exhausted retries
        self._dead_letter(record.id, str(last_exc))
        return False

    # ------------------------------------------------------------------ Batch run

    def run(self) -> RunSummary:
        """
        Fetch one batch and process every recipe.  Returns a :class:`RunSummary`.
        """
        t_start = time.monotonic()
        summary = RunSummary()

        records = self.fetch_unprocessed()
        summary.total = len(records)
        logger.info("Fetched %d unprocessed recipe(s).", summary.total)

        if not records:
            logger.info("Nothing to process — exiting.")
            summary.duration_s = time.monotonic() - t_start
            return summary

        for record in records:
            success = self.process_recipe(record)
            if success:
                summary.succeeded += 1
            else:
                summary.failed += 1

        summary.duration_s = time.monotonic() - t_start
        logger.info("%s", summary)
        return summary


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    logging.basicConfig(
        level=settings.log_level,
        format="%(asctime)s %(levelname)-8s %(name)s — %(message)s",
    )
    runner  = PipelineRunner()
    summary = runner.run()
    db_pool.close()

    if summary.failed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
