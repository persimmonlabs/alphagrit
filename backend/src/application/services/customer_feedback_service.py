from typing import Optional, List
from datetime import datetime
import uuid

from src.domain.entities.review import Review
from src.domain.repositories.review_repository import AbstractReviewRepository
from src.domain.repositories.product_repository import AbstractProductRepository # To validate product existence
from src.domain.repositories.user_repository import AbstractProfileRepository # To validate user existence


class CustomerFeedbackService:
    def __init__(
        self,
        review_repo: AbstractReviewRepository,
        product_repo: AbstractProductRepository, # Dependency on Product domain
        profile_repo: AbstractProfileRepository # Dependency on User domain
    ):
        self.review_repo = review_repo
        self.product_repo = product_repo
        self.profile_repo = profile_repo

    def submit_review(
        self,
        product_id: Optional[str],
        user_id: Optional[str],
        content: str,
        rating: int,
        title: Optional[str] = None,
        reviewer_name: Optional[str] = None,
        reviewer_avatar_url: Optional[str] = None,
        is_verified_purchase: bool = False,
        is_approved: bool = False # Usually submitted as unapproved
    ) -> Review:
        if product_id:
            product = self.product_repo.get_by_id(product_id)
            if not product:
                raise ValueError(f"Product with ID {product_id} not found.")
        
        if user_id:
            profile = self.profile_repo.get_by_id(user_id)
            if not profile:
                raise ValueError(f"User with ID {user_id} not found.")

        new_review = Review(
            product_id=product_id,
            user_id=user_id,
            content=content,
            rating=rating,
            title=title,
            reviewer_name=reviewer_name,
            reviewer_avatar_url=reviewer_avatar_url,
            is_verified_purchase=is_verified_purchase,
            is_approved=is_approved
        )
        self.review_repo.save(new_review)
        return new_review

    def get_review_by_id(self, review_id: str) -> Optional[Review]:
        return self.review_repo.get_by_id(review_id)

    def list_reviews(self, product_id: Optional[str] = None, user_id: Optional[str] = None, is_approved: Optional[bool] = True) -> List[Review]:
        return self.review_repo.get_all(product_id=product_id, user_id=user_id, is_approved=is_approved)

    def update_review(
        self,
        review_id: str,
        content: Optional[str] = None,
        rating: Optional[int] = None,
        title: Optional[str] = None,
        reviewer_name: Optional[str] = None,
        reviewer_avatar_url: Optional[str] = None,
        is_featured: Optional[bool] = None,
        is_verified_purchase: Optional[bool] = None,
        is_approved: Optional[bool] = None
    ) -> Review:
        review = self.review_repo.get_by_id(review_id)
        if not review:
            raise ValueError(f"Review with ID {review_id} not found.")

        if content is not None:
            review.content = content
        if rating is not None:
            review.rating = rating
        if title is not None:
            review.title = title
        if reviewer_name is not None:
            review.reviewer_name = reviewer_name
        if reviewer_avatar_url is not None:
            review.reviewer_avatar_url = reviewer_avatar_url
        if is_featured is not None:
            review.is_featured = is_featured
        if is_verified_purchase is not None:
            review.is_verified_purchase = is_verified_purchase
        if is_approved is not None:
            review.is_approved = is_approved
        
        review.updated_at = datetime.now() # Manual update
        self.review_repo.save(review)
        return review

    def approve_review(self, review_id: str) -> Review:
        review = self.review_repo.get_by_id(review_id)
        if not review:
            raise ValueError(f"Review with ID {review_id} not found.")
        review.approve()
        self.review_repo.save(review)
        return review

    def feature_review(self, review_id: str) -> Review:
        review = self.review_repo.get_by_id(review_id)
        if not review:
            raise ValueError(f"Review with ID {review_id} not found.")
        review.feature()
        self.review_repo.save(review)
        return review

    def delete_review(self, review_id: str) -> None:
        if not self.review_repo.get_by_id(review_id):
            raise ValueError(f"Review with ID {review_id} not found.")
        self.review_repo.delete(review_id)
