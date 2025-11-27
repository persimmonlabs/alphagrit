from typing import Optional, List
from datetime import datetime
import uuid

from src.domain.entities.refund import RefundRequest, RefundStatus
from src.domain.entities.order import Order, OrderStatus # For order validation
from src.domain.entities.user import Profile, UserRole # For processed_by user validation
from src.domain.repositories.refund_repository import AbstractRefundRequestRepository
from src.domain.repositories.order_repository import AbstractOrderRepository # Dependency on Order domain
from src.domain.repositories.user_repository import AbstractProfileRepository # Dependency on User domain
from src.application.services.refund_execution_service import RefundExecutionService

class RefundService:
    def __init__(
        self,
        refund_repo: AbstractRefundRequestRepository,
        order_repo: AbstractOrderRepository, # To get order details for validation
        profile_repo: AbstractProfileRepository, # To validate processed_by user (admin)
        refund_execution_service: RefundExecutionService # NEW DEPENDENCY
    ):
        self.refund_repo = refund_repo
        self.order_repo = order_repo
        self.profile_repo = profile_repo
        self.refund_execution_service = refund_execution_service # Assign

    def submit_refund_request(
        self,
        order_id: str,
        user_id: Optional[str], # User who submitted the request
        reason: Optional[str] = None
    ) -> RefundRequest:
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise ValueError(f"Order with ID {order_id} not found for refund request.")
        
        # Ensure order is paid and not already refunded/cancelled
        if order.status != OrderStatus.PAID:
            raise ValueError(f"Refund request can only be submitted for PAID orders. Current status: {order.status.value}")

        # Check if a pending refund request already exists for this order
        existing_requests = self.refund_repo.get_all(order_id=order_id, status=RefundStatus.PENDING)
        if existing_requests:
            raise ValueError(f"A pending refund request already exists for order ID {order_id}.")
        
        # Optionally validate user_id matches order.user_id if provided
        if user_id and order.user_id and user_id != order.user_id:
            raise ValueError("User submitting refund request does not match order owner.")

        new_request = RefundRequest(
            order_id=order_id,
            user_id=user_id,
            reason=reason,
            status=RefundStatus.PENDING
        )
        self.refund_repo.save(new_request)
        return new_request

    def get_refund_request_by_id(self, request_id: str) -> Optional[RefundRequest]:
        return self.refund_repo.get_by_id(request_id)

    def list_refund_requests(self, order_id: Optional[str] = None, user_id: Optional[str] = None, status: Optional[RefundStatus] = None) -> List[RefundRequest]:
        return self.refund_repo.get_all(order_id=order_id, user_id=user_id, status=status)

    def process_refund_request(
        self,
        request_id: str,
        processed_by_user_id: str,
        action: str, # "approve" or "deny"
        admin_notes: Optional[str] = None
    ) -> RefundRequest:
        request = self.refund_repo.get_by_id(request_id)
        if not request:
            raise ValueError(f"Refund request with ID {request_id} not found.")

        # Validate processed_by_user_id (should be an admin)
        processor_profile = self.profile_repo.get_by_id(processed_by_user_id)
        if not processor_profile or processor_profile.role != UserRole.ADMIN:
            raise ValueError(f"User {processed_by_user_id} is not authorized to process refund requests.")

        if action == "approve":
            request.approve(processed_by_user_id)
            # Execute refund via payment gateway
            self.refund_execution_service.execute_refund(request) # Call the new service
            # Potentially update order status here (e.g., order.status = OrderStatus.REFUNDED)
            # This would involve fetching the order, updating its status, and saving it via order_repo
            # For simplicity, we'll assume the Order entity's status is updated separately or by an external system/webhook
            # that receives this approved event.
        elif action == "deny":
            request.deny(processed_by_user_id, admin_notes)
        else:
            raise ValueError("Invalid action. Must be 'approve' or 'deny'.")
        
        self.refund_repo.save(request)
        return request

    def delete_refund_request(self, request_id: str) -> None:
        if not self.refund_repo.get_by_id(request_id):
            raise ValueError(f"Refund request with ID {request_id} not found.")
        self.refund_repo.delete(request_id)
