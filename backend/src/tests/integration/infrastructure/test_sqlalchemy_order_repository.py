import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import uuid4
from datetime import datetime, timedelta

from src.domain.entities.order import CartItem, Order, OrderItem, DownloadLink, OrderStatus, PaymentMethod, CurrencyType
from src.domain.entities.product import Product, ProductStatus, Category
from src.infrastructure.database import Base
from src.infrastructure.repositories.sqlalchemy_order_repository import (
    SQLAlchemyCartRepository,
    SQLAlchemyOrderRepository,
    SQLAlchemyDownloadLinkRepository,
    CartItemORM,
    OrderORM,
    OrderItemORM,
    DownloadLinkORM,
)
from src.infrastructure.repositories.sqlalchemy_product_repository import SQLAlchemyProductRepository, CategoryORM, ProductORM


class TestSQLAlchemyCartRepository(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)  # Create tables for all ORMs
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.cart_repo = SQLAlchemyCartRepository(self.session)
        self.product_repo = SQLAlchemyProductRepository(self.session) # Need product repo to create products

        self.user_id = str(uuid4())
        self.product_id = str(uuid4())
        self.category_id = str(uuid4())

        # Create a dummy product for cart items to reference
        self.session.add(CategoryORM(id=self.category_id, name="Test Cat", slug="test-cat"))
        self.session.add(ProductORM(
            id=self.product_id, name="Test Product", slug="test-prod",
            category_id=self.category_id, price_brl=10.0, price_usd=2.0,
            status=ProductStatus.ACTIVE, file_url="http://test.pdf"
        ))
        self.session.commit()

    def tearDown(self):
        self.session.rollback()
        self.session.close()
        Base.metadata.drop_all(self.engine)

    def test_save_new_cart_item(self):
        cart_item = CartItem(user_id=self.user_id, product_id=self.product_id, quantity=1)
        self.cart_repo.save(cart_item)

        retrieved = self.cart_repo.get_item_by_user_and_product(self.user_id, self.product_id)
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.product_id, self.product_id)
        self.assertEqual(retrieved.quantity, 1)

    def test_update_existing_cart_item(self):
        cart_item = CartItem(user_id=self.user_id, product_id=self.product_id, quantity=1)
        self.cart_repo.save(cart_item)

        cart_item.quantity = 5
        self.cart_repo.save(cart_item)

        retrieved = self.cart_repo.get_item_by_user_and_product(self.user_id, self.product_id)
        self.assertEqual(retrieved.quantity, 5)

    def test_get_by_user_id(self):
        user_id_2 = str(uuid4())
        self.cart_repo.save(CartItem(user_id=self.user_id, product_id=self.product_id, quantity=1))
        self.cart_repo.save(CartItem(user_id=self.user_id, product_id=str(uuid4()), quantity=2))
        self.cart_repo.save(CartItem(user_id=user_id_2, product_id=self.product_id, quantity=3))

        user_cart = self.cart_repo.get_by_user_id(self.user_id)
        self.assertEqual(len(user_cart), 2)

    def test_delete_cart_item(self):
        cart_item = CartItem(user_id=self.user_id, product_id=self.product_id, quantity=1)
        self.cart_repo.save(cart_item)
        
        self.cart_repo.delete(cart_item.id)
        retrieved = self.cart_repo.get_item_by_user_and_product(self.user_id, self.product_id) # This will retrieve based on user/product
        self.assertIsNone(retrieved) # Needs adjustment, the get_item_by_user_and_product does not search by item id

        # Re-fetch based on expected behavior: get_item_by_user_and_product should be distinct from delete by cart_item_id
        # For this test, let's assume get_item_by_user_and_product still works after deletion, so check by product_id
        all_user_items = self.cart_repo.get_by_user_id(self.user_id)
        self.assertEqual(len(all_user_items), 0)

    def test_clear_cart(self):
        self.cart_repo.save(CartItem(user_id=self.user_id, product_id=self.product_id, quantity=1))
        self.cart_repo.save(CartItem(user_id=self.user_id, product_id=str(uuid4()), quantity=2))
        
        self.cart_repo.clear_cart(self.user_id)
        user_cart = self.cart_repo.get_by_user_id(self.user_id)
        self.assertEqual(len(user_cart), 0)


class TestSQLAlchemyOrderRepository(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.order_repo = SQLAlchemyOrderRepository(self.session)
        self.product_repo = SQLAlchemyProductRepository(self.session) # For product creation in test setup

        self.user_id = str(uuid4())
        self.product_id_1 = str(uuid4())
        self.product_id_2 = str(uuid4())
        self.category_id = str(uuid4())

        # Create dummy products for orders to reference
        self.session.add(CategoryORM(id=self.category_id, name="Order Test Cat", slug="order-test-cat"))
        self.session.add(ProductORM(id=self.product_id_1, name="Order Prod 1", slug="order-prod-1",
                                    category_id=self.category_id, price_brl=10.0, price_usd=2.0,
                                    status=ProductStatus.ACTIVE, file_url="http://order1.pdf"))
        self.session.add(ProductORM(id=self.product_id_2, name="Order Prod 2", slug="order-prod-2",
                                    category_id=self.category_id, price_brl=20.0, price_usd=4.0,
                                    status=ProductStatus.ACTIVE, file_url="http://order2.pdf"))
        self.session.commit()

        self.order_items = [
            OrderItem(order_id="", product_id=self.product_id_1, product_name="Order Prod 1", price=2.0, quantity=1, subtotal=2.0, file_url="http://order1.pdf"),
            OrderItem(order_id="", product_id=self.product_id_2, product_name="Order Prod 2", price=4.0, quantity=2, subtotal=8.0, file_url="http://order2.pdf")
        ]

    def tearDown(self):
        self.session.rollback()
        self.session.close()
        Base.metadata.drop_all(self.engine)

    def test_save_new_order_with_items(self):
        order = Order(
            user_id=self.user_id, customer_email="test@order.com", subtotal=10.0, tax=0.0, total=10.0,
            currency=CurrencyType.USD, payment_method=PaymentMethod.STRIPE, items=self.order_items
        )
        self.order_repo.save(order)

        retrieved_order = self.order_repo.get_by_id(order.id)
        self.assertIsNotNone(retrieved_order)
        self.assertEqual(retrieved_order.customer_email, "test@order.com")
        self.assertEqual(len(retrieved_order.items), 2)
        self.assertEqual(retrieved_order.items[0].product_id, self.product_id_1)

    def test_update_existing_order(self):
        order = Order(
            user_id=self.user_id, customer_email="test@order.com", subtotal=10.0, tax=0.0, total=10.0,
            currency=CurrencyType.USD, payment_method=PaymentMethod.STRIPE, items=self.order_items
        )
        self.order_repo.save(order)

        order.status = OrderStatus.PAID
        order.paid_at = datetime.now()
        order.customer_name = "Updated Name"
        self.order_repo.save(order)

        updated_order = self.order_repo.get_by_id(order.id)
        self.assertEqual(updated_order.status, OrderStatus.PAID)
        self.assertEqual(updated_order.customer_name, "Updated Name")
        self.assertIsNotNone(updated_order.paid_at)

    def test_get_by_order_number(self):
        order = Order(
            order_number="AG-12345", user_id=self.user_id, customer_email="test@order.com", subtotal=10.0, tax=0.0, total=10.0,
            currency=CurrencyType.USD, payment_method=PaymentMethod.STRIPE, items=self.order_items
        )
        self.order_repo.save(order)

        retrieved_order = self.order_repo.get_by_order_number("AG-12345")
        self.assertIsNotNone(retrieved_order)
        self.assertEqual(retrieved_order.id, order.id)

    def test_delete_order(self):
        order = Order(
            user_id=self.user_id, customer_email="test@order.com", subtotal=10.0, tax=0.0, total=10.0,
            currency=CurrencyType.USD, payment_method=PaymentMethod.STRIPE, items=self.order_items
        )
        self.order_repo.save(order)
        
        order_id_to_delete = order.id
        self.order_repo.delete(order_id_to_delete)
        retrieved_order = self.order_repo.get_by_id(order_id_to_delete)
        self.assertIsNone(retrieved_order)

        # Verify order items are also deleted due to cascade
        # This requires accessing OrderItemORM directly as the repo only returns Order entity
        items_count = self.session.query(OrderItemORM).filter_by(order_id=order_id_to_delete).count()
        self.assertEqual(items_count, 0)


class TestSQLAlchemyDownloadLinkRepository(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.download_link_repo = SQLAlchemyDownloadLinkRepository(self.session)
        self.order_repo = SQLAlchemyOrderRepository(self.session)
        self.product_repo = SQLAlchemyProductRepository(self.session) # For product creation

        self.user_id = str(uuid4())
        self.product_id = str(uuid4())
        self.order_id = str(uuid4())
        self.category_id = str(uuid4())
        
        # Create dummy product and order for link to reference
        self.session.add(CategoryORM(id=self.category_id, name="Link Test Cat", slug="link-test-cat"))
        self.session.add(ProductORM(id=self.product_id, name="Link Prod", slug="link-prod",
                                    category_id=self.category_id, price_brl=1.0, price_usd=1.0,
                                    status=ProductStatus.ACTIVE, file_url="http://link.pdf"))
        self.session.add(OrderORM(id=self.order_id, user_id=self.user_id, customer_email="link@test.com",
                                  subtotal=1.0, tax=0.0, total=1.0, currency=CurrencyType.USD,
                                  payment_method=PaymentMethod.STRIPE, status=OrderStatus.PAID))
        self.session.commit()


    def tearDown(self):
        self.session.rollback()
        self.session.close()
        Base.metadata.drop_all(self.engine)

    def test_save_new_download_link(self):
        expires = datetime.now() + timedelta(days=1)
        link = DownloadLink(order_id=self.order_id, product_id=self.product_id, user_id=self.user_id, file_url="http://download.com/file.pdf", expires_at=expires)
        self.download_link_repo.save(link)

        retrieved = self.download_link_repo.get_by_id(link.id)
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.token, link.token)
        self.assertEqual(retrieved.file_url, "http://download.com/file.pdf")

    def test_get_by_token(self):
        expires = datetime.now() + timedelta(days=1)
        link = DownloadLink(order_id=self.order_id, product_id=self.product_id, user_id=self.user_id, file_url="http://download.com/file.pdf", expires_at=expires)
        self.download_link_repo.save(link)

        retrieved = self.download_link_repo.get_by_token(link.token)
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.id, link.id)

    def test_update_download_link(self):
        expires = datetime.now() + timedelta(days=1)
        link = DownloadLink(order_id=self.order_id, product_id=self.product_id, user_id=self.user_id, file_url="http://download.com/file.pdf", expires_at=expires)
        self.download_link_repo.save(link)

        link.download_count = 1
        link.is_active = False
        self.download_link_repo.save(link)

        updated_link = self.download_link_repo.get_by_id(link.id)
        self.assertEqual(updated_link.download_count, 1)
        self.assertFalse(updated_link.is_active)

    def test_delete_download_link(self):
        expires = datetime.now() + timedelta(days=1)
        link = DownloadLink(order_id=self.order_id, product_id=self.product_id, user_id=self.user_id, file_url="http://download.com/file.pdf", expires_at=expires)
        self.download_link_repo.save(link)

        self.download_link_repo.delete(link.id)
        retrieved = self.download_link_repo.get_by_id(link.id)
        self.assertIsNone(retrieved)
