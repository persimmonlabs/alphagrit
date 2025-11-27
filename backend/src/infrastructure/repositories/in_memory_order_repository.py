from typing import Optional, List, Dict
from src.domain.repositories.order_repository import AbstractCartRepository, AbstractOrderRepository, AbstractDownloadLinkRepository
from src.domain.entities.order import CartItem, Order, OrderItem, DownloadLink, OrderStatus

class InMemoryCartRepository(AbstractCartRepository):
    def __init__(self, initial_items: Optional[List[CartItem]] = None):
        self._items: Dict[str, CartItem] = {}
        if initial_items:
            for item in initial_items:
                self._items[item.id] = item

    def get_by_user_id(self, user_id: str) -> List[CartItem]:
        return [item for item in self._items.values() if item.user_id == user_id]

    def get_item_by_user_and_product(self, user_id: str, product_id: str) -> Optional[CartItem]:
        return next((item for item in self._items.values() if item.user_id == user_id and item.product_id == product_id), None)

    def save(self, cart_item: CartItem) -> None:
        self._items[cart_item.id] = cart_item

    def delete(self, cart_item_id: str) -> None:
        if cart_item_id in self._items:
            del self._items[cart_item_id]
            
    def clear_cart(self, user_id: str) -> None:
        items_to_delete = [item.id for item in self._items.values() if item.user_id == user_id]
        for item_id in items_to_delete:
            del self._items[item_id]


class InMemoryOrderRepository(AbstractOrderRepository):
    def __init__(self, initial_orders: Optional[List[Order]] = None):
        self._orders: Dict[str, Order] = {}
        if initial_orders:
            for order in initial_orders:
                self._orders[order.id] = order

    def get_by_id(self, order_id: str) -> Optional[Order]:
        return self._orders.get(order_id)

    def get_by_order_number(self, order_number: str) -> Optional[Order]:
        return next((order for order in self._orders.values() if order.order_number == order_number), None)

    def get_all(self, user_id: Optional[str] = None, status: Optional[OrderStatus] = None) -> List[Order]:
        filtered_orders = list(self._orders.values())
        if user_id:
            filtered_orders = [order for order in filtered_orders if order.user_id == user_id]
        if status:
            filtered_orders = [order for order in filtered_orders if order.status == status]
        return filtered_orders

    def save(self, order: Order) -> None:
        self._orders[order.id] = order

    def delete(self, order_id: str) -> None:
        if order_id in self._orders:
            del self._orders[order_id]


class InMemoryDownloadLinkRepository(AbstractDownloadLinkRepository):
    def __init__(self, initial_links: Optional[List[DownloadLink]] = None):
        self._links: Dict[str, DownloadLink] = {}
        if initial_links:
            for link in initial_links:
                self._links[link.id] = link

    def get_by_id(self, link_id: str) -> Optional[DownloadLink]:
        return self._links.get(link_id)

    def get_by_token(self, token: str) -> Optional[DownloadLink]:
        return next((link for link in self._links.values() if link.token == token), None)

    def get_by_order_and_product(self, order_id: str, product_id: str) -> Optional[DownloadLink]:
        return next((link for link in self._links.values() if link.order_id == order_id and link.product_id == product_id), None)

    def save(self, download_link: DownloadLink) -> None:
        self._links[download_link.id] = download_link

    def delete(self, link_id: str) -> None:
        if link_id in self._links:
            del self._links[link_id]
