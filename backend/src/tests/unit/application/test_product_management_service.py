import unittest
from unittest.mock import Mock, ANY
from uuid import uuid4
from datetime import datetime, timedelta

from src.domain.entities.product import Product, Category, ProductStatus
from src.application.services.product_management_service import ProductManagementService
from src.domain.repositories.product_repository import AbstractProductRepository, AbstractCategoryRepository

class TestProductManagementService(unittest.TestCase):
    def setUp(self):
        self.mock_product_repo: AbstractProductRepository = Mock(spec=AbstractProductRepository)
        self.mock_category_repo: AbstractCategoryRepository = Mock(spec=AbstractCategoryRepository)
        self.service = ProductManagementService(self.mock_product_repo, self.mock_category_repo)

        self.test_category_id = str(uuid4())
        self.test_category = Category(id=self.test_category_id, name="Test Category", slug="test-category")

        self.mock_category_repo.get_by_id.return_value = self.test_category

    # --- Product Management Tests ---

    def test_create_product_success(self):
        # Arrange
        self.mock_product_repo.get_by_slug.return_value = None # No existing product with slug

        # Act
        new_product = self.service.create_product(
            name="New Book",
            slug="new-book",
            category_id=self.test_category_id,
            price_brl=99.99,
            price_usd=19.99,
            file_url="http://example.com/new-book.pdf"
        )

        # Assert
        self.assertIsInstance(new_product, Product)
        self.assertEqual(new_product.name, "New Book")
        self.assertEqual(new_product.status, ProductStatus.DRAFT)
        self.mock_product_repo.save.assert_called_once_with(ANY) # Check save was called with product
        self.mock_category_repo.get_by_id.assert_called_once_with(self.test_category_id)

    def test_create_product_category_not_found_raises_error(self):
        # Arrange
        self.mock_category_repo.get_by_id.return_value = None # Simulate category not found

        # Act & Assert
        with self.assertRaises(ValueError) as cm:
            self.service.create_product(
                name="New Book", slug="new-book", category_id=str(uuid4()), price_brl=10, price_usd=2
            )
        self.assertIn("Category with ID", str(cm.exception))
        self.mock_product_repo.save.assert_not_called()

    def test_create_product_slug_already_exists_raises_error(self):
        # Arrange
        self.mock_product_repo.get_by_slug.return_value = Product(id=str(uuid4()), name="Existing", slug="new-book")

        # Act & Assert
        with self.assertRaises(ValueError) as cm:
            self.service.create_product(
                name="New Book", slug="new-book", category_id=self.test_category_id, price_brl=10, price_usd=2
            )
        self.assertIn("Product with slug 'new-book' already exists", str(cm.exception))
        self.mock_product_repo.save.assert_not_called()

    def test_get_product_success(self):
        # Arrange
        product_id = str(uuid4())
        expected_product = Product(id=product_id, name="Found Product", slug="found-product",
                                   category_id=self.test_category_id, price_brl=50, price_usd=10)
        self.mock_product_repo.get_by_id.return_value = expected_product

        # Act
        product = self.service.get_product(product_id)

        # Assert
        self.assertEqual(product, expected_product)
        self.mock_product_repo.get_by_id.assert_called_once_with(product_id)

    def test_list_products_success(self):
        # Arrange
        products_list = [
            Product(id=str(uuid4()), name="P1", slug="p1", category_id=self.test_category_id, price_brl=10, price_usd=2, status=ProductStatus.ACTIVE, file_url="http://p1.pdf"),
            Product(id=str(uuid4()), name="P2", slug="p2", category_id=self.test_category_id, price_brl=20, price_usd=4, status=ProductStatus.DRAFT),
        ]
        self.mock_product_repo.get_all.return_value = products_list

        # Act
        products = self.service.list_products()

        # Assert
        self.assertEqual(len(products), 2)
        self.mock_product_repo.get_all.assert_called_once_with(status=None)

    def test_update_product_success(self):
        # Arrange
        product_id = str(uuid4())
        original_product = Product(id=product_id, name="Old Name", slug="old-slug",
                                   category_id=self.test_category_id, price_brl=10, price_usd=2, updated_at=datetime(2020, 1, 1))
        original_product_updated_at = original_product.updated_at # Capture after definition
        self.mock_product_repo.get_by_id.return_value = original_product
        self.mock_product_repo.get_by_slug.return_value = None # New slug is unique

        # Act
        updated_product = self.service.update_product(product_id, name="New Name", slug="new-slug")

        # Assert
        self.assertEqual(updated_product.name, "New Name")
        self.assertEqual(updated_product.slug, "new-slug")
        self.mock_product_repo.save.assert_called_once_with(original_product)
        self.assertTrue(updated_product.updated_at > original_product_updated_at) # Compare with captured original

    def test_update_product_not_found_raises_error(self):
        # Arrange
        product_id = str(uuid4())
        self.mock_product_repo.get_by_id.return_value = None

        # Act & Assert
        with self.assertRaises(ValueError) as cm:
            self.service.update_product(product_id, name="Non Existent")
        self.assertIn("Product with ID", str(cm.exception))
        self.mock_product_repo.save.assert_not_called()

    def test_publish_product_success(self):
        # Arrange
        product_id = str(uuid4())
        product = Product(id=product_id, name="Draft Product", slug="draft-product",
                                   category_id=self.test_category_id, price_brl=10, price_usd=2,
                                   status=ProductStatus.DRAFT, file_url="http://file.com")
        self.mock_product_repo.get_by_id.return_value = product

        # Act
        published_product = self.service.publish_product(product_id)

        # Assert
        self.assertEqual(published_product.status, ProductStatus.ACTIVE)
        self.assertIsNotNone(published_product.published_at)
        self.mock_product_repo.save.assert_called_once_with(product)
    
    def test_publish_product_no_file_url_raises_error(self):
        # Arrange
        product_id = str(uuid4())
        product = Product(id=product_id, name="Draft Product", slug="draft-product",
                                   category_id=self.test_category_id, price_brl=10, price_usd=2,
                                   status=ProductStatus.DRAFT, file_url=None) # No file_url
        self.mock_product_repo.get_by_id.return_value = product

        # Act & Assert
        with self.assertRaises(ValueError) as cm:
            self.service.publish_product(product_id)
        self.assertIn("Cannot publish a product without a file_url.", str(cm.exception))
        self.mock_product_repo.save.assert_not_called()


    def test_delete_product_success(self):
        # Arrange
        product_id = str(uuid4())
        self.mock_product_repo.get_by_id.return_value = Product(id=product_id, name="P", slug="p", category_id=self.test_category_id, price_brl=1, price_usd=1)

        # Act
        self.service.delete_product(product_id)

        # Assert
        self.mock_product_repo.delete.assert_called_once_with(product_id)

    def test_delete_product_not_found_raises_error(self):
        # Arrange
        product_id = str(uuid4())
        self.mock_product_repo.get_by_id.return_value = None

        # Act & Assert
        with self.assertRaises(ValueError) as cm:
            self.service.delete_product(product_id)
        self.assertIn("Product with ID", str(cm.exception))
        self.mock_product_repo.delete.assert_not_called()
    
    # --- Category Management Tests ---

    def test_create_category_success(self):
        # Arrange
        self.mock_category_repo.get_by_slug.return_value = None

        # Act
        new_category = self.service.create_category(name="New Category", slug="new-category")

        # Assert
        self.assertIsInstance(new_category, Category)
        self.assertEqual(new_category.name, "New Category")
        self.mock_category_repo.save.assert_called_once_with(ANY)
        self.mock_category_repo.get_by_slug.assert_called_once_with("new-category")

    def test_create_category_slug_already_exists_raises_error(self):
        # Arrange
        self.mock_category_repo.get_by_slug.return_value = Category(id=str(uuid4()), name="Existing", slug="existing-category")

        # Act & Assert
        with self.assertRaises(ValueError) as cm:
            self.service.create_category(name="Existing Category", slug="existing-category")
        self.assertIn("Category with slug 'existing-category' already exists", str(cm.exception))
        self.mock_category_repo.save.assert_not_called()
    
    def test_get_category_success(self):
        # Arrange
        category_id = str(uuid4())
        expected_category = Category(id=category_id, name="Found Category", slug="found-category")
        self.mock_category_repo.get_by_id.return_value = expected_category

        # Act
        category = self.service.get_category(category_id)

        # Assert
        self.assertEqual(category, expected_category)
        self.mock_category_repo.get_by_id.assert_called_once_with(category_id)
    
    def test_list_categories_success(self):
        # Arrange
        categories_list = [
            Category(id=str(uuid4()), name="C1", slug="c1"),
            Category(id=str(uuid4()), name="C2", slug="c2"),
        ]
        self.mock_category_repo.get_all.return_value = categories_list

        # Act
        categories = self.service.list_categories()

        # Assert
        self.assertEqual(len(categories), 2)
        self.mock_category_repo.get_all.assert_called_once()
    
    def test_update_category_success(self):
        # Arrange
        category_id = str(uuid4())
        original_category = Category(id=category_id, name="Old Name", slug="old-slug", updated_at=datetime(2020, 1, 1))
        original_category_updated_at = original_category.updated_at # Capture after definition
        self.mock_category_repo.get_by_id.return_value = original_category
        self.mock_category_repo.get_by_slug.return_value = None # New slug is unique

        # Act
        updated_category = self.service.update_category(category_id, name="New Name", slug="new-slug")

        # Assert
        self.assertEqual(updated_category.name, "New Name")
        self.assertEqual(updated_category.slug, "new-slug")
        self.mock_category_repo.save.assert_called_once_with(original_category)
        self.assertTrue(updated_category.updated_at > original_category_updated_at) # Compare with captured original
    
    def test_delete_category_success(self):
        # Arrange
        category_id = str(uuid4())
        self.mock_category_repo.get_by_id.return_value = Category(id=category_id, name="C", slug="c")

        # Act
        self.service.delete_category(category_id)

        # Assert
        self.mock_category_repo.delete.assert_called_once_with(category_id)
