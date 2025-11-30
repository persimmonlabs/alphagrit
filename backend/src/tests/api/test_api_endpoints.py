"""
Comprehensive API endpoint tests for Alpha Grit backend.
Tests all major endpoints with success cases, error cases, and validation.

Uses shared conftest.py for database setup and isolation.
"""
import uuid
import pytest


# Note: client and reset_database fixtures are provided by conftest.py


@pytest.fixture
def test_category(client):
    """Create a test category"""
    resp = client.post("/api/v1/products/categories", json={
        "name": "Test Category",
        "slug": "test-category",
        "description": "Test",
        "display_order": 0,
        "is_active": True
    })
    return resp.json()


@pytest.fixture
def test_user(client):
    """Create a test user"""
    resp = client.post("/api/v1/users/users/", json={
        "email": "test@example.com",
        "full_name": "Test User"
    })
    return resp.json()


@pytest.fixture
def test_product(client, test_category):
    """Create a test product"""
    resp = client.post("/api/v1/products/", json={
        "name": "Test Product",
        "slug": "test-product",
        "category_id": test_category["id"],
        "price_brl": 99.99,
        "price_usd": 19.99
    })
    return resp.json()


class TestCategoryEndpoints:
    """Test product category endpoints"""

    def test_create_category_success(self, client):
        """POST /categories/ - Success"""
        response = client.post("/api/v1/products/categories", json={
            "name": "Python",
            "slug": "python",
            "description": "Description for Python",
            "display_order": 0,
            "is_active": True
        })
        assert response.status_code == 201
        assert response.json()["name"] == "Python"
        assert "id" in response.json()

    def test_create_category_duplicate_slug(self, client):
        """POST /categories/ - Duplicate slug error"""
        client.post("/api/v1/products/categories", json={
            "name": "Python",
            "slug": "python",
            "description": "Test",
            "display_order": 0,
            "is_active": True
        })
        response = client.post("/api/v1/products/categories", json={
            "name": "Different",
            "slug": "python",
            "description": "Test",
            "display_order": 0,
            "is_active": True
        })
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    def test_list_categories(self, client):
        """GET /categories/ - List all"""
        for i in range(3):
            client.post("/api/v1/products/categories", json={
                "name": f"Category {i}",
                "slug": f"cat-{i}",
                "description": f"Description for Category {i}",
                "display_order": 0,
                "is_active": True
            })
        response = client.get("/api/v1/products/categories")
        assert response.status_code == 200
        assert len(response.json()) == 3

    def test_get_category_by_id(self, client):
        """GET /categories/{id} - Get one"""
        create_resp = client.post("/api/v1/products/categories", json={
            "name": "Python",
            "slug": "python",
            "description": "Test",
            "display_order": 0,
            "is_active": True
        })
        cat_id = create_resp.json()["id"]
        response = client.get(f"/api/v1/products/categories/{cat_id}")
        assert response.status_code == 200
        assert response.json()["id"] == cat_id

    def test_get_category_not_found(self, client):
        """GET /categories/{id} - Not found"""
        response = client.get(f"/api/v1/products/categories/{uuid.uuid4()}")
        assert response.status_code == 404

    def test_update_category(self, client):
        """PATCH /categories/{id} - Update"""
        create_resp = client.post("/api/v1/products/categories", json={
            "name": "Old Name",
            "slug": "old-name",
            "description": "Test",
            "display_order": 0,
            "is_active": True
        })
        cat_id = create_resp.json()["id"]
        response = client.patch(f"/api/v1/products/categories/{cat_id}", json={
            "name": "New Name"
        })
        assert response.status_code == 200
        assert response.json()["name"] == "New Name"

    def test_delete_category(self, client):
        """DELETE /categories/{id} - Delete"""
        create_resp = client.post("/api/v1/products/categories", json={
            "name": "Delete Me",
            "slug": "delete-me",
            "description": "Test",
            "display_order": 0,
            "is_active": True
        })
        cat_id = create_resp.json()["id"]
        response = client.delete(f"/api/v1/products/categories/{cat_id}")
        assert response.status_code == 204
        # Verify deletion
        assert client.get(f"/api/v1/products/categories/{cat_id}").status_code == 404


class TestProductEndpoints:
    """Test product endpoints"""

    def test_create_product_success(self, client, test_category):
        """POST /products/ - Success"""
        response = client.post("/api/v1/products/", json={
            "name": "Python Basics",
            "slug": "python-basics",
            "category_id": test_category["id"],
            "price_brl": 99.99,
            "price_usd": 19.99
        })
        assert response.status_code == 201
        assert response.json()["name"] == "Python Basics"
        assert response.json()["status"] == "draft"

    def test_create_product_invalid_category(self, client, test_category):
        """POST /products/ - Invalid category"""
        response = client.post("/api/v1/products/", json={
            "name": "Bad",
            "slug": "bad",
            "category_id": str(uuid.uuid4()),
            "price_brl": 99.99,
            "price_usd": 19.99
        })
        assert response.status_code == 400
        assert "Category" in response.json()["detail"]

    def test_list_products(self, client, test_category):
        """GET /products/ - List all"""
        for i in range(3):
            client.post("/api/v1/products/", json={
                "name": f"Book {i}",
                "slug": f"book-{i}",
                "category_id": test_category["id"],
                "price_brl": 99.99,
                "price_usd": 19.99
            })
        response = client.get("/api/v1/products/")
        assert response.status_code == 200
        assert len(response.json()) == 3

    def test_get_product_by_id(self, client, test_category):
        """GET /products/{id} - Get one"""
        create_resp = client.post("/api/v1/products/", json={
            "name": "My Book",
            "slug": "my-book",
            "category_id": test_category["id"],
            "price_brl": 99.99,
            "price_usd": 19.99
        })
        prod_id = create_resp.json()["id"]
        response = client.get(f"/api/v1/products/{prod_id}")
        assert response.status_code == 200
        assert response.json()["id"] == prod_id

    def test_get_product_not_found(self, client, test_category):
        """GET /products/{id} - Not found"""
        response = client.get(f"/api/v1/products/{uuid.uuid4()}")
        assert response.status_code == 404

    def test_publish_product_success(self, client, test_category):
        """PUT /products/{id}/publish - Success with file_url"""
        create_resp = client.post("/api/v1/products/", json={
            "name": "Publishable",
            "slug": "publishable",
            "category_id": test_category["id"],
            "price_brl": 99.99,
            "price_usd": 19.99,
            "file_url": "http://example.com/book.pdf"
        })
        prod_id = create_resp.json()["id"]
        response = client.put(f"/api/v1/products/{prod_id}/publish")
        assert response.status_code == 200
        assert response.json()["status"] == "active"
        assert response.json()["published_at"] is not None

    def test_publish_product_no_file_url(self, client, test_category):
        """PUT /products/{id}/publish - Fails without file_url"""
        create_resp = client.post("/api/v1/products/", json={
            "name": "No File",
            "slug": "no-file",
            "category_id": test_category["id"],
            "price_brl": 99.99,
            "price_usd": 19.99
        })
        prod_id = create_resp.json()["id"]
        response = client.put(f"/api/v1/products/{prod_id}/publish")
        assert response.status_code == 400
        assert "file_url" in response.json()["detail"]

    def test_archive_product(self, client, test_category):
        """PUT /products/{id}/archive - Archive"""
        create_resp = client.post("/api/v1/products/", json={
            "name": "Archive Me",
            "slug": "archive-me",
            "category_id": test_category["id"],
            "price_brl": 99.99,
            "price_usd": 19.99
        })
        prod_id = create_resp.json()["id"]
        response = client.put(f"/api/v1/products/{prod_id}/archive")
        assert response.status_code == 200
        assert response.json()["status"] == "archived"

    def test_delete_product(self, client, test_category):
        """DELETE /products/{id} - Delete"""
        create_resp = client.post("/api/v1/products/", json={
            "name": "Delete Me",
            "slug": "delete-me",
            "category_id": test_category["id"],
            "price_brl": 99.99,
            "price_usd": 19.99
        })
        prod_id = create_resp.json()["id"]
        response = client.delete(f"/api/v1/products/{prod_id}")
        assert response.status_code == 204
        assert client.get(f"/api/v1/products/{prod_id}").status_code == 404


class TestUserEndpoints:
    """Test user/profile endpoints"""

    def test_create_user_success(self, client):
        """POST /users/ - Success"""
        response = client.post("/api/v1/users/users/", json={
            "email": "test@example.com",
            "full_name": "Test User"
        })
        assert response.status_code == 201
        assert response.json()["email"] == "test@example.com"
        assert "id" in response.json()

    def test_create_user_duplicate_email(self, client):
        """POST /users/ - Duplicate email"""
        client.post("/api/v1/users/users/", json={
            "email": "test@example.com",
            "full_name": "User 1"
        })
        response = client.post("/api/v1/users/users/", json={
            "email": "test@example.com",
            "full_name": "User 2"
        })
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    def test_list_users(self, client):
        """GET /users/ - List all"""
        for i in range(3):
            client.post("/api/v1/users/users/", json={
                "email": f"user{i}@example.com",
                "full_name": f"User {i}"
            })
        response = client.get("/api/v1/users/users/")
        assert response.status_code == 200
        assert len(response.json()) == 3

    def test_get_user_by_id(self, client):
        """GET /users/{id} - Get one"""
        create_resp = client.post("/api/v1/users/users/", json={
            "email": "john@example.com",
            "full_name": "John"
        })
        user_id = create_resp.json()["id"]
        response = client.get(f"/api/v1/users/users/{user_id}")
        assert response.status_code == 200
        assert response.json()["id"] == user_id

    def test_get_user_not_found(self, client):
        """GET /users/{id} - Not found"""
        response = client.get(f"/api/v1/users/users/{uuid.uuid4()}")
        assert response.status_code == 404

    def test_update_user(self, client):
        """PATCH /users/{id} - Update"""
        create_resp = client.post("/api/v1/users/users/", json={
            "email": "test@example.com",
            "full_name": "Old Name"
        })
        user_id = create_resp.json()["id"]
        response = client.patch(f"/api/v1/users/users/{user_id}", json={
            "full_name": "New Name"
        })
        assert response.status_code == 200
        assert response.json()["full_name"] == "New Name"

    def test_delete_user(self, client):
        """DELETE /users/{id} - Delete"""
        create_resp = client.post("/api/v1/users/users/", json={
            "email": "delete@example.com",
            "full_name": "Delete Me"
        })
        user_id = create_resp.json()["id"]
        response = client.delete(f"/api/v1/users/users/{user_id}")
        assert response.status_code == 204
        assert client.get(f"/api/v1/users/users/{user_id}").status_code == 404


class TestReviewEndpoints:
    """Test review endpoints"""

    def test_submit_review_success(self, client, test_user, test_product):
        """POST /reviews/ - Success"""
        response = client.post("/api/v1/reviews/reviews/", json={
            "product_id": test_product["id"],
            "user_id": test_user["id"],
            "rating": 5,
            "content": "Excellent!"
        })
        assert response.status_code == 201
        assert response.json()["rating"] == 5

    def test_list_reviews(self, client, test_user, test_product):
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

    def test_get_review_by_id(self, client, test_user, test_product):
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

    def test_approve_review(self, client, test_user, test_product):
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

    def test_feature_review(self, client, test_user, test_product):
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

    def test_root_endpoint(self, client):
        """GET / - Root"""
        response = client.get("/")
        assert response.status_code == 200
        assert "Welcome" in response.json()["message"]

    def test_swagger_docs_available(self, client):
        """GET /docs - Swagger UI"""
        response = client.get("/docs")
        assert response.status_code == 200

    def test_redoc_docs_available(self, client):
        """GET /redoc - ReDoc"""
        response = client.get("/redoc")
        assert response.status_code == 200
