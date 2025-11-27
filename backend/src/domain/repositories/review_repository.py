from abc import ABC, abstractmethod
from typing import Optional, List
from src.domain.entities.review import Review

class AbstractReviewRepository(ABC):
    @abstractmethod
    def get_by_id(self, review_id: str) -> Optional[Review]:
        pass

    @abstractmethod
    def get_all(self, product_id: Optional[str] = None, user_id: Optional[str] = None, is_approved: Optional[bool] = None) -> List[Review]:
        pass

    @abstractmethod
    def save(self, review: Review) -> None:
        pass

    @abstractmethod
    def delete(self, review_id: str) -> None:
        pass
