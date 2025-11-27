import unittest
from datetime import datetime, timedelta
from uuid import uuid4

from src.domain.entities.review import Review

class TestReviewEntity(unittest.TestCase):
    def test_review_creation_valid(self):
        review = Review(content="Great product!", rating=5)
        self.assertIsNotNone(review.id)
        self.assertEqual(review.content, "Great product!")
        self.assertEqual(review.rating, 5)
        self.assertFalse(review.is_approved)
        self.assertLessEqual(datetime.now() - review.created_at, timedelta(seconds=1))

    def test_review_creation_empty_content_raises_error(self):
        with self.assertRaises(ValueError, msg="Review content cannot be empty"):
            Review(content="", rating=3)

    def test_review_creation_invalid_rating_raises_error(self):
        with self.assertRaises(ValueError, msg="Rating must be between 1 and 5"):
            Review(content="Bad rating", rating=0)
        with self.assertRaises(ValueError, msg="Rating must be between 1 and 5"):
            Review(content="Bad rating", rating=6)

    def test_approve_review(self):
        review = Review(content="Content", rating=4, is_approved=False, updated_at=datetime(2020, 1, 1))
        old_updated_at = review.updated_at
        
        review.approve()
        self.assertTrue(review.is_approved)
        self.assertTrue(review.updated_at > old_updated_at)

    def test_feature_review(self):
        review = Review(content="Content", rating=5, is_featured=False, updated_at=datetime(2020, 1, 1))
        old_updated_at = review.updated_at
        
        review.feature()
        self.assertTrue(review.is_featured)
        self.assertTrue(review.updated_at > old_updated_at)

    def test_unapprove_review(self):
        review = Review(content="Content", rating=3, is_approved=True, updated_at=datetime(2020, 1, 1))
        old_updated_at = review.updated_at
        
        review.unapprove()
        self.assertFalse(review.is_approved)
        self.assertTrue(review.updated_at > old_updated_at)

    def test_unfeature_review(self):
        review = Review(content="Content", rating=2, is_featured=True, updated_at=datetime(2020, 1, 1))
        old_updated_at = review.updated_at
        
        review.unfeature()
        self.assertFalse(review.is_featured)
        self.assertTrue(review.updated_at > old_updated_at)
