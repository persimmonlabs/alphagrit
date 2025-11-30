"""
Shared fixtures for API tests.

Provides a consistent database setup that all API test files can use.
"""
import tempfile
import os
import sys

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure src is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from src.main import app
from src.infrastructure.base import Base
from src.api.v1.dependencies import get_db

# Import ALL ORM models to register them with Base
from src.infrastructure.repositories.sqlalchemy_product_repository import ProductORM, CategoryORM
from src.infrastructure.repositories.sqlalchemy_user_repository import ProfileORM
from src.infrastructure.repositories.sqlalchemy_order_repository import CartItemORM, OrderORM, OrderItemORM, DownloadLinkORM
from src.infrastructure.repositories.sqlalchemy_content_repository import BlogPostORM, FaqORM, SiteConfigORM, FeatureFlagORM
from src.infrastructure.repositories.sqlalchemy_review_repository import ReviewORM
from src.infrastructure.repositories.sqlalchemy_refund_repository import RefundRequestORM
from src.infrastructure.repositories.sqlalchemy_notification_repository import EmailLogORM

# Module-level database setup - use file-based SQLite to avoid threading issues
_test_db_file = None
_engine = None
_TestingSessionLocal = None


def _setup_test_db():
    """Set up the test database once per test session."""
    global _test_db_file, _engine, _TestingSessionLocal

    if _engine is None:
        _test_db_file = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
        test_db_path = _test_db_file.name
        _test_db_file.close()

        SQLALCHEMY_DATABASE_URL = f"sqlite:///{test_db_path}"
        _engine = create_engine(
            SQLALCHEMY_DATABASE_URL,
            connect_args={"check_same_thread": False}
        )
        _TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


def _get_test_db():
    """Get test database session."""
    _setup_test_db()
    db = _TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override the app's get_db dependency at module import
_setup_test_db()
app.dependency_overrides[get_db] = _get_test_db


@pytest.fixture(scope="function", autouse=True)
def reset_database():
    """Reset the database before each test."""
    _setup_test_db()
    Base.metadata.drop_all(bind=_engine)
    Base.metadata.create_all(bind=_engine)
    yield
    # Optional: clean up after test
    Base.metadata.drop_all(bind=_engine)


@pytest.fixture
def client():
    """Get test client."""
    return TestClient(app)


@pytest.fixture
def db_session():
    """Get a database session for direct database access in tests."""
    _setup_test_db()
    db = _TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
