"""
config/settings.py
~~~~~~~~~~~~~~~~~~
Centralised, validated application settings powered by Pydantic v2 BaseSettings.

Loading priority (highest → lowest):
  1. Real environment variables
  2. .env file in the project root
  3. Declared field defaults

Usage
-----
    from config.settings import settings

    dsn  = settings.database_url
    key  = settings.openai_api_key.get_secret_value()
    lvl  = settings.log_level
"""

from __future__ import annotations

from enum import StrEnum
from pathlib import Path
from typing import Annotated

from pydantic import (
    AnyUrl,
    Field,
    PostgresDsn,
    SecretStr,
    field_validator,
    model_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict

# ---------------------------------------------------------------------------
# Enums — prevent magic strings across the codebase
# ---------------------------------------------------------------------------

class Environment(StrEnum):
    DEVELOPMENT = "development"
    STAGING     = "staging"
    PRODUCTION  = "production"
    TEST        = "test"


class LogLevel(StrEnum):
    DEBUG    = "DEBUG"
    INFO     = "INFO"
    WARNING  = "WARNING"
    ERROR    = "ERROR"
    CRITICAL = "CRITICAL"


class LLMModel(StrEnum):
    GPT_4O       = "gpt-4o"
    GPT_4O_MINI  = "gpt-4o-mini"
    GPT_4_TURBO  = "gpt-4-turbo"


# ---------------------------------------------------------------------------
# Settings model
# ---------------------------------------------------------------------------

class Settings(BaseSettings):
    """
    All application settings.  Fields map directly to env-var names (upper-
    cased automatically by Pydantic).  Sensitive values use SecretStr so they
    are never accidentally logged or serialised.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,        # DATABASE_URL == database_url
        extra="ignore",              # silently drop unknown vars — safe for CI
        frozen=True,                 # settings are read-only after construction
    )

    # ------------------------------------------------------------------ meta
    app_name:    str = "recipe-nlp-pipeline"
    app_version: str = "0.1.0"
    environment: Environment = Environment.DEVELOPMENT

    # Derived paths (not from env — set via model_validator after init)
    base_dir: Path = Path(__file__).resolve().parent.parent

    # ------------------------------------------------------------------ DB
    database_url: PostgresDsn = Field(
        default="postgresql://postgres:password@localhost:5432/recipes_db",
        description="Full SQLAlchemy-compatible Postgres DSN.",
    )
    db_pool_size:     Annotated[int, Field(ge=1,  le=100)] = 5
    db_pool_overflow: Annotated[int, Field(ge=0,  le=50)]  = 10
    db_pool_timeout:  Annotated[int, Field(ge=1,  le=120)] = 30   # seconds

    # ------------------------------------------------------------------ LLM
    openai_api_key: SecretStr = Field(default="", repr=False)
    llm_model:      LLMModel  = LLMModel.GPT_4O_MINI
    llm_timeout:    Annotated[int, Field(ge=1, le=300)] = 30       # seconds
    llm_max_tokens: Annotated[int, Field(ge=1, le=128_000)] = 2048

    # ------------------------------------------------------------------ External APIs
    usda_api_key:      SecretStr = Field(default="", repr=False)
    pytrends_timeout:  Annotated[int, Field(ge=1, le=60)] = 10

    # ------------------------------------------------------------------ Embeddings
    embedding_model:   str = "sentence-transformers/all-MiniLM-L6-v2"
    vector_dimension:  Annotated[int, Field(ge=1)] = 384
    embedding_batch_size: Annotated[int, Field(ge=1, le=1024)] = 64

    # ------------------------------------------------------------------ Pipeline
    pipeline_batch_size: Annotated[int, Field(ge=1, le=10_000)] = 50
    max_retries:         Annotated[int, Field(ge=0, le=10)]      = 3
    retry_backoff_base:  float = 2.0     # exponential back-off multiplier

    # ------------------------------------------------------------------ Logging
    log_level:       LogLevel = LogLevel.INFO
    log_json_format: bool     = False    # set True in staging / production
    log_file:        Path | None = None  # None → stdout only

    # ------------------------------------------------------------------ Feature flags
    enable_nutrition_estimation: bool = True
    enable_embeddings:           bool = True
    enable_knowledge_graph:      bool = True
    enable_seo_optimization:     bool = True

    # ------------------------------------------------------------------ Validators

    @field_validator("log_file", mode="before")
    @classmethod
    def _resolve_log_file(cls, v: str | Path | None) -> Path | None:
        """Accept a relative path and resolve it to absolute."""
        if v is None or v == "":
            return None
        return Path(v).resolve()

    @model_validator(mode="after")
    def _production_guards(self) -> "Settings":
        """Enforce stricter rules when running in production."""
        if self.environment is Environment.PRODUCTION:
            if not self.openai_api_key.get_secret_value():
                raise ValueError("OPENAI_API_KEY must be set in production.")
            if not self.usda_api_key.get_secret_value():
                raise ValueError("USDA_API_KEY must be set in production.")
            if self.log_level is LogLevel.DEBUG:
                raise ValueError("LOG_LEVEL=DEBUG is not allowed in production.")
        return self

    # ------------------------------------------------------------------ Helpers

    @property
    def is_production(self) -> bool:
        return self.environment is Environment.PRODUCTION

    @property
    def is_development(self) -> bool:
        return self.environment is Environment.DEVELOPMENT

    @property
    def log_dir(self) -> Path:
        return self.base_dir / "logs"

    @property
    def data_dir(self) -> Path:
        return self.base_dir / "data"

    @property
    def database_url_str(self) -> str:
        """Psycopg2-compatible DSN string (strips the +asyncpg driver suffix if present)."""
        return str(self.database_url).replace("postgresql+asyncpg://", "postgresql://")


# ---------------------------------------------------------------------------
# Module-level singleton — import this everywhere
# ---------------------------------------------------------------------------

settings = Settings()
