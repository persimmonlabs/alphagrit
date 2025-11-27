from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship, joinedload
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB # For PostgreSQL JSONB type
from sqlalchemy import JSON # For generic JSON type (used by SQLite)
import uuid
import json # For JSON (de)serialization
from typing import Optional, List, Any

from src.domain.entities.content import BlogPost, FAQ, SiteConfigSetting, FeatureFlag, PostStatus
from src.domain.entities.user import Profile, UserRole # For BlogPost.author_id reference
from src.domain.repositories.content_repository import (
    AbstractBlogPostRepository,
    AbstractFaqRepository,
    AbstractSiteConfigRepository,
    AbstractFeatureFlagRepository
)
from src.infrastructure.base import Base # Import Base from your dedicated base setup # Import Base from your database setup
from sqlalchemy.orm import Session


# SQLAlchemy ORM Models
class BlogPostORM(Base):
    __tablename__ = "blog_posts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    excerpt = Column(String(500), nullable=True)
    content = Column(Text, nullable=False)
    author_id = Column(String(36), ForeignKey("profiles.id"), nullable=True)
    author_name = Column(String(255), nullable=True)
    cover_image_url = Column(Text, nullable=True)
    status = Column(SQLEnum(PostStatus, name="post_status", create_type=False), default=PostStatus.DRAFT, nullable=False)
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(String(500), nullable=True)
    views = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)

    author = relationship("ProfileORM") # Unidirectional relationship for now

    def to_entity(self) -> BlogPost:
        return BlogPost(
            id=str(self.id),
            title=self.title,
            slug=self.slug,
            excerpt=self.excerpt,
            content=self.content,
            author_id=str(self.author_id) if self.author_id else None,
            author_name=self.author_name,
            cover_image_url=self.cover_image_url,
            status=self.status,
            meta_title=self.meta_title,
            meta_description=self.meta_description,
            views=self.views,
            created_at=self.created_at,
            updated_at=self.updated_at,
            published_at=self.published_at
        )

    @staticmethod
    def from_entity(entity: BlogPost) -> 'BlogPostORM':
        return BlogPostORM(
            id=entity.id,
            title=entity.title,
            slug=entity.slug,
            excerpt=entity.excerpt,
            content=entity.content,
            author_id=entity.author_id,
            author_name=entity.author_name,
            cover_image_url=entity.cover_image_url,
            status=entity.status,
            meta_title=entity.meta_title,
            meta_description=entity.meta_description,
            views=entity.views,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
            published_at=entity.published_at
        )

class FaqORM(Base):
    __tablename__ = "faqs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    def to_entity(self) -> FAQ:
        return FAQ(
            id=str(self.id),
            question=self.question,
            answer=self.answer,
            category=self.category,
            display_order=self.display_order,
            is_active=self.is_active,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

    @staticmethod
    def from_entity(entity: FAQ) -> 'FaqORM':
        return FaqORM(
            id=entity.id,
            question=entity.question,
            answer=entity.answer,
            category=entity.category,
            display_order=entity.display_order,
            is_active=entity.is_active,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )

class SiteConfigORM(Base):
    __tablename__ = "site_config"

    key = Column(String(100), primary_key=True)
    # Use JSONB for Postgres, JSON for generic (SQLite compatible)
    value = Column(JSON().with_variant(JSONB, 'postgresql'), nullable=True)
    value_type = Column(String(50), default="string", nullable=True)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    def to_entity(self) -> SiteConfigSetting:
        return SiteConfigSetting(
            key=self.key,
            value=self.value,
            value_type=self.value_type,
            description=self.description,
            is_public=self.is_public,
            updated_at=self.updated_at
        )

    @staticmethod
    def from_entity(entity: SiteConfigSetting) -> 'SiteConfigORM':
        return SiteConfigORM(
            key=entity.key,
            value=entity.value,
            value_type=entity.value_type,
            description=entity.description,
            is_public=entity.is_public,
            updated_at=entity.updated_at
        )

class FeatureFlagORM(Base):
    __tablename__ = "feature_flags"

    key = Column(String(100), primary_key=True)
    is_enabled = Column(Boolean, default=False, nullable=False)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    def to_entity(self) -> FeatureFlag:
        return FeatureFlag(
            key=self.key,
            is_enabled=self.is_enabled,
            description=self.description,
            updated_at=self.updated_at
        )

    @staticmethod
    def from_entity(entity: FeatureFlag) -> 'FeatureFlagORM':
        return FeatureFlagORM(
            key=entity.key,
            is_enabled=entity.is_enabled,
            description=entity.description,
            updated_at=entity.updated_at
        )

# SQLAlchemy Repository Implementations
class SQLAlchemyBlogPostRepository(AbstractBlogPostRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, post_id: str) -> Optional[BlogPost]:
        orm_post = self.session.query(BlogPostORM).filter_by(id=post_id).first()
        return orm_post.to_entity() if orm_post else None

    def get_by_slug(self, slug: str) -> Optional[BlogPost]:
        orm_post = self.session.query(BlogPostORM).filter_by(slug=slug).first()
        return orm_post.to_entity() if orm_post else None

    def get_all(self, status: Optional[PostStatus] = None) -> List[BlogPost]:
        query = self.session.query(BlogPostORM)
        if status:
            query = query.filter_by(status=status)
        return [orm_post.to_entity() for orm_post in query.all()]

    def save(self, blog_post: BlogPost) -> None:
        orm_post = self.session.query(BlogPostORM).filter_by(id=blog_post.id).first()
        if orm_post:
            for key, value in BlogPostORM.from_entity(blog_post).__dict__.items():
                if not key.startswith('_'):
                    setattr(orm_post, key, value)
        else:
            self.session.add(BlogPostORM.from_entity(blog_post))
        self.session.commit()

    def delete(self, post_id: str) -> None:
        orm_post = self.session.query(BlogPostORM).filter_by(id=post_id).first()
        if orm_post:
            self.session.delete(orm_post)
            self.session.commit()

class SQLAlchemyFaqRepository(AbstractFaqRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, faq_id: str) -> Optional[FAQ]:
        orm_faq = self.session.query(FaqORM).filter_by(id=faq_id).first()
        return orm_faq.to_entity() if orm_faq else None

    def get_all(self, category: Optional[str] = None, is_active: Optional[bool] = None) -> List[FAQ]:
        query = self.session.query(FaqORM)
        if category:
            query = query.filter_by(category=category)
        if is_active is not None:
            query = query.filter_by(is_active=is_active)
        return [orm_faq.to_entity() for orm_faq in query.all()]

    def save(self, faq: FAQ) -> None:
        orm_faq = self.session.query(FaqORM).filter_by(id=faq.id).first()
        if orm_faq:
            for key, value in FaqORM.from_entity(faq).__dict__.items():
                if not key.startswith('_'):
                    setattr(orm_faq, key, value)
        else:
            self.session.add(FaqORM.from_entity(faq))
        self.session.commit()

    def delete(self, faq_id: str) -> None:
        orm_faq = self.session.query(FaqORM).filter_by(id=faq_id).first()
        if orm_faq:
            self.session.delete(orm_faq)
            self.session.commit()

class SQLAlchemySiteConfigRepository(AbstractSiteConfigRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_key(self, key: str) -> Optional[SiteConfigSetting]:
        orm_setting = self.session.query(SiteConfigORM).filter_by(key=key).first()
        return orm_setting.to_entity() if orm_setting else None

    def get_all(self, is_public: Optional[bool] = None) -> List[SiteConfigSetting]:
        query = self.session.query(SiteConfigORM)
        if is_public is not None:
            query = query.filter_by(is_public=is_public)
        return [orm_setting.to_entity() for orm_setting in query.all()]

    def save(self, setting: SiteConfigSetting) -> None:
        orm_setting = self.session.query(SiteConfigORM).filter_by(key=setting.key).first()
        if orm_setting:
            # Update existing
            # Note: value (JSON) assignment needs careful handling
            orm_setting.value = setting.value
            orm_setting.value_type = setting.value_type
            orm_setting.description = setting.description
            orm_setting.is_public = setting.is_public
            orm_setting.updated_at = setting.updated_at
        else:
            self.session.add(SiteConfigORM.from_entity(setting))
        self.session.commit()

class SQLAlchemyFeatureFlagRepository(AbstractFeatureFlagRepository):
    def __init__(self, session: Session):
        self.session = session

    def get_by_key(self, key: str) -> Optional[FeatureFlag]:
        orm_flag = self.session.query(FeatureFlagORM).filter_by(key=key).first()
        return orm_flag.to_entity() if orm_flag else None

    def get_all(self) -> List[FeatureFlag]:
        return [orm_flag.to_entity() for orm_flag in self.session.query(FeatureFlagORM).all()]

    def save(self, feature_flag: FeatureFlag) -> None:
        orm_flag = self.session.query(FeatureFlagORM).filter_by(key=feature_flag.key).first()
        if orm_flag:
            orm_flag.is_enabled = feature_flag.is_enabled
            orm_flag.description = feature_flag.description
            orm_flag.updated_at = feature_flag.updated_at
        else:
            self.session.add(FeatureFlagORM.from_entity(feature_flag))
        self.session.commit()
