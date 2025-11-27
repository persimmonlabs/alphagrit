from typing import Optional, List, Dict, Any
from src.domain.repositories.content_repository import (
    AbstractBlogPostRepository,
    AbstractFaqRepository,
    AbstractSiteConfigRepository,
    AbstractFeatureFlagRepository
)
from src.domain.entities.content import BlogPost, FAQ, SiteConfigSetting, FeatureFlag, PostStatus

class InMemoryBlogPostRepository(AbstractBlogPostRepository):
    def __init__(self, initial_posts: Optional[List[BlogPost]] = None):
        self._posts: Dict[str, BlogPost] = {}
        if initial_posts:
            for post in initial_posts:
                self._posts[post.id] = post

    def get_by_id(self, post_id: str) -> Optional[BlogPost]:
        return self._posts.get(post_id)

    def get_by_slug(self, slug: str) -> Optional[BlogPost]:
        return next((p for p in self._posts.values() if p.slug == slug), None)

    def get_all(self, status: Optional[PostStatus] = None) -> List[BlogPost]:
        if status:
            return [p for p in self._posts.values() if p.status == status]
        return list(self._posts.values())

    def save(self, blog_post: BlogPost) -> None:
        self._posts[blog_post.id] = blog_post

    def delete(self, post_id: str) -> None:
        if post_id in self._posts:
            del self._posts[post_id]

class InMemoryFaqRepository(AbstractFaqRepository):
    def __init__(self, initial_faqs: Optional[List[FAQ]] = None):
        self._faqs: Dict[str, FAQ] = {}
        if initial_faqs:
            for faq in initial_faqs:
                self._faqs[faq.id] = faq

    def get_by_id(self, faq_id: str) -> Optional[FAQ]:
        return self._faqs.get(faq_id)

    def get_all(self, category: Optional[str] = None, is_active: Optional[bool] = None) -> List[FAQ]:
        filtered_faqs = list(self._faqs.values())
        if category:
            filtered_faqs = [f for f in filtered_faqs if f.category == category]
        if is_active is not None:
            filtered_faqs = [f for f in filtered_faqs if f.is_active == is_active]
        return filtered_faqs

    def save(self, faq: FAQ) -> None:
        self._faqs[faq.id] = faq

    def delete(self, faq_id: str) -> None:
        if faq_id in self._faqs:
            del self._faqs[faq_id]

class InMemorySiteConfigRepository(AbstractSiteConfigRepository):
    def __init__(self, initial_settings: Optional[List[SiteConfigSetting]] = None):
        self._settings: Dict[str, SiteConfigSetting] = {}
        if initial_settings:
            for setting in initial_settings:
                self._settings[setting.key] = setting

    def get_by_key(self, key: str) -> Optional[SiteConfigSetting]:
        return self._settings.get(key)

    def get_all(self, is_public: Optional[bool] = None) -> List[SiteConfigSetting]:
        if is_public is not None:
            return [s for s in self._settings.values() if s.is_public == is_public]
        return list(self._settings.values())

    def save(self, setting: SiteConfigSetting) -> None:
        self._settings[setting.key] = setting

class InMemoryFeatureFlagRepository(AbstractFeatureFlagRepository):
    def __init__(self, initial_flags: Optional[List[FeatureFlag]] = None):
        self._flags: Dict[str, FeatureFlag] = {}
        if initial_flags:
            for flag in initial_flags:
                self._flags[flag.key] = flag

    def get_by_key(self, key: str) -> Optional[FeatureFlag]:
        return self._flags.get(key)

    def get_all(self) -> List[FeatureFlag]:
        return list(self._flags.values())

    def save(self, feature_flag: FeatureFlag) -> None:
        self._flags[feature_flag.key] = feature_flag
