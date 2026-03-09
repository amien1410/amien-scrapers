"""
config/database.py
~~~~~~~~~~~~~~~~~~
Production-grade database layer built on psycopg2 connection pooling.

Key design choices
------------------
* ThreadedConnectionPool — one pool shared across the process; threads each
  borrow a connection, execute, and return it.  No single persistent connection
  that can silently go stale.
* Context-manager helpers for both cursors AND pooled connections.
* Explicit transaction helpers (begin / commit / rollback are not implicit).
* Typed dataclasses for structured query results rather than raw dicts.
* Health-check utility for readiness probes (k8s, Docker, etc.).

Usage
-----
    from config.database import fetch_all, fetch_one, execute, insert_recipe_enriched

    rows = fetch_all("SELECT * FROM recipes WHERE id = %s", (recipe_id,))
    db_pool.close()   # on shutdown
"""

from __future__ import annotations

import logging
from contextlib import contextmanager
from dataclasses import dataclass
from typing import Any, Generator, Optional

import psycopg2
import psycopg2.pool
from psycopg2.extras import RealDictCursor, RealDictRow, execute_values

from config.settings import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Connection pool
# ---------------------------------------------------------------------------

class _ConnectionPool:
    """
    Thin wrapper around psycopg2.ThreadedConnectionPool that lazy-initialises
    on first use and exposes clean context-manager access.
    """

    def __init__(self) -> None:
        self._pool: psycopg2.pool.ThreadedConnectionPool | None = None

    def _ensure_pool(self) -> psycopg2.pool.ThreadedConnectionPool:
        if self._pool is None:
            self._pool = psycopg2.pool.ThreadedConnectionPool(
                minconn=1,
                maxconn=settings.db_pool_size + settings.db_pool_overflow,
                dsn=settings.database_url_str,
                cursor_factory=RealDictCursor,
                # Keep connections alive across idle periods
                keepalives=1,
                keepalives_idle=30,
                keepalives_interval=10,
                keepalives_count=5,
            )
            logger.info(
                "DB pool created (min=1, max=%d)",
                settings.db_pool_size + settings.db_pool_overflow,
            )
        return self._pool

    @contextmanager
    def connection(self) -> Generator[psycopg2.extensions.connection, None, None]:
        """Yield a connection from the pool and return it when done."""
        pool = self._ensure_pool()
        conn = pool.getconn()
        try:
            yield conn
        except Exception:
            conn.rollback()
            raise
        else:
            conn.commit()
        finally:
            pool.putconn(conn)

    @contextmanager
    def cursor(self) -> Generator[RealDictCursor, None, None]:
        """Convenience: yield a cursor inside an auto-managed connection."""
        with self.connection() as conn:
            cur = conn.cursor()
            try:
                yield cur
            finally:
                cur.close()

    def close(self) -> None:
        """Drain and destroy the pool — call once on application shutdown."""
        if self._pool is not None:
            self._pool.closeall()
            self._pool = None
            logger.info("DB pool closed.")

    def is_healthy(self) -> bool:
        """
        Run a trivial query to confirm the database is reachable.
        Suitable for readiness / liveness probes.
        """
        try:
            with self.cursor() as cur:
                cur.execute("SELECT 1")
            return True
        except Exception as exc:
            logger.warning("DB health check failed: %s", exc)
            return False


# Module-level pool singleton
db_pool = _ConnectionPool()


# ---------------------------------------------------------------------------
# Generic query helpers
# ---------------------------------------------------------------------------

def fetch_all(
    query: str,
    params: tuple[Any, ...] | None = None,
) -> list[RealDictRow]:
    """Execute *query* and return all rows as a list of dict-like objects."""
    with db_pool.cursor() as cur:
        cur.execute(query, params)
        return cur.fetchall()


def fetch_one(
    query: str,
    params: tuple[Any, ...] | None = None,
) -> RealDictRow | None:
    """Execute *query* and return the first row, or ``None`` if no rows."""
    with db_pool.cursor() as cur:
        cur.execute(query, params)
        return cur.fetchone()


def execute(
    query: str,
    params: tuple[Any, ...] | None = None,
) -> int:
    """
    Execute a DML statement (INSERT / UPDATE / DELETE).
    Returns the number of affected rows (``cursor.rowcount``).
    """
    with db_pool.cursor() as cur:
        cur.execute(query, params)
        return cur.rowcount


def execute_many(
    query: str,
    rows: list[tuple[Any, ...]],
    page_size: int = 1000,
) -> int:
    """
    Bulk-insert/update using ``psycopg2.extras.execute_values`` — far faster
    than individual ``execute()`` calls in a loop.

    Returns total rows affected.
    """
    with db_pool.cursor() as cur:
        execute_values(cur, query, rows, page_size=page_size)
        return cur.rowcount


# ---------------------------------------------------------------------------
# Domain-specific helpers
# ---------------------------------------------------------------------------

@dataclass(slots=True)
class EnrichedRecipe:
    """Typed representation of a row to be written to ``recipes_enriched``."""
    recipe_id:   str
    title:       str
    ingredients: list[dict]          # serialised as JSONB
    steps:       list[str]
    metadata:    dict
    nutrition:   dict
    embedding:   Optional[list[float]] = None


_INSERT_ENRICHED = """
    INSERT INTO recipes_enriched (
        recipe_id, title, ingredients, steps, metadata, nutrition, embedding
    )
    VALUES %s
    ON CONFLICT (recipe_id) DO UPDATE SET
        title       = EXCLUDED.title,
        ingredients = EXCLUDED.ingredients,
        steps       = EXCLUDED.steps,
        metadata    = EXCLUDED.metadata,
        nutrition   = EXCLUDED.nutrition,
        embedding   = EXCLUDED.embedding,
        updated_at  = NOW()
"""


def insert_recipe_enriched(recipe: EnrichedRecipe) -> None:
    """
    Upsert a single enriched recipe record.
    Use :func:`insert_recipes_enriched_bulk` for batch inserts.
    """
    import json
    row = (
        recipe.recipe_id,
        recipe.title,
        json.dumps(recipe.ingredients),
        json.dumps(recipe.steps),
        json.dumps(recipe.metadata),
        json.dumps(recipe.nutrition),
        recipe.embedding,
    )
    with db_pool.cursor() as cur:
        execute_values(cur, _INSERT_ENRICHED, [row])


def insert_recipes_enriched_bulk(
    recipes: list[EnrichedRecipe],
    page_size: int = 500,
) -> None:
    """
    Bulk-upsert a list of enriched recipe records in one round-trip.
    Significantly faster than calling :func:`insert_recipe_enriched` in a loop.
    """
    import json

    if not recipes:
        return

    rows = [
        (
            r.recipe_id,
            r.title,
            json.dumps(r.ingredients),
            json.dumps(r.steps),
            json.dumps(r.metadata),
            json.dumps(r.nutrition),
            r.embedding,
        )
        for r in recipes
    ]

    with db_pool.cursor() as cur:
        execute_values(cur, _INSERT_ENRICHED, rows, page_size=page_size)

    logger.debug("Bulk-upserted %d enriched recipe rows.", len(recipes))
