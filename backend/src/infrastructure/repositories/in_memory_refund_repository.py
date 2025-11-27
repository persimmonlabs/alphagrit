from typing import Optional, List, Dict
from src.domain.repositories.refund_repository import AbstractRefundRequestRepository
from src.domain.entities.refund import RefundRequest, RefundStatus

class InMemoryRefundRequestRepository(AbstractRefundRequestRepository):
    def __init__(self, initial_requests: Optional[List[RefundRequest]] = None):
        self._requests: Dict[str, RefundRequest] = {}
        if initial_requests:
            for request in initial_requests:
                self._requests[request.id] = request

    def get_by_id(self, request_id: str) -> Optional[RefundRequest]:
        return self._requests.get(request_id)

    def get_all(self, order_id: Optional[str] = None, user_id: Optional[str] = None, status: Optional[RefundStatus] = None) -> List[RefundRequest]:
        filtered_requests = list(self._requests.values())
        if order_id:
            filtered_requests = [r for r in filtered_requests if r.order_id == order_id]
        if user_id:
            filtered_requests = [r for r in filtered_requests if r.user_id == user_id]
        if status:
            filtered_requests = [r for r in filtered_requests if r.status == status]
        return filtered_requests

    def save(self, refund_request: RefundRequest) -> None:
        self._requests[refund_request.id] = refund_request

    def delete(self, request_id: str) -> None:
        if request_id in self._requests:
            del self._requests[request_id]
