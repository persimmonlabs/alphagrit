"""
Comprehensive API endpoint tests for Alpha Grit backend.
Tests all major endpoints with success cases, error cases, and validation.
"""
import sys
import os
import uuid
from datetime import datetime

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from src.main import app
from src.infrastructure.base import Base
from src.api.v1.dependencies import get_db

# Import all ORM models to register them with Base BEFORE creating tables
from src.infrastructure.repositories.sqlalchemy_product_repository import ProductORM, CategoryORM
from src.infrastructure.repositories.sqlalchemy_user_repository import ProfileORM
from src.infrastructure.repositories.sqlalchemy_order_repository import CartItemORM, OrderORM, OrderItemORM, DownloadLinkORM
from src.infrastructure.repositories.sqlalchemy_content_repository import BlogPostORM, FaqORM, SiteConfigORM, FeatureFlagORM
from src.infrastructure.repositories.sqlalchemy_review_repository import ReviewORM
from src.infrastructure.repositories.sqlalchemy_refund_repository import RefundRequestORM
from src.infrastructure.repositories.sqlalchemy_notification_repository import EmailLogORM

# Test database setup - use file-based instead of in-memory to avoid thread isolation issues
import tempfile
test_db_file = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
test_db_path = test_db_file.name
test_db_file.close()

SQLALCHEMY_DATABASE_URL = f"sqlite:///{test_db_path}"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables AFTER importing all ORM models
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_db():
    """Reset database before each test"""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup after test
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_category(reset_db):
    """Create a test category"""
    resp = client.post("/api/v1/products/categories/", json={
        "name": "Test Category",
        "slug": "test-category",
        "description": "Test",
        "display_order": 0,
        "is_active": True
    })
    return resp.json()


@pytest.fixture
def test_user(reset_db):
    """Create a test user"""
    resp = client.post("/api/v1/users/users/", json={
        "email": "test@example.com",
        "full_name": "Test User"
    })
    return resp.json()


@pytest.fixture
def test_product(test_category):
    """Create a test product"""
    resp = client.post("/api/v1/products/products/", json={
        "name": "Test Product",
        "slug": "test-product",
        "category_id": test_category["id"],
        "price_brl": 99.99,
        "price_usd": 19.99
    })
    return resp.json()


def create_category(name: str, slug: str):
    """Helper to create a category"""
    return client.post("/api/v1/products/categories/", json={
        "name": name,
        "slug": slug,
        "description": f"Description for {name}",
        "display_order": 0,
        "is_active": True
    })


def create_product(name: str, slug: str, category_id: str, file_url: str = None):
    """Helper to create a product"""
    data = {
        "name": name,
        "slug": slug,
        "category_id": category_id,
        "price_brl": 99.99,
        "price_usd": 19.99
    }
    if file_url:
        data["file_url"] = file_url
    return client.post("/api/v1/products/products/", json=data)


def create_user(email: str, name: str):
    """Helper to create a user"""
    return client.post("/api/v1/users/users/", json={
        "email": email,
        "full_name": name
    })


class TestCategoryEndpoints:
    """Test product category endpoints"""

    def test_create_category_success(self):
        """POST /categories/ - Success"""
        response = create_category("Python", "python")
        assert response.status_code == 201
        assert response.json()["name"] == "Python"
        assert "id" in response.json()

    def test_create_category_duplicate_slug(self):
        """POST /categories/ - Duplicate slug error"""
        create_category("Python", "python")
        response = create_category("Different", "python")
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    def test_list_categories(self):
        """GET /categories/ - List all"""
        for i in range(3):
            create_category(f"Category {i}", f"cat-{i}")
        response = client.get("/api/v1/products/categories/")
        assert response.status_code == 200
        assert len(response.json()) == 3

    def test_get_category_by_id(self):
        """GET /categories/{id} - Get one"""
        create_resp = create_category("Python", "python")
        cat_id = create_resp.json()["id"]
        response = client.get(f"/api/v1/products/categories/{cat_id}")
        assert response.status_code == 200
        assert response.json()["id"] == cat_id

    def test_get_category_not_found(self):
        """GET /categories/{id} - Not found"""
        response = client.get(f"/api/v1/products/categories/{uuid.uuid4()}")
        assert response.status_code == 404

    def test_update_category(self):
        """PATCH /categories/{id} - Update"""
        create_resp = create_category("Old Name", "old-name")
        cat_id = create_resp.json()["id"]
        response = client.patch(f"/api/v1/products/categories/{cat_id}", json={
            "name": "New Name"
        })
        assert response.status_code == 200
        assert response.json()["name"] == "New Name"

    def test_delete_category(self):
        """DELETE /categories/{id} - Delete"""
        create_resp = create_category("Delete Me", "delete-me")
        cat_id = create_resp.json()["id"]
        response = client.delete(f"/api/v1/products/categories/{cat_id}")
        assert response.status_code == 204
        # Verify deletion
        assert client.get(f"/api/v1/products/categories/{cat_id}").status_code == 404


class TestProductEndpoints:
    """Test product endpoints"""

    def test_create_product_success(self, test_category):
        """POST /products/ - Success"""
        response = create_product("Python Basics", "python-basics", test_category["id"])
        assert response.status_code == 201
        assert response.json()["name"] == "Python Basics"
        assert response.json()["status"] == "draft"

    def test_create_product_invalid_category(self, test_category):
        """POST /products/ - Invalid category"""
        response = create_product("Bad", "bad", str(uuid.uuid4()))
        assert response.status_code == 400
        assert "Category" in response.json()["detail"]

    def test_list_products(self, test_category):
        """GET /products/ - List all"""
        for i in range(3):
            create_product(f"Book {i}", f"book-{i}", test_category["id"])
        response = client.get("/api/v1/products/products/")
        assert response.status_code == 200
        assert len(response.json()) == 3

    def test_get_product_by_id(self, test_category):
        """GET /products/{id} - Get one"""
        create_resp = create_product("My Book", "my-book", test_category["id"])
        prod_id = create_resp.json()["id"]
        response = client.get(f"/api/v1/products/products/{prod_id}")
        assert response.status_code == 200
        assert response.json()["id"] == prod_id

    def test_get_product_not_found(self, test_category):
        """GET /products/{id} - Not found"""
        response = client.get(f"/api/v1/products/products/{uuid.uuid4()}")
        assert response.status_code == 404

    def test_publish_product_success(self, test_category):
        """PUT /products/{id}/publish - Success with file_url"""
        create_resp = create_product("Publishable", "publishable", test_category["id"],
                                     file_url="http://example.com/book.pdf")
        prod_id = create_resp.json()["id"]
        response = client.put(f"/api/v1/products/products/{prod_id}/publish")
        assert response.status_code == 200
        assert response.json()["status"] == "active"
        assert response.json()["published_at"] is not None

    def test_publish_product_no_file_url(self, test_category):
        """PUT /products/{id}/publish - Fails without file_url"""
        create_resp = create_product("No File", "no-file", test_category["id"])
        prod_id = create_resp.json()["id"]
        response = client.put(f"/api/v1/products/products/{prod_id}/publish")
        assert response.status_code == 400
        assert "file_url" in response.json()["detail"]

    def test_archive_product(self, test_category):
        """PUT /products/{id}/archive - Archive"""
        create_resp = create_product("Archive Me", "archive-me", test_category["id"])
        prod_id = create_resp.json()["id"]
        response = client.put(f"/api/v1/products/products/{prod_id}/archive")
        assert response.status_code == 200
        assert response.json()["status"] == "archived"

    def test_delete_product(self, test_category):
        """DELETE /products/{id} - Delete"""
        create_resp = create_product("Delete Me", "delete-me", test_category["id"])
        prod_id = create_resp.json()["id"]
        response = client.delete(f"/api/v1/products/products/{prod_id}")
        assert response.status_code == 204
        assert client.get(f"/api/v1/products/products/{prod_id}").status_code == 404


class TestUserEndpoints:
    """Test user/profile endpoints"""


    def test_create_user_success(self):
        """POST /users/ - Success"""
        response = create_user("test@example.com", "Test User")
        assert response.status_code == 201
        assert response.json()["email"] == "test@example.com"
        assert "id" in response.json()

    def test_create_user_duplicate_email(self):
        """POST /users/ - Duplicate email"""
        create_user("test@example.com", "User 1")
        response = create_user("test@example.com", "User 2")
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    def test_list_users(self):
        """GET /users/ - List all"""
        for i in range(3):
            create_user(f"user{i}@example.com", f"User {i}")
        response = client.get("/api/v1/users/users/")
        assert response.status_code == 200
        assert len(response.json()) == 3

    def test_get_user_by_id(self):
        """GET /users/{id} - Get one"""
        create_resp = create_user("john@example.com", "John")
        user_id = create_resp.json()["id"]
        response = client.get(f"/api/v1/users/users/{user_id}")
        assert response.status_code == 200
        assert response.json()["id"] == user_id

    def test_get_user_not_found(self):
        """GET /users/{id} - Not found"""
        response = client.get(f"/api/v1/users/users/{uuid.uuid4()}")
        assert response.status_code == 404

    def test_update_user(self):
        """PATCH /users/{id} - Update"""
        create_resp = create_user("test@example.com", "Old Name")
        user_id = create_resp.json()["id"]
        response = client.patch(f"/api/v1/users/users/{user_id}", json={
            "full_name": "New Name"
        })
        assert response.status_code == 200
        assert response.json()["full_name"] == "New Name"

    def test_delete_user(self):
        """DELETE /users/{id} - Delete"""
        create_resp = create_user("delete@example.com", "Delete Me")
        user_id = create_resp.json()["id"]
        response = client.delete(f"/api/v1/users/users/{user_id}")
        assert response.status_code == 204
        assert client.get(f"/api/v1/users/users/{user_id}").status_code == 404


class TestReviewEndpoints:
    """Test review endpoints"""

    def test_submit_review_success(self, test_user, test_product):
        """POST /reviews/ - Success"""
        response = client.post("/api/v1/reviews/reviews/", json={
            "product_id": test_product["id"],
            "user_id": test_user["id"],
            "rating": 5,
            "content": "Excellent!"
        })
        assert response.status_code == 201
        assert response.json()["rating"] == 5

    def test_list_reviews(self, test_user, test_product):
        """GET /reviews/ - List all"""
        for i in range(3):
            client.post("/api/v1/reviews/reviews/", json={
                "product_id": test_product["id"],
                "user_id": test_user["id"],
                "rating": i + 1,
                "content": f"Review {i}"
            })
        response = client.get("/api/v1/reviews/reviews/")
        assert response.status_code == 200
        assert len(response.json()) == 3

    def test_get_review_by_id(self, test_user, test_product):
        """GET /reviews/{id} - Get one"""
        create_resp = client.post("/api/v1/reviews/reviews/", json={
            "product_id": test_product["id"],
            "user_id": test_user["id"],
            "rating": 4,
            "content": "Good"
        })
        review_id = create_resp.json()["id"]
        response = client.get(f"/api/v1/reviews/reviews/{review_id}")
        assert response.status_code == 200
        assert response.json()["id"] == review_id

    def test_approve_review(self, test_user, test_product):
        """PUT /reviews/{id}/approve - Approve"""
        create_resp = client.post("/api/v1/reviews/reviews/", json={
            "product_id": test_product["id"],
            "user_id": test_user["id"],
            "rating": 5,
            "content": "Great!"
        })
        review_id = create_resp.json()["id"]
        response = client.put(f"/api/v1/reviews/reviews/{review_id}/approve")
        assert response.status_code == 200
        assert response.json()["is_approved"] == True

    def test_feature_review(self, test_user, test_product):
        """PUT /reviews/{id}/feature - Feature"""
        create_resp = client.post("/api/v1/reviews/reviews/", json={
            "product_id": test_product["id"],
            "user_id": test_user["id"],
            "rating": 5,
            "content": "Feature this!"
        })
        review_id = create_resp.json()["id"]
        response = client.put(f"/api/v1/reviews/reviews/{review_id}/feature")
        assert response.status_code == 200
        assert response.json()["is_featured"] == True


class TestRootEndpoints:
    """Test root endpoints"""

    def test_root_endpoint(self):
        """GET / - Root"""
        response = client.get("/")
        assert response.status_code == 200
        assert "Welcome" in response.json()["message"]

    def test_swagger_docs_available(self):
        """GET /docs - Swagger UI"""
        response = client.get("/docs")
        assert response.status_code == 200

    def test_redoc_docs_available(self):
        """GET /redoc - ReDoc"""
        response = client.get("/redoc")
        assert response.status_code == 200
