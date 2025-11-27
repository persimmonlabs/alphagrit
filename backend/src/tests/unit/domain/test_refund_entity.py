import unittest
from datetime import datetime, timedelta
from uuid import uuid4

from src.domain.entities.refund import RefundRequest, RefundStatus

class TestRefundRequestEntity(unittest.TestCase):
    def test_refund_request_creation_valid(self):
        order_id = str(uuid4())
        request = RefundRequest(order_id=order_id, reason="Item not as described")
        self.assertIsNotNone(request.id)
        self.assertEqual(request.order_id, order_id)
        self.assertEqual(request.reason, "Item not as described")
        self.assertEqual(request.status, RefundStatus.PENDING)
        self.assertLessEqual(datetime.now() - request.created_at, timedelta(seconds=1))

    def test_refund_request_creation_missing_order_id_raises_error(self):
        with self.assertRaises(ValueError, msg="Refund request must be associated with an order ID"):
            RefundRequest(order_id="", reason="No order")

    def test_approve_refund_request(self):
        order_id = str(uuid4())
        processed_by_user_id = str(uuid4())
        request = RefundRequest(order_id=order_id, status=RefundStatus.PENDING, updated_at=datetime(2020, 1, 1))
        old_updated_at = request.updated_at
        
        request.approve(processed_by_user_id)
        
        self.assertEqual(request.status, RefundStatus.APPROVED)
        self.assertEqual(request.processed_by, processed_by_user_id)
        self.assertIsNotNone(request.processed_at)
        self.assertTrue(request.updated_at > old_updated_at)

    def test_approve_refund_request_invalid_status_raises_error(self):
        order_id = str(uuid4())
        processed_by_user_id = str(uuid4())
        request = RefundRequest(order_id=order_id, status=RefundStatus.APPROVED) # Already approved
        with self.assertRaises(ValueError, msg="Cannot approve a refund request with status approved"):
            request.approve(processed_by_user_id)

    def test_deny_refund_request(self):
        order_id = str(uuid4())
        processed_by_user_id = str(uuid4())
        request = RefundRequest(order_id=order_id, status=RefundStatus.PENDING, updated_at=datetime(2020, 1, 1))
        old_updated_at = request.updated_at
        
        request.deny(processed_by_user_id, admin_notes="Invalid reason")
        
        self.assertEqual(request.status, RefundStatus.DENIED)
        self.assertEqual(request.processed_by, processed_by_user_id)
        self.assertEqual(request.admin_notes, "Invalid reason")
        self.assertIsNotNone(request.processed_at)
        self.assertTrue(request.updated_at > old_updated_at)

    def test_deny_refund_request_invalid_status_raises_error(self):
        order_id = str(uuid4())
        processed_by_user_id = str(uuid4())
        request = RefundRequest(order_id=order_id, status=RefundStatus.DENIED) # Already denied
        with self.assertRaises(ValueError, msg="Cannot deny a refund request with status denied"):
            request.deny(processed_by_user_id)
