from typing import Optional, List
from datetime import datetime, timedelta
import uuid

from src.domain.entities.order import CartItem, Order, OrderItem, DownloadLink, OrderStatus, PaymentMethod, CurrencyType
from src.domain.entities.product import Product, ProductStatus
from src.domain.repositories.order_repository import AbstractCartRepository, AbstractOrderRepository, AbstractDownloadLinkRepository
from src.domain.repositories.product_repository import AbstractProductRepository
from src.application.services.payment_processing_service import PaymentProcessingService # NEW IMPORT

class OrderManagementService:
    def __init__(
        self,
        cart_repo: AbstractCartRepository,
        order_repo: AbstractOrderRepository,
        download_link_repo: AbstractDownloadLinkRepository,
        product_repo: AbstractProductRepository, # Dependency on Product domain
        payment_processing_service: PaymentProcessingService # NEW DEPENDENCY
    ):
        self.cart_repo = cart_repo
        self.order_repo = order_repo
        self.download_link_repo = download_link_repo
        self.product_repo = product_repo
        self.payment_processing_service = payment_processing_service # Assign

    # --- Cart Management ---
    def add_to_cart(self, user_id: str, product_id: str, quantity: int = 1) -> CartItem:
        if quantity <= 0:
            raise ValueError("Quantity must be positive.")
        
        product = self.product_repo.get_by_id(product_id)
        if not product or product.status != ProductStatus.ACTIVE:
            raise ValueError(f"Product with ID {product_id} not found or not active.")

        existing_item = self.cart_repo.get_item_by_user_and_product(user_id, product_id)

        if existing_item:
            existing_item.quantity += quantity
            existing_item.updated_at = datetime.now()
            self.cart_repo.save(existing_item)
            return existing_item
        else:
            new_item = CartItem(
                user_id=user_id,
                product_id=product_id,
                quantity=quantity
            )
            self.cart_repo.save(new_item)
            return new_item

    def update_cart_item_quantity(self, user_id: str, cart_item_id: str, new_quantity: int) -> CartItem:
        if new_quantity <= 0:
            return self.remove_from_cart(user_id, cart_item_id) # Remove if quantity is 0 or less

        cart_item = self.cart_repo.get_item_by_user_and_product(user_id, cart_item_id) # TODO: Adjust repo to get by cart_item_id and user_id
        if not cart_item or cart_item.user_id != user_id:
            raise ValueError(f"Cart item with ID {cart_item_id} not found for user {user_id}.")
        
        cart_item.quantity = new_quantity
        cart_item.updated_at = datetime.now()
        self.cart_repo.save(cart_item)
        return cart_item

    def remove_from_cart(self, user_id: str, cart_item_id: str) -> None:
        cart_item = self.cart_repo.get_item_by_user_and_product(user_id, cart_item_id) # TODO: Adjust repo to get by cart_item_id and user_id
        if not cart_item or cart_item.user_id != user_id:
            raise ValueError(f"Cart item with ID {cart_item_id} not found for user {user_id}.")
        self.cart_repo.delete(cart_item.id)

    def get_user_cart(self, user_id: str) -> List[CartItem]:
        return self.cart_repo.get_by_user_id(user_id)

    # --- Order Management ---
    def checkout(
        self,
        user_id: str,
        customer_email: str,
        customer_name: Optional[str],
        payment_method: PaymentMethod,
        currency: CurrencyType,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Order:
        cart_items = self.cart_repo.get_by_user_id(user_id)
        if not cart_items:
            raise ValueError("Cannot checkout an empty cart.")
        
        order_items: List[OrderItem] = []
        subtotal = 0.0

        for item in cart_items:
            product = self.product_repo.get_by_id(item.product_id)
            if not product or product.status != ProductStatus.ACTIVE:
                raise ValueError(f"Product {item.product_id} in cart is not active or found.")
            
            item_price = product.price_brl if currency == CurrencyType.BRL else product.price_usd
            item_subtotal = item_price * item.quantity
            subtotal += item_subtotal
            
            order_item = OrderItem(
                order_id="", # Will be set after order creation
                product_id=product.id,
                product_name=product.name,
                product_slug=product.slug,
                price=item_price,
                quantity=item.quantity,
                subtotal=item_subtotal,
                file_url=product.file_url # Snapshot file URL
            )
            order_items.append(order_item)
        
        # Assume tax is 0 for digital products or handled externally for simplicity here
        tax = 0.0 
        total = subtotal + tax

        new_order = Order(
            user_id=user_id,
            customer_email=customer_email,
            customer_name=customer_name,
            subtotal=subtotal,
            tax=tax,
            total=total,
            currency=currency,
            payment_method=payment_method,
            ip_address=ip_address,
            user_agent=user_agent,
            status=OrderStatus.PENDING,
            items=order_items
        )
        self.order_repo.save(new_order)

        # Set order_id for order_items
        for order_item in new_order.items:
            order_item.order_id = new_order.id

        self.cart_repo.clear_cart(user_id) # Clear user's cart after checkout

        return new_order
    
    def get_order_details(self, order_id: str) -> Optional[Order]:
        return self.order_repo.get_by_id(order_id)

    def list_orders(self, user_id: Optional[str] = None, status: Optional[OrderStatus] = None) -> List[Order]:
        return self.order_repo.get_all(user_id=user_id, status=status)

    def mark_order_paid(self, order_id: str, payment_intent_id: Optional[str] = None, stripe_session_id: Optional[str] = None, mercado_pago_id: Optional[str] = None) -> Order:
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise ValueError(f"Order with ID {order_id} not found.")

        # Assign external payment IDs to the order object first.
        # This will be stored even if verification fails, as part of history.
        order.payment_intent_id = payment_intent_id
        order.stripe_session_id = stripe_session_id
        order.mercado_pago_id = mercado_pago_id

        # VERIFY payment with the gateway via PaymentProcessingService
        # This is a basic verification; a full implementation might need more details
        # and handle different statuses (e.g., 'requires_action')
        payment_confirmed = False
        payment_details = None

        if order.payment_method == PaymentMethod.STRIPE and payment_intent_id:
            payment_details = self.payment_processing_service.get_payment_status(payment_intent_id)
            if payment_details.get("status") == "succeeded": # Gateway-specific status
                payment_confirmed = True
        elif order.payment_method == PaymentMethod.MERCADO_PAGO and mercado_pago_id:
            payment_details = self.payment_processing_service.get_payment_status(mercado_pago_id)
            if payment_details.get("status") == "approved": # Gateway-specific status
                payment_confirmed = True
        
        if not payment_confirmed:
            raise ValueError(f"Payment for order {order_id} could not be confirmed with the gateway. Status: {payment_details.get('status') if payment_details else 'unknown'}")

        order.mark_paid() # Domain logic
        self.order_repo.save(order)

        # Generate download links for digital products
        self._generate_download_links_for_order(order)
        
        return order
    
    def _generate_download_links_for_order(self, order: Order):
        for item in order.items:
            if item.file_url: # Only generate for items with a file URL
                expires_at = datetime.now() + timedelta(days=7) # Default 7 days expiry
                download_link = DownloadLink(
                    order_id=order.id,
                    product_id=item.product_id if item.product_id else "unknown", # Fallback for deleted products
                    user_id=order.user_id,
                    file_url=item.file_url,
                    expires_at=expires_at
                )
                self.download_link_repo.save(download_link)

    # --- Download Link Management ---
    def get_download_link_by_token(self, token: str) -> Optional[DownloadLink]:
        return self.download_link_repo.get_by_token(token)

    def track_download(self, token: str, ip_address: str) -> DownloadLink:
        download_link = self.download_link_repo.get_by_token(token)
        if not download_link:
            raise ValueError(f"Download link with token {token} not found.")
        
        download_link.increment_download_count(ip_address) # Domain logic
        self.download_link_repo.save(download_link)
        return download_link