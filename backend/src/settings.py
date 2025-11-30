"""
Centralized runtime settings for the Alpha Grit backend.
Uses pydantic-settings for validation and environment variable loading.
"""
from typing import List, Optional
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    All settings have sensible defaults for local development.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # ===========================================
    # Core
    # ===========================================
    ENVIRONMENT: str = Field(default="development", description="Environment name")
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")

    # ===========================================
    # Database
    # ===========================================
    DATABASE_URL: str = Field(
        default="sqlite:///./app.db",
        description="Database connection string"
    )

    # ===========================================
    # CORS
    # ===========================================
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        description="Comma-separated list of allowed CORS origins"
    )

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse ALLOWED_ORIGINS string into a list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    # ===========================================
    # JWT Authentication
    # ===========================================
    JWT_SECRET_KEY: str = Field(
        default="dev-secret-key-change-in-production-32chars",
        description="Secret key for JWT token signing"
    )
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT signing algorithm")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30,
        description="Access token expiration time in minutes"
    )
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = Field(
        default=7,
        description="Refresh token expiration time in days"
    )

    # ===========================================
    # Stripe
    # ===========================================
    STRIPE_SECRET_KEY: Optional[str] = Field(
        default=None,
        description="Stripe secret API key"
    )
    STRIPE_PUBLISHABLE_KEY: Optional[str] = Field(
        default=None,
        description="Stripe publishable key"
    )
    STRIPE_WEBHOOK_SECRET: Optional[str] = Field(
        default=None,
        description="Stripe webhook signing secret"
    )

    # ===========================================
    # Mercado Pago
    # ===========================================
    MERCADO_PAGO_ACCESS_TOKEN: Optional[str] = Field(
        default=None,
        description="Mercado Pago access token"
    )
    MERCADO_PAGO_PUBLIC_KEY: Optional[str] = Field(
        default=None,
        description="Mercado Pago public key"
    )
    MERCADO_PAGO_WEBHOOK_SECRET: Optional[str] = Field(
        default=None,
        description="Mercado Pago webhook secret"
    )

    # ===========================================
    # Cloudflare R2 Storage
    # ===========================================
    R2_ACCESS_KEY_ID: Optional[str] = Field(
        default=None,
        description="Cloudflare R2 access key ID"
    )
    R2_SECRET_ACCESS_KEY: Optional[str] = Field(
        default=None,
        description="Cloudflare R2 secret access key"
    )
    R2_BUCKET_NAME: str = Field(
        default="alphagrit-files",
        description="R2 bucket name"
    )
    R2_ACCOUNT_ID: Optional[str] = Field(
        default=None,
        description="Cloudflare account ID"
    )
    R2_PUBLIC_URL: Optional[str] = Field(
        default=None,
        description="Public URL for R2 bucket (custom domain or R2.dev)"
    )

    @property
    def r2_endpoint_url(self) -> Optional[str]:
        """Construct R2 endpoint URL from account ID."""
        if self.R2_ACCOUNT_ID:
            return f"https://{self.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
        return None

    # ===========================================
    # Email (Resend)
    # ===========================================
    RESEND_API_KEY: Optional[str] = Field(
        default=None,
        description="Resend API key for email sending"
    )
    EMAIL_FROM_ADDRESS: str = Field(
        default="noreply@alphagrit.com",
        description="Default from email address"
    )
    EMAIL_FROM_NAME: str = Field(
        default="Alpha Grit",
        description="Default from name"
    )

    # ===========================================
    # Validation
    # ===========================================
    @field_validator("ENVIRONMENT")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        allowed = {"development", "staging", "production"}
        if v.lower() not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of {allowed}")
        return v.lower()

    @field_validator("LOG_LEVEL")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        if v.upper() not in allowed:
            raise ValueError(f"LOG_LEVEL must be one of {allowed}")
        return v.upper()

    # ===========================================
    # Helper Methods
    # ===========================================
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT == "production"

    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.ENVIRONMENT == "development"

    def has_stripe_config(self) -> bool:
        """Check if Stripe is properly configured."""
        return bool(self.STRIPE_SECRET_KEY and self.STRIPE_WEBHOOK_SECRET)

    def has_mercado_pago_config(self) -> bool:
        """Check if Mercado Pago is properly configured."""
        return bool(self.MERCADO_PAGO_ACCESS_TOKEN)

    def has_r2_config(self) -> bool:
        """Check if R2 storage is properly configured."""
        return bool(
            self.R2_ACCESS_KEY_ID and
            self.R2_SECRET_ACCESS_KEY and
            self.R2_ACCOUNT_ID
        )


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache to avoid re-reading environment on every call.
    """
    return Settings()


# Export settings instance for backward compatibility
settings = get_settings()

# Backward compatibility exports
ENVIRONMENT = settings.ENVIRONMENT
DATABASE_URL = settings.DATABASE_URL
ALLOWED_ORIGINS = settings.allowed_origins_list
