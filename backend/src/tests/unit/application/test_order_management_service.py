import unittest
from unittest.mock import Mock, ANY
from datetime import datetime, timedelta
from uuid import uuid4

from src.domain.entities.order import CartItem, Order, OrderItem, DownloadLink, OrderStatus, PaymentMethod, CurrencyType
from src.domain.entities.product import Product, ProductStatus
from src.domain.repositories.order_repository import AbstractCartRepository, AbstractOrderRepository, AbstractDownloadLinkRepository
from src.domain.repositories.product_repository import AbstractProductRepository
from src.application.services.order_management_service import OrderManagementService
from src.application.services.payment_processing_service import PaymentProcessingService

class TestOrderManagementService(unittest.TestCase):
    def setUp(self):
        self.mock_cart_repo: AbstractCartRepository = Mock(spec=AbstractCartRepository)
        self.mock_order_repo: AbstractOrderRepository = Mock(spec=AbstractOrderRepository)
        self.mock_download_link_repo: AbstractDownloadLinkRepository = Mock(spec=AbstractDownloadLinkRepository)
        self.mock_product_repo: AbstractProductRepository = Mock(spec=AbstractProductRepository)
        self.mock_payment_processing_service: PaymentProcessingService = Mock(spec=PaymentProcessingService)
        self.service = OrderManagementService(
            self.mock_cart_repo,
            self.mock_order_repo,
            self.mock_download_link_repo,
            self.mock_product_repo,
            self.mock_payment_processing_service
        )

        self.user_id = str(uuid4())
        self.product_id_active = str(uuid4())
        self.product_id_draft = str(uuid4())
        self.product_active = Product(
            id=self.product_id_active, name="Active Product", slug="active-product",
            price_brl=50.0, price_usd=10.0, status=ProductStatus.ACTIVE, file_url="http://active.pdf"
        )
        self.product_draft = Product(
            id=self.product_id_draft, name="Draft Product", slug="draft-product",
            price_brl=50.0, price_usd=10.0, status=ProductStatus.DRAFT, file_url="http://draft.pdf"
        )

        self.mock_product_repo.get_by_id.side_effect = \
            lambda pid: self.product_active if pid == self.product_id_active else \
                        (self.product_draft if pid == self.product_id_draft else None)