"""
pipeline/task_queue.py
~~~~~~~~~~~~~~~~~~~~~~
Concurrent pipeline execution using :class:`concurrent.futures.ThreadPoolExecutor`.

Design rationale
----------------
The original ``threading.Thread`` / ``queue.Queue`` implementation required
manual sentinel (``None``) poisoning to drain workers, didn't expose per-
recipe futures, and silently swallowed the final ``RunSummary``.

This replacement:

* Uses ``ThreadPoolExecutor`` — the standard library's battle-tested pool.
  Submit, map, and shutdown are all handled without manual queue management.
* Each recipe is submitted as an independent future — failures are isolated
  and collected without blocking other workers.
* Emits an aggregated :class:`~pipeline.pipeline_runner.RunSummary` at the
  end of every batch.
* Exposes a ``dry_run`` mode for testing (fetches but does not process).
* Shutdown is guaranteed via the executor's context manager — no thread leaks
  even if the process receives SIGINT.

Usage
-----
    from pipeline.task_queue import PipelineTaskQueue

    queue = PipelineTaskQueue(num_workers=8)
    summary = queue.run()
"""

from __future__ import annotations

import logging
import signal
import time
from concurrent.futures import Future, ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from threading import Event

from config.database import db_pool
from config.settings import settings
from pipeline.pipeline_runner import PipelineRunner, RunSummary
from pipeline.pipeline_steps import RecipeRecord

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Graceful shutdown helpers
# ---------------------------------------------------------------------------

_shutdown_requested = Event()


def _handle_sigterm(signum: int, frame: object) -> None:  # noqa: ARG001
    logger.warning("SIGTERM received — finishing in-flight tasks then stopping.")
    _shutdown_requested.set()


signal.signal(signal.SIGTERM, _handle_sigterm)


# ---------------------------------------------------------------------------
# Task queue
# ---------------------------------------------------------------------------

class PipelineTaskQueue:
    """
    Concurrent wrapper around :class:`~pipeline.pipeline_runner.PipelineRunner`.

    Parameters
    ----------
    num_workers:
        Thread-pool size.  Rule of thumb: ``min(32, cpu_count + 4)`` works
        well for I/O-bound workloads like this one.
    batch_size:
        Forwarded to :class:`PipelineRunner`.
    max_retries:
        Per-recipe retry limit.  Forwarded to :class:`PipelineRunner`.
    dry_run:
        If ``True``, recipes are fetched but no processing or DB writes occur.
        Useful for pipeline smoke-tests.
    """

    def __init__(
        self,
        num_workers: int  = 4,
        batch_size:  int | None = None,
        max_retries: int | None = None,
        dry_run:     bool = False,
    ) -> None:
        self.num_workers = num_workers
        self.dry_run     = dry_run
        # Each thread gets its own runner (stateless, but avoids shared state)
        self._runner_factory = lambda: PipelineRunner(
            batch_size=batch_size,
            max_retries=max_retries,
        )

    # ------------------------------------------------------------------ internals

    def _process_one(self, record: RecipeRecord) -> bool:
        """Called inside a worker thread — must not share mutable state."""
        if self.dry_run:
            logger.debug("[dry-run] Would process recipe %s", record.id)
            return True
        # Each thread constructs its own runner to avoid lock contention
        runner = self._runner_factory()
        return runner.process_recipe(record)

    # ------------------------------------------------------------------ public API

    def run(self) -> RunSummary:
        """
        Fetch one batch and process all recipes concurrently.

        Returns a :class:`~pipeline.pipeline_runner.RunSummary` describing
        the outcome of the batch.
        """
        t_start  = time.monotonic()
        summary  = RunSummary()

        # Fetch is always single-threaded — one DB round-trip
        fetch_runner = self._runner_factory()
        records      = fetch_runner.fetch_unprocessed()
        summary.total = len(records)

        if not records:
            logger.info("No unprocessed recipes found.")
            summary.duration_s = time.monotonic() - t_start
            return summary

        logger.info(
            "Submitting %d recipe(s) to %d worker(s).",
            summary.total, self.num_workers,
        )

        future_to_id: dict[Future[bool], str] = {}

        with ThreadPoolExecutor(
            max_workers=self.num_workers,
            thread_name_prefix="pipeline-worker",
        ) as executor:
            for record in records:
                if _shutdown_requested.is_set():
                    logger.warning(
                        "Shutdown requested — skipping %d remaining recipe(s).",
                        summary.total - len(future_to_id),
                    )
                    summary.skipped += summary.total - len(future_to_id)
                    break

                future = executor.submit(self._process_one, record)
                future_to_id[future] = record.id

            # Collect results as they complete
            for future in as_completed(future_to_id):
                recipe_id = future_to_id[future]
                try:
                    success = future.result()
                except Exception as exc:
                    logger.error(
                        "Unhandled exception for recipe %s: %s",
                        recipe_id, exc, exc_info=True,
                    )
                    summary.failed += 1
                else:
                    if success:
                        summary.succeeded += 1
                    else:
                        summary.failed += 1

        summary.duration_s = time.monotonic() - t_start
        logger.info(
            "Batch complete — %s  (throughput: %.1f recipes/s)",
            summary,
            summary.total / summary.duration_s if summary.duration_s else 0,
        )
        return summary


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    import os

    logging.basicConfig(
        level=settings.log_level,
        format="%(asctime)s %(levelname)-8s %(name)s — %(message)s",
    )

    num_workers = int(os.getenv("PIPELINE_WORKERS", "4"))
    dry_run     = os.getenv("DRY_RUN", "").lower() in ("1", "true", "yes")

    task_queue = PipelineTaskQueue(num_workers=num_workers, dry_run=dry_run)

    try:
        summary = task_queue.run()
    finally:
        db_pool.close()

    if summary.failed:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
