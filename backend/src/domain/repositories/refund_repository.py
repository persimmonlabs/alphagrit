from abc import ABC, abstractmethod
from typing import Optional, List
from src.domain.entities.refund import RefundRequest, RefundStatus

class AbstractRefundRequestRepository(ABC):
    @abstractmethod
    def get_by_id(self, request_id: str) -> Optional[RefundRequest]:
        pass

    @abstractmethod
    def get_all(self, order_id: Optional[str] = None, user_id: Optional[str] = None, status: Optional[RefundStatus] = None) -> List[RefundRequest]:
        pass

    @abstractmethod
    def save(self, refund_request: RefundRequest) -> None:
        pass

    @abstractmethod
    def delete(self, request_id: str) -> None:
        pass
