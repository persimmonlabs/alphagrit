import unittest
from unittest.mock import Mock, ANY
from datetime import datetime, timedelta
from uuid import uuid4

from src.domain.entities.review import Review
from src.domain.entities.product import Product, ProductStatus
from src.domain.entities.user import Profile, UserRole
from src.domain.repositories.review_repository import AbstractReviewRepository
from src.domain.repositories.product_repository import AbstractProductRepository
from src.domain.repositories.user_repository import AbstractProfileRepository
from src.application.services.customer_feedback_service import CustomerFeedbackService

class TestCustomerFeedbackService(unittest.TestCase):
    def setUp(self):
        self.mock_review_repo: AbstractReviewRepository = Mock(spec=AbstractReviewRepository)
        self.mock_product_repo: AbstractProductRepository = Mock(spec=AbstractProductRepository)
        self.mock_profile_repo: AbstractProfileRepository = Mock(spec=AbstractProfileRepository)
        
        self.service = CustomerFeedbackService(
            self.mock_review_repo,
            self.mock_product_repo,
            self.mock_profile_repo
        )

        self.user_id = str(uuid4())
        self.product_id = str(uuid4()) # Use this one consistently
        self.review_id = str(uuid4())

        self.test_product = Product(
            id=self.product_id, name="Test Product", slug="test-product",
            price_brl=50.0, price_usd=10.0, status=ProductStatus.ACTIVE, file_url="http://test.pdf"
        )
        self.test_profile = Profile(id=self.user_id, email="user@example.com")
        self.test_review = Review(id=self.review_id, product_id=self.product_id, user_id=self.user_id, content="Great!", rating=5, updated_at=datetime(2020,1,1))

        self.mock_product_repo.get_by_id.return_value = self.test_product
        self.mock_profile_repo.get_by_id.return_value = self.test_profile
        self.mock_review_repo.get_by_id.return_value = self.test_review

    def test_submit_review_success(self):
        review = self.service.submit_review(
            product_id=self.product_id,
            user_id=self.user_id,
            content="Awesome product!",
            rating=5,
            title="So good"
        )
        self.assertIsInstance(review, Review)
        self.assertEqual(review.product_id, self.product_id)
        self.assertEqual(review.user_id, self.user_id)
        self.assertEqual(review.content, "Awesome product!")
        self.assertEqual(review.rating, 5)
        self.mock_review_repo.save.assert_called_once_with(ANY)
        self.mock_product_repo.get_by_id.assert_called_once_with(self.product_id)
        self.mock_profile_repo.get_by_id.assert_called_once_with(self.user_id)

    def test_submit_review_product_not_found_raises_error(self):
        self.mock_product_repo.get_by_id.return_value = None
        with self.assertRaises(ValueError, msg="Product with ID not found."):
            self.service.submit_review(
                product_id=str(uuid4()), user_id=self.user_id, content="Content", rating=4
            )
        self.mock_review_repo.save.assert_not_called()

    def test_submit_review_user_not_found_raises_error(self):
        self.mock_profile_repo.get_by_id.return_value = None
        with self.assertRaises(ValueError, msg="User with ID not found."):
            self.service.submit_review(
                product_id=self.product_id, user_id=str(uuid4()), content="Content", rating=4
            )
        self.mock_review_repo.save.assert_not_called()

    def test_get_review_by_id_success(self):
        review = self.service.get_review_by_id(self.review_id)
        self.assertEqual(review, self.test_review)
        self.mock_review_repo.get_by_id.assert_called_once_with(self.review_id)

    def test_list_reviews_all(self):
        self.mock_review_repo.get_all.return_value = [self.test_review]
        reviews = self.service.list_reviews()
        self.assertEqual(len(reviews), 1)
        self.mock_review_repo.get_all.assert_called_once_with(product_id=None, user_id=None, is_approved=True)

    def test_update_review_success(self):
        original_review = Review(id=self.review_id, content="Old content", rating=3, updated_at=datetime(2020,1,1))
        self.mock_review_repo.get_by_id.return_value = original_review
        
        old_updated_at = original_review.updated_at
        updated_review = self.service.update_review(self.review_id, content="New content", rating=5)
        
        self.assertEqual(updated_review.content, "New content")
        self.assertEqual(updated_review.rating, 5)
        self.mock_review_repo.save.assert_called_once_with(original_review)
        self.assertTrue(updated_review.updated_at > old_updated_at)

    def test_approve_review_success(self):
        original_review = Review(id=self.review_id, content="Content", rating=4, is_approved=False, updated_at=datetime(2020,1,1))
        self.mock_review_repo.get_by_id.return_value = original_review
        
        old_updated_at = original_review.updated_at
        approved_review = self.service.approve_review(self.review_id)
        
        self.assertTrue(approved_review.is_approved)
        self.mock_review_repo.save.assert_called_once_with(original_review)
        self.assertTrue(approved_review.updated_at > old_updated_at)

    def test_delete_review_success(self):
        self.service.delete_review(self.review_id)
        self.mock_review_repo.delete.assert_called_once_with(self.review_id)

    def test_delete_review_not_found_raises_error(self):
        self.mock_review_repo.get_by_id.return_value = None
        with self.assertRaises(ValueError, msg="Review with ID not found."):
            self.service.delete_review(str(uuid4()))
        self.mock_review_repo.delete.assert_not_called()
