import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import uuid4
from datetime import datetime, timedelta

from src.domain.entities.review import Review
from src.domain.entities.product import Product, ProductStatus, Category
from src.domain.entities.user import Profile, UserRole
from src.infrastructure.database import Base
from src.infrastructure.repositories.sqlalchemy_review_repository import (
    SQLAlchemyReviewRepository,
    ReviewORM,
)
from src.infrastructure.repositories.sqlalchemy_product_repository import ProductORM, CategoryORM
from src.infrastructure.repositories.sqlalchemy_user_repository import ProfileORM


class TestSQLAlchemyReviewRepository(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)  # Create tables for all ORMs
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.review_repo = SQLAlchemyReviewRepository(self.session)

        self.product_id = str(uuid4())
        self.user_id = str(uuid4())
        self.category_id = str(uuid4())

        # Create dummy product and profile for review to reference
        self.session.add(CategoryORM(id=self.category_id, name="Test Cat", slug="test-cat"))
        self.session.add(ProductORM(
            id=self.product_id, name="Test Product", slug="test-prod",
            category_id=self.category_id, price_brl=10.0, price_usd=2.0,
            status=ProductStatus.ACTIVE, file_url="http://test.pdf"
        ))
        self.session.add(ProfileORM(id=self.user_id, email="user@test.com", full_name="Test User"))
        self.session.commit()

    def tearDown(self):
        self.session.rollback()
        self.session.close()
        Base.metadata.drop_all(self.engine)

    def test_save_new_review(self):
        review = Review(product_id=self.product_id, user_id=self.user_id, content="Great!", rating=5)
        self.review_repo.save(review)

        retrieved = self.review_repo.get_by_id(review.id)
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.content, "Great!")
        self.assertEqual(retrieved.rating, 5)

    def test_update_existing_review(self):
        review = Review(product_id=self.product_id, user_id=self.user_id, content="Old content", rating=3)
        self.review_repo.save(review)

        review.content = "Updated content"
        review.rating = 4
        review.is_approved = True
        self.review_repo.save(review)

        updated_review = self.review_repo.get_by_id(review.id)
        self.assertEqual(updated_review.content, "Updated content")
        self.assertEqual(updated_review.rating, 4)
        self.assertTrue(updated_review.is_approved)

    def test_get_by_id(self):
        review = Review(product_id=self.product_id, user_id=self.user_id, content="Specific review", rating=5)
        self.review_repo.save(review)

        found_review = self.review_repo.get_by_id(review.id)
        self.assertIsNotNone(found_review)
        self.assertEqual(found_review.id, review.id)

    def test_get_all_reviews(self):
        review1 = Review(product_id=self.product_id, user_id=self.user_id, content="R1", rating=5, is_approved=True)
        review2 = Review(product_id=self.product_id, user_id=str(uuid4()), content="R2", rating=3, is_approved=False)
        review3 = Review(product_id=str(uuid4()), user_id=self.user_id, content="R3", rating=4, is_approved=True)
        self.review_repo.save(review1)
        self.review_repo.save(review2)
        self.review_repo.save(review3)

        all_reviews = self.review_repo.get_all()
        self.assertEqual(len(all_reviews), 3)

        approved_reviews = self.review_repo.get_all(is_approved=True)
        self.assertEqual(len(approved_reviews), 2)

        product_reviews = self.review_repo.get_all(product_id=self.product_id)
        self.assertEqual(len(product_reviews), 2)

    def test_delete_review(self):
        review = Review(product_id=self.product_id, user_id=self.user_id, content="Review to delete", rating=1)
        self.review_repo.save(review)
        
        self.review_repo.delete(review.id)
        retrieved = self.review_repo.get_by_id(review.id)
        self.assertIsNone(retrieved)
