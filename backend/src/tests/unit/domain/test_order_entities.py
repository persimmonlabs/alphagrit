import unittest
from datetime import datetime, timedelta
from uuid import uuid4

from src.domain.entities.order import CartItem, Order, OrderItem, DownloadLink, OrderStatus, PaymentMethod, CurrencyType, RefundStatus

class TestCartItemEntity(unittest.TestCase):
    def test_cart_item_creation_valid(self):
        item = CartItem(user_id=str(uuid4()), product_id=str(uuid4()), quantity=1)
        self.assertIsNotNone(item.id)
        self.assertEqual(item.quantity, 1)
        self.assertLessEqual(datetime.now() - item.created_at, timedelta(seconds=1))

    def test_cart_item_creation_invalid_quantity_raises_error(self):
        with self.assertRaises(ValueError, msg="Cart item quantity must be positive"):
            CartItem(user_id=str(uuid4()), product_id=str(uuid4()), quantity=0)
        with self.assertRaises(ValueError, msg="Cart item quantity must be positive"):
            CartItem(user_id=str(uuid4()), product_id=str(uuid4()), quantity=-1)

class TestOrderItemEntity(unittest.TestCase):
    def test_order_item_creation_valid(self):
        item = OrderItem(order_id=str(uuid4()), product_id=str(uuid4()), product_name="Test Product", price=10.0, quantity=1, subtotal=10.0, file_url="http://file.pdf")
        self.assertIsNotNone(item.id)
        self.assertEqual(item.price, 10.0)
        self.assertEqual(item.quantity, 1)
        self.assertEqual(item.subtotal, 10.0)

    def test_order_item_creation_invalid_quantity_raises_error(self):
        with self.assertRaises(ValueError, msg="Order item quantity must be positive"):
            OrderItem(order_id=str(uuid4()), product_name="Test", price=10, quantity=0, subtotal=0)

    def test_order_item_creation_negative_price_raises_error(self):
        with self.assertRaises(ValueError, msg="Order item price cannot be negative"):
            OrderItem(order_id=str(uuid4()), product_name="Test", price=-1, quantity=1, subtotal=-1)

    def test_order_item_creation_negative_subtotal_raises_error(self):
        with self.assertRaises(ValueError, msg="Order item subtotal cannot be negative"):
            OrderItem(order_id=str(uuid4()), product_name="Test", price=10, quantity=1, subtotal=-1)

class TestOrderEntity(unittest.TestCase):
    def setUp(self):
        self.user_id = str(uuid4())
        self.product_id = str(uuid4())
        self.customer_email = "test@example.com"
        self.order_items_data = [
            OrderItem(order_id="", product_id=self.product_id, product_name="Book 1", price=10.0, quantity=1, subtotal=10.0, file_url="http://file1.pdf"),
            OrderItem(order_id="", product_id=str(uuid4()), product_name="Book 2", price=20.0, quantity=2, subtotal=40.0, file_url="http://file2.pdf")
        ]
        self.valid_order_data = {
            "user_id": self.user_id,
            "customer_email": self.customer_email,
            "subtotal": 50.0,
            "tax": 5.0,
            "total": 55.0,
            "currency": CurrencyType.USD,
            "payment_method": PaymentMethod.STRIPE,
            "items": self.order_items_data
        }

    def test_order_creation_valid(self):
        order = Order(**self.valid_order_data)
        self.assertIsNotNone(order.id)
        self.assertEqual(order.user_id, self.user_id)
        self.assertEqual(order.status, OrderStatus.PENDING)
        self.assertEqual(len(order.items), 2)

    def test_order_creation_negative_amounts_raises_error(self):
        data = self.valid_order_data.copy()
        data["total"] = -1.0
        with self.assertRaises(ValueError, msg="Order amounts cannot be negative"):
            Order(**data)

    def test_order_creation_missing_customer_email_raises_error(self):
        data = self.valid_order_data.copy()
        data["customer_email"] = ""
        with self.assertRaises(ValueError, msg="Customer email is required for an order"):
            Order(**data)

    def test_mark_paid_valid(self):
        order = Order(**self.valid_order_data)
        self.assertEqual(order.status, OrderStatus.PENDING)
        
        order.mark_paid()
        self.assertEqual(order.status, OrderStatus.PAID)
        self.assertIsNotNone(order.paid_at)
        self.assertLessEqual(datetime.now() - order.updated_at, timedelta(seconds=1))

    def test_mark_paid_from_invalid_status_raises_error(self):
        order = Order(**self.valid_order_data)
        order.status = OrderStatus.PAID # Already paid
        with self.assertRaises(ValueError, msg="Cannot mark order as paid from status paid"):
            order.mark_paid()
        
        order.status = OrderStatus.CANCELLED
        with self.assertRaises(ValueError, msg="Cannot mark order as paid from status cancelled"):
            order.mark_paid()

    def test_mark_cancelled_valid(self):
        order = Order(**self.valid_order_data)
        self.assertEqual(order.status, OrderStatus.PENDING)
        
        order.mark_cancelled()
        self.assertEqual(order.status, OrderStatus.CANCELLED)
        self.assertLessEqual(datetime.now() - order.updated_at, timedelta(seconds=1))

    def test_mark_cancelled_from_invalid_status_raises_error(self):
        order = Order(**self.valid_order_data)
        order.status = OrderStatus.PAID
        with self.assertRaises(ValueError, msg="Cannot cancel order from status paid"):
            order.mark_cancelled()
        
        order.status = OrderStatus.REFUNDED
        with self.assertRaises(ValueError, msg="Cannot cancel order from status refunded"):
            order.mark_cancelled()

class TestDownloadLinkEntity(unittest.TestCase):
    def setUp(self):
        self.user_id = str(uuid4())
        self.order_id = str(uuid4())
        self.product_id = str(uuid4())
        self.expires_at = datetime.now() + timedelta(days=7)
        self.valid_link_data = {
            "order_id": self.order_id,
            "product_id": self.product_id,
            "user_id": self.user_id,
            "file_url": "http://download.com/file.pdf",
            "expires_at": self.expires_at
        }

    def test_download_link_creation_valid(self):
        link = DownloadLink(**self.valid_link_data)
        self.assertIsNotNone(link.id)
        self.assertIsNotNone(link.token)
        self.assertEqual(link.max_downloads, 5)
        self.assertTrue(link.is_active)

    def test_download_link_creation_no_file_url_raises_error(self):
        data = self.valid_link_data.copy()
        data["file_url"] = ""
        with self.assertRaises(ValueError, msg="Download link must have a file_url"):
            DownloadLink(**data)
        data["file_url"] = None
        with self.assertRaises(ValueError, msg="Download link must have a file_url"):
            DownloadLink(**data)

    def test_download_link_creation_invalid_max_downloads_raises_error(self):
        data = self.valid_link_data.copy()
        data["max_downloads"] = 0
        with self.assertRaises(ValueError, msg="Max downloads must be positive"):
            DownloadLink(**data)

    def test_download_link_creation_invalid_expires_at_raises_error(self):
        data = self.valid_link_data.copy()
        data["expires_at"] = datetime.now() - timedelta(days=1) # Expired in the past
        with self.assertRaises(ValueError, msg="Expires at must be after created at"):
            DownloadLink(**data)

    def test_increment_download_count_valid(self):
        link = DownloadLink(**self.valid_link_data)
        self.assertEqual(link.download_count, 0)
        
        link.increment_download_count("192.168.1.1")
        self.assertEqual(link.download_count, 1)
        self.assertIsNotNone(link.last_downloaded_at)
        self.assertEqual(link.last_ip_address, "192.168.1.1")
        self.assertLessEqual(datetime.now() - link.updated_at, timedelta(seconds=1))

    def test_increment_download_count_inactive_raises_error(self):
        link = DownloadLink(**self.valid_link_data)
        link.is_active = False
        with self.assertRaises(ValueError, msg="Cannot download from an inactive link."):
            link.increment_download_count("192.168.1.1")

    def test_increment_download_count_max_reached_raises_error(self):
        link = DownloadLink(**self.valid_link_data)
        link.max_downloads = 1
        link.download_count = 1
        with self.assertRaises(ValueError, msg="Maximum download count reached for this link."):
            link.increment_download_count("192.168.1.1")

    def test_increment_download_count_expired_raises_error(self):
        link = DownloadLink(**self.valid_link_data)
        link.expires_at = datetime.now() - timedelta(minutes=1)
        with self.assertRaises(ValueError, msg="Download link has expired."):
            link.increment_download_count("192.168.1.1")
