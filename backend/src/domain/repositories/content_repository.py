from abc import ABC, abstractmethod
from typing import Optional, List, Any
from src.domain.entities.content import BlogPost, FAQ, SiteConfigSetting, FeatureFlag, PostStatus

class AbstractBlogPostRepository(ABC):
    @abstractmethod
    def get_by_id(self, post_id: str) -> Optional[BlogPost]:
        pass

    @abstractmethod
    def get_by_slug(self, slug: str) -> Optional[BlogPost]:
        pass

    @abstractmethod
    def get_all(self, status: Optional[PostStatus] = None) -> List[BlogPost]:
        pass

    @abstractmethod
    def save(self, blog_post: BlogPost) -> None:
        pass

    @abstractmethod
    def delete(self, post_id: str) -> None:
        pass

class AbstractFaqRepository(ABC):
    @abstractmethod
    def get_by_id(self, faq_id: str) -> Optional[FAQ]:
        pass

    @abstractmethod
    def get_all(self, category: Optional[str] = None, is_active: Optional[bool] = None) -> List[FAQ]:
        pass

    @abstractmethod
    def save(self, faq: FAQ) -> None:
        pass

    @abstractmethod
    def delete(self, faq_id: str) -> None:
        pass

class AbstractSiteConfigRepository(ABC):
    @abstractmethod
    def get_by_key(self, key: str) -> Optional[SiteConfigSetting]:
        pass

    @abstractmethod
    def get_all(self, is_public: Optional[bool] = None) -> List[SiteConfigSetting]:
        pass

    @abstractmethod
    def save(self, setting: SiteConfigSetting) -> None:
        pass

class AbstractFeatureFlagRepository(ABC):
    @abstractmethod
    def get_by_key(self, key: str) -> Optional[FeatureFlag]:
        pass

    @abstractmethod
    def get_all(self) -> List[FeatureFlag]:
        pass

    @abstractmethod
    def save(self, feature_flag: FeatureFlag) -> None:
        pass
