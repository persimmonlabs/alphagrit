import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import uuid4
from datetime import datetime, timedelta

from src.domain.entities.product import Product, Category, ProductStatus
from src.infrastructure.database import Base
from src.infrastructure.repositories.sqlalchemy_product_repository import (
    SQLAlchemyProductRepository,
    SQLAlchemyCategoryRepository,
    ProductORM,
    CategoryORM,
)


class TestSQLAlchemyProductRepository(unittest.TestCase):
    def setUp(self):
        # Use an in-memory SQLite database for testing
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)  # Create tables
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.product_repo = SQLAlchemyProductRepository(self.session)
        self.category_repo = SQLAlchemyCategoryRepository(self.session)

        # Create a test category
        self.test_category_id = str(uuid4())
        self.test_category = Category(
            id=self.test_category_id, name="Test Category", slug="test-category"
        )
        self.category_repo.save(self.test_category)

    def tearDown(self):
        self.session.rollback()  # Rollback any changes
        self.session.close()
        Base.metadata.drop_all(self.engine)  # Drop tables

    def test_save_new_product(self):
        product = Product(
            name="New Product",
            slug="new-product",
            category_id=self.test_category_id,
            price_brl=100.0,
            price_usd=20.0,
            file_url="http://example.com/file.pdf",
        )
        self.product_repo.save(product)

        retrieved_product = self.product_repo.get_by_id(product.id)
        self.assertIsNotNone(retrieved_product)
        self.assertEqual(retrieved_product.name, "New Product")
        self.assertEqual(retrieved_product.slug, "new-product")
        self.assertEqual(retrieved_product.category_id, self.test_category_id)

    def test_update_existing_product(self):
        product = Product(
            name="Original Product",
            slug="original-product",
            category_id=self.test_category_id,
            price_brl=100.0,
            price_usd=20.0,
            file_url="http://example.com/file.pdf",
        )
        self.product_repo.save(product)

        product.name = "Updated Product Name"
        product.price_brl = 150.0
        self.product_repo.save(product)

        updated_product = self.product_repo.get_by_id(product.id)
        self.assertEqual(updated_product.name, "Updated Product Name")
        self.assertEqual(updated_product.price_brl, 150.0)

    def test_get_by_id(self):
        product = Product(
            name="Specific Product",
            slug="specific-product",
            category_id=self.test_category_id,
            price_brl=200.0,
            price_usd=40.0,
            file_url="http://example.com/specific.pdf",
        )
        self.product_repo.save(product)

        found_product = self.product_repo.get_by_id(product.id)
        self.assertIsNotNone(found_product)
        self.assertEqual(found_product.id, product.id)
        self.assertEqual(found_product.name, product.name)

    def test_get_by_slug(self):
        product = Product(
            name="Slug Product",
            slug="slug-product-unique",
            category_id=self.test_category_id,
            price_brl=200.0,
            price_usd=40.0,
            file_url="http://example.com/slug.pdf",
        )
        self.product_repo.save(product)

        found_product = self.product_repo.get_by_slug("slug-product-unique")
        self.assertIsNotNone(found_product)
        self.assertEqual(found_product.id, product.id)

    def test_get_all_products(self):
        product1 = Product(
            name="P1",
            slug="p1",
            category_id=self.test_category_id,
            price_brl=10,
            price_usd=2,
            file_url="http://p1.pdf",
            status=ProductStatus.ACTIVE,
        )
        product2 = Product(
            name="P2",
            slug="p2",
            category_id=self.test_category_id,
            price_brl=20,
            price_usd=4,
            file_url="http://p2.pdf",
            status=ProductStatus.DRAFT,
        )
        self.product_repo.save(product1)
        self.product_repo.save(product2)

        all_products = self.product_repo.get_all()
        self.assertEqual(len(all_products), 2)

        active_products = self.product_repo.get_all(status=ProductStatus.ACTIVE)
        self.assertEqual(len(active_products), 1)
        self.assertEqual(active_products[0].name, "P1")

    def test_delete_product(self):
        product = Product(
            name="Product to Delete",
            slug="to-delete",
            category_id=self.test_category_id,
            price_brl=50,
            price_usd=10,
            file_url="http://delete.pdf",
        )
        self.product_repo.save(product)

        self.product_repo.delete(product.id)
        retrieved_product = self.product_repo.get_by_id(product.id)
        self.assertIsNone(retrieved_product)


class TestSQLAlchemyCategoryRepository(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.category_repo = SQLAlchemyCategoryRepository(self.session)

    def tearDown(self):
        self.session.rollback()
        self.session.close()
        Base.metadata.drop_all(self.engine)

    def test_save_new_category(self):
        category = Category(name="New Category", slug="new-category")
        self.category_repo.save(category)

        retrieved_category = self.category_repo.get_by_id(category.id)
        self.assertIsNotNone(retrieved_category)
        self.assertEqual(retrieved_category.name, "New Category")

    def test_update_existing_category(self):
        category = Category(name="Original Category", slug="original-category")
        self.category_repo.save(category)

        category.name = "Updated Category Name"
        self.category_repo.save(category)

        updated_category = self.category_repo.get_by_id(category.id)
        self.assertEqual(updated_category.name, "Updated Category Name")

    def test_get_by_id_category(self):
        category = Category(name="Specific Category", slug="specific-category")
        self.category_repo.save(category)

        found_category = self.category_repo.get_by_id(category.id)
        self.assertIsNotNone(found_category)
        self.assertEqual(found_category.id, category.id)

    def test_get_by_slug_category(self):
        category = Category(name="Slug Category", slug="slug-category-unique")
        self.category_repo.save(category)

        found_category = self.category_repo.get_by_slug("slug-category-unique")
        self.assertIsNotNone(found_category)
        self.assertEqual(found_category.id, category.id)

    def test_get_all_categories(self):
        category1 = Category(name="C1", slug="c1")
        category2 = Category(name="C2", slug="c2")
        self.category_repo.save(category1)
        self.category_repo.save(category2)

        all_categories = self.category_repo.get_all()
        self.assertEqual(len(all_categories), 2)

    def test_delete_category(self):
        category = Category(name="Category to Delete", slug="to-delete")
        self.category_repo.save(category)

        self.category_repo.delete(category.id)
        retrieved_category = self.category_repo.get_by_id(category.id)
        self.assertIsNone(retrieved_category)
