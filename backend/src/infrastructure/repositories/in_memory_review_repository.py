from typing import Optional, List, Dict
from src.domain.repositories.review_repository import AbstractReviewRepository
from src.domain.entities.review import Review

class InMemoryReviewRepository(AbstractReviewRepository):
    def __init__(self, initial_reviews: Optional[List[Review]] = None):
        self._reviews: Dict[str, Review] = {}
        if initial_reviews:
            for review in initial_reviews:
                self._reviews[review.id] = review

    def get_by_id(self, review_id: str) -> Optional[Review]:
        return self._reviews.get(review_id)

    def get_all(self, product_id: Optional[str] = None, user_id: Optional[str] = None, is_approved: Optional[bool] = None) -> List[Review]:
        filtered_reviews = list(self._reviews.values())
        if product_id:
            filtered_reviews = [r for r in filtered_reviews if r.product_id == product_id]
        if user_id:
            filtered_reviews = [r for r in filtered_reviews if r.user_id == user_id]
        if is_approved is not None:
            filtered_reviews = [r for r in filtered_reviews if r.is_approved == is_approved]
        return filtered_reviews

    def save(self, review: Review) -> None:
        self._reviews[review.id] = review

    def delete(self, review_id: str) -> None:
        if review_id in self._reviews:
            del self._reviews[review_id]
