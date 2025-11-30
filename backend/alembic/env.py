"""
Alembic migration environment configuration.
"""
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from src.settings import get_settings
from src.infrastructure.base import Base

# Import all models to ensure they're registered with Base.metadata
from src.infrastructure.repositories.sqlalchemy_product_repository import ProductORM, CategoryORM
from src.infrastructure.repositories.sqlalchemy_order_repository import OrderORM, OrderItemORM, CartItemORM, DownloadLinkORM
from src.infrastructure.repositories.sqlalchemy_user_repository import ProfileORM
from src.infrastructure.repositories.sqlalchemy_content_repository import BlogPostORM, FaqORM, SiteConfigORM, FeatureFlagORM
from src.infrastructure.repositories.sqlalchemy_review_repository import ReviewORM
from src.infrastructure.repositories.sqlalchemy_refund_repository import RefundRequestORM
from src.infrastructure.repositories.sqlalchemy_notification_repository import EmailLogORM

# Alembic Config object
config = context.config

# Get settings
settings = get_settings()

# Override sqlalchemy.url with actual database URL
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata for autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    This configures the context with just a URL and not an Engine,
    though an Engine is acceptable here as well. By skipping the Engine
    creation we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.

    In this scenario we need to create an Engine and associate a
    connection with the context.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,  # Detect column type changes
            compare_server_default=True,  # Detect default value changes
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
