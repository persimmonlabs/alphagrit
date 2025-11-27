from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship, joinedload
from sqlalchemy.sql import func
import uuid
from typing import Optional, List

from src.domain.entities.review import Review
from src.domain.repositories.review_repository import AbstractReviewRepository
from src.infrastructure.base import Base # Import Base from your dedicated base setup # Import Base from your database setup
from sqlalchemy.orm import Session

# SQLAlchemy ORM Models
class ReviewORM(Base):
    __tablename__ = "reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), ForeignKey("products.id"), nullable=True)
    user_id = Column(String(36), ForeignKey("profiles.id"), nullable=True) # Assuming profiles table ID for user
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    rating = Column(Integer, nullable=False) # CHECK (rating >= 1 AND rating <= 5)
    reviewer_name = Column(String(255), nullable=True)
    reviewer_avatar_url = Column(Text, nullable=True)
    is_featured = Column(Boolean, default=False)
    is_verified_purchase = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    product = relationship("ProductORM") # Unidirectional or Bidirectional
    user = relationship("ProfileORM") # Unidirectional or Bidirectional

    def to_entity(self) -> Review:
        return Review(
            id=str(self.id),
            product_id=str(self.product_id) if self.product_id else None,
            user_id=str(self.user_id) if self.user_id else None,
            title=self.title,
            content=self.content,
            rating=self.rating,
            reviewer_name=self.reviewer_name,
            reviewer_avatar_url=self.reviewer_avatar_url,
            is_featured=self.is_featured,
            is_verified_purchase=self.is_verified_purchase,
            is_approved=self.is_approved,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

    @staticmethod
    def from_entity(entity: Review) -> 'ReviewORM':
        return ReviewORM(
            id=entity.id,
            product_id=entity.product_id,
            user_id=entity.user_id,
            title=entity.title,
            content=entity.content,
            rating=entity.rating,
            reviewer_name=entity.reviewer_name,
            reviewer_avatar_url=entity.reviewer_avatar_url,
            is_featured=entity.is_featured,
            is_verified_purchase=entity.is_verified_purchase,
            is_approved=entity.is_approved,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )


# SQLAlchemy Repository Implementations
class SQLAlchemyReviewRepository(AbstractReviewRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, review_id: str) -> Optional[Review]:
        orm_review = self.session.query(ReviewORM).filter_by(id=review_id).first()
        return orm_review.to_entity() if orm_review else None

    def get_all(self, product_id: Optional[str] = None, user_id: Optional[str] = None, is_approved: Optional[bool] = None) -> List[Review]:
        query = self.session.query(ReviewORM)
        if product_id:
            query = query.filter_by(product_id=product_id)
        if user_id:
            query = query.filter_by(user_id=user_id)
        if is_approved is not None:
            query = query.filter_by(is_approved=is_approved)
        return [orm_review.to_entity() for orm_review in query.all()]

    def save(self, review: Review) -> None:
        orm_review = self.session.query(ReviewORM).filter_by(id=review.id).first()
        if orm_review:
            # Update existing scalar attributes
            for key, value in ReviewORM.from_entity(review).__dict__.items():
                if not key.startswith('_'):
                    setattr(orm_review, key, value)
        else:
            # Add new
            self.session.add(ReviewORM.from_entity(review))
        self.session.commit()

    def delete(self, review_id: str) -> None:
        orm_review = self.session.query(ReviewORM).filter_by(id=review_id).first()
        if orm_review:
            self.session.delete(orm_review)
            self.session.commit()
