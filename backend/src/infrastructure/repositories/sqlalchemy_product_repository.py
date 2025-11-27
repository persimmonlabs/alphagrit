from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from typing import Optional, List

from src.domain.entities.product import Product, Category, ProductStatus, CurrencyType
from src.domain.repositories.product_repository import AbstractProductRepository, AbstractCategoryRepository
from src.infrastructure.base import Base # Import Base from your dedicated base setup
from sqlalchemy.orm import Session


# SQLAlchemy ORM Models
class CategoryORM(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    products = relationship("ProductORM", back_populates="category")

    def to_entity(self) -> Category:
        return Category(
            id=str(self.id),
            name=self.name,
            slug=self.slug,
            description=self.description,
            display_order=self.display_order,
            is_active=self.is_active,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

    @staticmethod
    def from_entity(entity: Category) -> 'CategoryORM':
        return CategoryORM(
            id=entity.id,
            name=entity.name,
            slug=entity.slug,
            description=entity.description,
            display_order=entity.display_order,
            is_active=entity.is_active,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )


class ProductORM(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description_short = Column(String(500), nullable=True)
    description_full = Column(Text, nullable=True)
    category_id = Column(String(36), ForeignKey("categories.id"), nullable=True)
    price_brl = Column(Float, nullable=False)
    price_usd = Column(Float, nullable=False)
    stripe_product_id = Column(String(255), nullable=True)
    stripe_price_id_brl = Column(String(255), nullable=True)
    stripe_price_id_usd = Column(String(255), nullable=True)
    cover_image_url = Column(Text, nullable=True)
    file_url = Column(Text, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    file_format = Column(String(20), default="pdf")
    author = Column(String(255), nullable=True)
    pages = Column(Integer, nullable=True)
    rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    total_sales = Column(Integer, default=0)
    status = Column(SQLEnum(ProductStatus, name="product_status_enum", create_type=False), default=ProductStatus.DRAFT, nullable=False) # Use existing ENUM
    is_featured = Column(Boolean, default=False)
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)

    category = relationship("CategoryORM", back_populates="products")

    def to_entity(self) -> Product:
        return Product(
            id=str(self.id),
            name=self.name,
            slug=self.slug,
            description_short=self.description_short,
            description_full=self.description_full,
            category_id=str(self.category_id) if self.category_id else None,
            price_brl=self.price_brl,
            price_usd=self.price_usd,
            stripe_product_id=self.stripe_product_id,
            stripe_price_id_brl=self.stripe_price_id_brl,
            stripe_price_id_usd=self.stripe_price_id_usd,
            cover_image_url=self.cover_image_url,
            file_url=self.file_url,
            file_size_bytes=self.file_size_bytes,
            file_format=self.file_format,
            author=self.author,
            pages=self.pages,
            rating=self.rating,
            total_reviews=self.total_reviews,
            total_sales=self.total_sales,
            status=self.status,
            is_featured=self.is_featured,
            meta_title=self.meta_title,
            meta_description=self.meta_description,
            created_at=self.created_at,
            updated_at=self.updated_at,
            published_at=self.published_at
        )

    @staticmethod
    def from_entity(entity: Product) -> 'ProductORM':
        return ProductORM(
            id=entity.id,
            name=entity.name,
            slug=entity.slug,
            description_short=entity.description_short,
            description_full=entity.description_full,
            category_id=entity.category_id if entity.category_id else None,
            price_brl=entity.price_brl,
            price_usd=entity.price_usd,
            stripe_product_id=entity.stripe_product_id,
            stripe_price_id_brl=entity.stripe_price_id_brl,
            stripe_price_id_usd=entity.stripe_price_id_usd,
            cover_image_url=entity.cover_image_url,
            file_url=entity.file_url,
            file_size_bytes=entity.file_size_bytes,
            file_format=entity.file_format,
            author=entity.author,
            pages=entity.pages,
            rating=entity.rating,
            total_reviews=entity.total_reviews,
            total_sales=entity.total_sales,
            status=entity.status,
            is_featured=entity.is_featured,
            meta_title=entity.meta_title,
            meta_description=entity.meta_description,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
            published_at=entity.published_at
        )


# SQLAlchemy Repository Implementations
class SQLAlchemyProductRepository(AbstractProductRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, product_id: str) -> Optional[Product]:
        orm_product = self.session.query(ProductORM).filter_by(id=product_id).first()
        return orm_product.to_entity() if orm_product else None

    def get_by_slug(self, slug: str) -> Optional[Product]:
        orm_product = self.session.query(ProductORM).filter_by(slug=slug).first()
        return orm_product.to_entity() if orm_product else None

    def get_all(self, status: Optional[ProductStatus] = None) -> List[Product]:
        query = self.session.query(ProductORM)
        if status:
            query = query.filter_by(status=status)
        return [orm_product.to_entity() for orm_product in query.all()]

    def save(self, product: Product) -> None:
        orm_product = self.session.query(ProductORM).filter_by(id=product.id).first()
        if orm_product:
            # Update existing
            for key, value in ProductORM.from_entity(product).__dict__.items():
                if not key.startswith('_'): # Avoid internal SQLAlchemy attributes
                    setattr(orm_product, key, value)
        else:
            # Add new
            self.session.add(ProductORM.from_entity(product))
        self.session.commit()

    def delete(self, product_id: str) -> None:
        self.session.query(ProductORM).filter_by(id=product_id).delete()
        self.session.commit()


class SQLAlchemyCategoryRepository(AbstractCategoryRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, category_id: str) -> Optional[Category]:
        orm_category = self.session.query(CategoryORM).filter_by(id=category_id).first()
        return orm_category.to_entity() if orm_category else None

    def get_by_slug(self, slug: str) -> Optional[Category]:
        orm_category = self.session.query(CategoryORM).filter_by(slug=slug).first()
        return orm_category.to_entity() if orm_category else None

    def get_all(self) -> List[Category]:
        return [orm_category.to_entity() for orm_category in self.session.query(CategoryORM).all()]

    def save(self, category: Category) -> None:
        orm_category = self.session.query(CategoryORM).filter_by(id=category.id).first()
        if orm_category:
            # Update existing
            for key, value in CategoryORM.from_entity(category).__dict__.items():
                if not key.startswith('_'): # Avoid internal SQLAlchemy attributes
                    setattr(orm_category, key, value)
        else:
            # Add new
            self.session.add(CategoryORM.from_entity(category))
        self.session.commit()

    def delete(self, category_id: str) -> None:
        self.session.query(CategoryORM).filter_by(id=category_id).delete()
        self.session.commit()