from abc import ABC, abstractmethod
from typing import Optional, List
from src.domain.entities.product import Product, Category, ProductStatus

class AbstractProductRepository(ABC):
    @abstractmethod
    def get_by_id(self, product_id: str) -> Optional[Product]:
        pass

    @abstractmethod
    def get_by_slug(self, slug: str) -> Optional[Product]:
        pass

    @abstractmethod
    def get_all(self, status: Optional[ProductStatus] = None) -> List[Product]:
        pass

    @abstractmethod
    def save(self, product: Product) -> None:
        pass

    @abstractmethod
    def delete(self, product_id: str) -> None:
        pass

class AbstractCategoryRepository(ABC):
    @abstractmethod
    def get_by_id(self, category_id: str) -> Optional[Category]:
        pass

    @abstractmethod
    def get_by_slug(self, slug: str) -> Optional[Category]:
        pass

    @abstractmethod
    def get_all(self) -> List[Category]:
        pass

    @abstractmethod
    def save(self, category: Category) -> None:
        pass

    @abstractmethod
    def delete(self, category_id: str) -> None:
        pass
