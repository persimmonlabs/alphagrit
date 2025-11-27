from typing import Optional, List, Dict
from src.domain.repositories.product_repository import AbstractProductRepository, AbstractCategoryRepository
from src.domain.entities.product import Product, Category, ProductStatus

class InMemoryProductRepository(AbstractProductRepository):
    def __init__(self, initial_products: Optional[List[Product]] = None):
        self._products: Dict[str, Product] = {p.id: p for p in (initial_products or [])}

    def get_by_id(self, product_id: str) -> Optional[Product]:
        return self._products.get(product_id)

    def get_by_slug(self, slug: str) -> Optional[Product]:
        return next((p for p in self._products.values() if p.slug == slug), None)

    def get_all(self, status: Optional[ProductStatus] = None) -> List[Product]:
        if status:
            return [p for p in self._products.values() if p.status == status]
        return list(self._products.values())

    def save(self, product: Product) -> None:
        self._products[product.id] = product

    def delete(self, product_id: str) -> None:
        if product_id in self._products:
            del self._products[product_id]

class InMemoryCategoryRepository(AbstractCategoryRepository):
    def __init__(self, initial_categories: Optional[List[Category]] = None):
        self._categories: Dict[str, Category] = {c.id: c for c in (initial_categories or [])}

    def get_by_id(self, category_id: str) -> Optional[Category]:
        return self._categories.get(category_id)

    def get_by_slug(self, slug: str) -> Optional[Category]:
        return next((c for c in self._categories.values() if c.slug == slug), None)

    def get_all(self) -> List[Category]:
        return list(self._categories.values())

    def save(self, category: Category) -> None:
        self._categories[category.id] = category

    def delete(self, category_id: str) -> None:
        if category_id in self._categories:
            del self._categories[category_id]
