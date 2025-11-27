from abc import ABC, abstractmethod
from typing import Optional, List
from src.domain.entities.order import CartItem, Order, OrderItem, DownloadLink, OrderStatus

class AbstractCartRepository(ABC):
    @abstractmethod
    def get_by_user_id(self, user_id: str) -> List[CartItem]:
        pass

    @abstractmethod
    def get_item_by_user_and_product(self, user_id: str, product_id: str) -> Optional[CartItem]:
        pass

    @abstractmethod
    def save(self, cart_item: CartItem) -> None:
        pass

    @abstractmethod
    def delete(self, cart_item_id: str) -> None:
        pass

    @abstractmethod
    def clear_cart(self, user_id: str) -> None:
        pass

class AbstractOrderRepository(ABC):
    @abstractmethod
    def get_by_id(self, order_id: str) -> Optional[Order]:
        pass
    
    @abstractmethod
    def get_by_order_number(self, order_number: str) -> Optional[Order]:
        pass

    @abstractmethod
    def get_all(self, user_id: Optional[str] = None, status: Optional[OrderStatus] = None) -> List[Order]:
        pass

    @abstractmethod
    def save(self, order: Order) -> None:
        pass

    @abstractmethod
    def delete(self, order_id: str) -> None:
        pass

class AbstractDownloadLinkRepository(ABC):
    @abstractmethod
    def get_by_id(self, link_id: str) -> Optional[DownloadLink]:
        pass

    @abstractmethod
    def get_by_token(self, token: str) -> Optional[DownloadLink]:
        pass

    @abstractmethod
    def get_by_order_and_product(self, order_id: str, product_id: str) -> Optional[DownloadLink]:
        pass

    @abstractmethod
    def save(self, download_link: DownloadLink) -> None:
        pass

    @abstractmethod
    def delete(self, link_id: str) -> None:
        pass
