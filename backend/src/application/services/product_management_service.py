from typing import Optional, List
from src.domain.repositories.product_repository import AbstractProductRepository, AbstractCategoryRepository
from src.domain.entities.product import Product, Category, ProductStatus
from datetime import datetime

class ProductManagementService:
    def __init__(self, product_repo: AbstractProductRepository, category_repo: AbstractCategoryRepository):
        self.product_repo = product_repo
        self.category_repo = category_repo

    def create_product(
        self,
        name: str,
        slug: str,
        category_id: str,
        price_brl: float,
        price_usd: float,
        description_short: Optional[str] = None,
        description_full: Optional[str] = None,
        file_url: Optional[str] = None,
        file_format: str = "pdf",
        author: Optional[str] = None,
        pages: Optional[int] = None
    ) -> Product:
        category = self.category_repo.get_by_id(category_id)
        if not category:
            raise ValueError(f"Category with ID {category_id} not found.")

        # Check for unique slug
        if self.product_repo.get_by_slug(slug):
            raise ValueError(f"Product with slug '{slug}' already exists.")

        new_product = Product(
            name=name,
            slug=slug,
            category_id=category_id,
            price_brl=price_brl,
            price_usd=price_usd,
            description_short=description_short,
            description_full=description_full,
            file_url=file_url,
            file_format=file_format,
            author=author,
            pages=pages,
            status=ProductStatus.DRAFT, # Always start as draft
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        self.product_repo.save(new_product)
        return new_product

    def get_product(self, product_id: str) -> Optional[Product]:
        return self.product_repo.get_by_id(product_id)
    
    def get_product_by_slug(self, slug: str) -> Optional[Product]:
        return self.product_repo.get_by_slug(slug)

    def list_products(self, status: Optional[ProductStatus] = None) -> List[Product]:
        return self.product_repo.get_all(status=status)

    def update_product(self, product_id: str, **kwargs) -> Product:
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise ValueError(f"Product with ID {product_id} not found.")

        # Update fields (handle slug uniqueness if changed)
        if 'slug' in kwargs and kwargs['slug'] != product.slug:
            if self.product_repo.get_by_slug(kwargs['slug']):
                raise ValueError(f"Product with slug '{kwargs['slug']}' already exists.")
        
        for key, value in kwargs.items():
            if hasattr(product, key):
                setattr(product, key, value)
        
        product.updated_at = datetime.now() # Manually update updated_at for changes
        self.product_repo.save(product)
        return product

    def publish_product(self, product_id: str) -> Product:
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise ValueError(f"Product with ID {product_id} not found.")
        
        # Domain logic from Product entity
        product.publish()
        self.product_repo.save(product)
        return product

    def archive_product(self, product_id: str) -> Product:
        product = self.product_repo.get_by_id(product_id)
        if not product:
            raise ValueError(f"Product with ID {product_id} not found.")
        
        # Domain logic from Product entity
        product.archive()
        self.product_repo.save(product)
        return product

    def delete_product(self, product_id: str) -> None:
        if not self.product_repo.get_by_id(product_id):
            raise ValueError(f"Product with ID {product_id} not found.")
        self.product_repo.delete(product_id)

    def create_category(self, name: str, slug: str, description: Optional[str] = None) -> Category:
        if self.category_repo.get_by_slug(slug):
            raise ValueError(f"Category with slug '{slug}' already exists.")
        
        new_category = Category(
            name=name,
            slug=slug,
            description=description,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        self.category_repo.save(new_category)
        return new_category

    def get_category(self, category_id: str) -> Optional[Category]:
        return self.category_repo.get_by_id(category_id)
    
    def get_category_by_slug(self, slug: str) -> Optional[Category]:
        return self.category_repo.get_by_slug(slug)

    def list_categories(self) -> List[Category]:
        return self.category_repo.get_all()

    def update_category(self, category_id: str, **kwargs) -> Category:
        category = self.category_repo.get_by_id(category_id)
        if not category:
            raise ValueError(f"Category with ID {category_id} not found.")
        
        # Update fields (handle slug uniqueness if changed)
        if 'slug' in kwargs and kwargs['slug'] != category.slug:
            if self.category_repo.get_by_slug(kwargs['slug']):
                raise ValueError(f"Category with slug '{kwargs['slug']}' already exists.")

        for key, value in kwargs.items():
            if hasattr(category, key):
                setattr(category, key, value)
        
        category.updated_at = datetime.now()
        self.category_repo.save(category)
        return category

    def delete_category(self, category_id: str) -> None:
        if not self.category_repo.get_by_id(category_id):
            raise ValueError(f"Category with ID {category_id} not found.")
        self.category_repo.delete(category_id)
