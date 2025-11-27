import unittest
from datetime import datetime, timedelta
from uuid import uuid4
from src.domain.entities.product import Product, Category, ProductStatus

class TestCategoryEntity(unittest.TestCase):
    def test_category_creation_valid(self):
        category = Category(name="Test Category", slug="test-category")
        self.assertIsNotNone(category.id)
        self.assertEqual(category.name, "Test Category")
        self.assertEqual(category.slug, "test-category")
        self.assertTrue(category.is_active)
        self.assertLessEqual(datetime.now() - category.created_at, timedelta(seconds=1))

    def test_category_creation_no_slug_generates_one(self):
        category = Category(name="Another Category")
        self.assertEqual(category.slug, "another-category")

    def test_category_creation_empty_name_raises_error(self):
        with self.assertRaises(ValueError, msg="Category name cannot be empty"):
            Category(name="")

class TestProductEntity(unittest.TestCase):
    def setUp(self):
        self.valid_product_data = {
            "name": "Test Product",
            "slug": "test-product",
            "category_id": str(uuid4()),
            "price_brl": 100.0,
            "price_usd": 20.0,
            "file_url": "http://example.com/file.pdf"
        }

    def test_product_creation_valid(self):
        product = Product(**self.valid_product_data)
        self.assertIsNotNone(product.id)
        self.assertEqual(product.name, "Test Product")
        self.assertEqual(product.status, ProductStatus.DRAFT)
        self.assertLessEqual(datetime.now() - product.created_at, timedelta(seconds=1))
        self.assertEqual(product.file_url, "http://example.com/file.pdf")

    def test_product_creation_no_slug_generates_one(self):
        data = self.valid_product_data.copy()
        data.pop('slug')
        data['name'] = "Product With No Slug" # Override name in data
        product = Product(**data)
        self.assertEqual(product.slug, "product-with-no-slug")

    def test_product_creation_empty_name_raises_error(self):
        data = self.valid_product_data.copy()
        data['name'] = ""
        with self.assertRaises(ValueError, msg="Product name cannot be empty"):
            Product(**data)

    def test_product_creation_negative_price_raises_error(self):
        data = self.valid_product_data.copy()
        data['price_brl'] = -10.0
        with self.assertRaises(ValueError, msg="Prices cannot be negative"):
            Product(**data)

    def test_product_creation_invalid_rating_raises_error(self):
        data = self.valid_product_data.copy()
        data['rating'] = 6.0
        with self.assertRaises(ValueError, msg="Rating must be between 0.0 and 5.0"):
            Product(**data)

        data['rating'] = -1.0
        with self.assertRaises(ValueError, msg="Rating must be between 0.0 and 5.0"):
            Product(**data)

    def test_publish_product_valid(self):
        product = Product(**self.valid_product_data)
        self.assertEqual(product.status, ProductStatus.DRAFT)
        
        product.publish()
        self.assertEqual(product.status, ProductStatus.ACTIVE)
        self.assertIsNotNone(product.published_at)
        self.assertLessEqual(datetime.now() - product.updated_at, timedelta(seconds=1))

    def test_publish_product_no_file_url_raises_error(self):
        data = self.valid_product_data.copy()
        data['file_url'] = None
        product = Product(**data)
        with self.assertRaises(ValueError, msg="Cannot publish a product without a file_url."):
            product.publish()

    def test_publish_product_zero_price_raises_error(self):
        data = self.valid_product_data.copy()
        data['price_brl'] = 0.0
        product = Product(**data)
        with self.assertRaises(ValueError, msg="Cannot publish a product with zero or negative price."):
            product.publish()

    def test_archive_product(self):
        product = Product(**self.valid_product_data)
        product.status = ProductStatus.ACTIVE # Set to active first
        
        product.archive()
        self.assertEqual(product.status, ProductStatus.ARCHIVED)
        self.assertLessEqual(datetime.now() - product.updated_at, timedelta(seconds=1))
    
    def test_product_to_dict(self):
        product_id = str(uuid4())
        category_id = str(uuid4())
        created_at = datetime.now() - timedelta(days=1)
        updated_at = datetime.now()
        published_at = datetime.now()
        
        product = Product(
            id=product_id,
            name="Sample Product",
            slug="sample-product",
            description_short="Short desc",
            description_full="Full description",
            category_id=category_id,
            price_brl=150.50,
            price_usd=30.25,
            file_url="http://example.com/sample.pdf",
            author="Author Name",
            status=ProductStatus.ACTIVE,
            created_at=created_at,
            updated_at=updated_at,
            published_at=published_at
        )
        
        product_dict = product.to_dict()
        self.assertEqual(product_dict["id"], product_id)
        self.assertEqual(product_dict["name"], "Sample Product")
        self.assertEqual(product_dict["status"], "active")
        self.assertEqual(product_dict["created_at"], created_at.isoformat())
        self.assertEqual(product_dict["published_at"], published_at.isoformat())
        self.assertIn("price_brl", product_dict)
        self.assertIn("category_id", product_dict)
