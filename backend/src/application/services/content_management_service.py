from typing import Optional, List, Any
from datetime import datetime
import json # For JSONB handling

from src.domain.entities.content import BlogPost, FAQ, SiteConfigSetting, FeatureFlag, PostStatus
from src.domain.repositories.content_repository import (
    AbstractBlogPostRepository,
    AbstractFaqRepository,
    AbstractSiteConfigRepository,
    AbstractFeatureFlagRepository
)

class ContentManagementService:
    def __init__(
        self,
        blog_post_repo: AbstractBlogPostRepository,
        faq_repo: AbstractFaqRepository,
        site_config_repo: AbstractSiteConfigRepository,
        feature_flag_repo: AbstractFeatureFlagRepository
    ):
        self.blog_post_repo = blog_post_repo
        self.faq_repo = faq_repo
        self.site_config_repo = site_config_repo
        self.feature_flag_repo = feature_flag_repo

    # --- Blog Post Management ---
    def create_blog_post(
        self,
        title: str,
        slug: str,
        content: str,
        author_id: Optional[str] = None,
        author_name: Optional[str] = None,
        excerpt: Optional[str] = None,
        cover_image_url: Optional[str] = None
    ) -> BlogPost:
        if self.blog_post_repo.get_by_slug(slug):
            raise ValueError(f"Blog post with slug '{slug}' already exists.")
        
        new_post = BlogPost(
            title=title,
            slug=slug,
            content=content,
            author_id=author_id,
            author_name=author_name,
            excerpt=excerpt,
            cover_image_url=cover_image_url
        )
        self.blog_post_repo.save(new_post)
        return new_post

    def get_blog_post_by_id(self, post_id: str) -> Optional[BlogPost]:
        return self.blog_post_repo.get_by_id(post_id)

    def get_blog_post_by_slug(self, slug: str) -> Optional[BlogPost]:
        return self.blog_post_repo.get_by_slug(slug)

    def list_blog_posts(self, status: Optional[PostStatus] = None) -> List[BlogPost]:
        return self.blog_post_repo.get_all(status=status)

    def update_blog_post(self, post_id: str, **kwargs) -> BlogPost:
        post = self.blog_post_repo.get_by_id(post_id)
        if not post:
            raise ValueError(f"Blog post with ID {post_id} not found.")

        if 'slug' in kwargs and kwargs['slug'] != post.slug:
            if self.blog_post_repo.get_by_slug(kwargs['slug']):
                raise ValueError(f"Blog post with slug '{kwargs['slug']}' already exists.")

        for key, value in kwargs.items():
            if hasattr(post, key) and key not in ['id', 'created_at', 'published_at', 'views']:
                setattr(post, key, value)
        
        post.updated_at = datetime.now()
        self.blog_post_repo.save(post)
        return post

    def publish_blog_post(self, post_id: str) -> BlogPost:
        post = self.blog_post_repo.get_by_id(post_id)
        if not post:
            raise ValueError(f"Blog post with ID {post_id} not found.")
        post.publish()
        self.blog_post_repo.save(post)
        return post

    def archive_blog_post(self, post_id: str) -> BlogPost:
        post = self.blog_post_repo.get_by_id(post_id)
        if not post:
            raise ValueError(f"Blog post with ID {post_id} not found.")
        post.archive()
        self.blog_post_repo.save(post)
        return post

    def delete_blog_post(self, post_id: str) -> None:
        if not self.blog_post_repo.get_by_id(post_id):
            raise ValueError(f"Blog post with ID {post_id} not found.")
        self.blog_post_repo.delete(post_id)

    # --- FAQ Management ---
    def create_faq(
        self,
        question: str,
        answer: str,
        category: Optional[str] = None,
        display_order: int = 0,
        is_active: bool = True # NEW ARGUMENT
    ) -> FAQ:
        new_faq = FAQ(
            question=question,
            answer=answer,
            category=category,
            display_order=display_order,
            is_active=is_active # Pass to constructor
        )
        self.faq_repo.save(new_faq)
        return new_faq

    def get_faq_by_id(self, faq_id: str) -> Optional[FAQ]:
        return self.faq_repo.get_by_id(faq_id)

    def list_faqs(self, category: Optional[str] = None, is_active: Optional[bool] = None) -> List[FAQ]:
        return self.faq_repo.get_all(category=category, is_active=is_active)

    def update_faq(self, faq_id: str, **kwargs) -> FAQ:
        faq = self.faq_repo.get_by_id(faq_id)
        if not faq:
            raise ValueError(f"FAQ with ID {faq_id} not found.")
        
        for key, value in kwargs.items():
            if hasattr(faq, key) and key not in ['id', 'created_at']:
                setattr(faq, key, value)
        faq.updated_at = datetime.now()
        self.faq_repo.save(faq)
        return faq

    def delete_faq(self, faq_id: str) -> None:
        if not self.faq_repo.get_by_id(faq_id):
            raise ValueError(f"FAQ with ID {faq_id} not found.")
        self.faq_repo.delete(faq_id)

    # --- Site Configuration Management ---
    def get_site_setting(self, key: str) -> Optional[SiteConfigSetting]:
        return self.site_config_repo.get_by_key(key)

    def get_all_site_settings(self, is_public: Optional[bool] = None) -> List[SiteConfigSetting]:
        return self.site_config_repo.get_all(is_public=is_public)

    def update_site_setting(self, key: str, value: Any, value_type: str, description: Optional[str] = None, is_public: Optional[bool] = None) -> SiteConfigSetting:
        setting = self.site_config_repo.get_by_key(key)
        
        if not setting: # Create if not exists (upsert-like behavior)
            setting = SiteConfigSetting(
                key=key,
                value=value,
                value_type=value_type,
                description=description,
                is_public=is_public if is_public is not None else False
            )
        else:
            setting.value = value
            setting.value_type = value_type
            if description is not None:
                setting.description = description
            if is_public is not None:
                setting.is_public = is_public
            setting.updated_at = datetime.now()
        
        self.site_config_repo.save(setting)
        return setting

    # --- Feature Flag Management ---
    def get_feature_flag(self, key: str) -> Optional[FeatureFlag]:
        return self.feature_flag_repo.get_by_key(key)

    def get_all_feature_flags(self) -> List[FeatureFlag]:
        return self.feature_flag_repo.get_all()

    def update_feature_flag(self, key: str, is_enabled: bool, description: Optional[str] = None) -> FeatureFlag:
        flag = self.feature_flag_repo.get_by_key(key)
        
        if not flag: # Create if not exists (upsert-like behavior)
            flag = FeatureFlag(
                key=key,
                is_enabled=is_enabled,
                description=description
            )
        else:
            flag.is_enabled = is_enabled
            if description is not None:
                flag.description = description
            flag.updated_at = datetime.now()
        
        self.feature_flag_repo.save(flag)
        return flag

    def is_feature_enabled(self, key: str) -> bool:
        flag = self.feature_flag_repo.get_by_key(key)
        return flag.is_enabled if flag else False
