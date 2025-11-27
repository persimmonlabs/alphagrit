import unittest
from unittest.mock import Mock, ANY
from datetime import datetime, timedelta
from uuid import uuid4
import json

from src.domain.entities.content import BlogPost, FAQ, SiteConfigSetting, FeatureFlag, PostStatus
from src.domain.repositories.content_repository import (
    AbstractBlogPostRepository,
    AbstractFaqRepository,
    AbstractSiteConfigRepository,
    AbstractFeatureFlagRepository
)
from src.application.services.content_management_service import ContentManagementService

class TestContentManagementService(unittest.TestCase):
    def setUp(self):
        self.mock_blog_post_repo: AbstractBlogPostRepository = Mock(spec=AbstractBlogPostRepository)
        self.mock_faq_repo: AbstractFaqRepository = Mock(spec=AbstractFaqRepository)
        self.mock_site_config_repo: AbstractSiteConfigRepository = Mock(spec=AbstractSiteConfigRepository)
        self.mock_feature_flag_repo: AbstractFeatureFlagRepository = Mock(spec=AbstractFeatureFlagRepository)
        
        self.service = ContentManagementService(
            self.mock_blog_post_repo,
            self.mock_faq_repo,
            self.mock_site_config_repo,
            self.mock_feature_flag_repo
        )

        self.blog_post_id = str(uuid4())
        self.blog_post_slug = "test-post"
        self.blog_post = BlogPost(id=self.blog_post_id, title="Test Post", slug=self.blog_post_slug, content="Content.", updated_at=datetime(2020,1,1))
        
        self.faq_id = str(uuid4())
        self.faq_question = "What is it?"
        self.faq = FAQ(id=self.faq_id, question=self.faq_question, answer="An answer.", updated_at=datetime(2020,1,1))
        
        self.site_config_key = "site_name"
        self.site_config_setting = SiteConfigSetting(key=self.site_config_key, value="Alpha Grit", value_type="string", updated_at=datetime(2020,1,1))

        self.feature_flag_key = "new_feature"
        self.feature_flag = FeatureFlag(key=self.feature_flag_key, is_enabled=False, updated_at=datetime(2020,1,1))

    # --- Blog Post Tests ---
    def test_create_blog_post_success(self):
        self.mock_blog_post_repo.get_by_slug.return_value = None
        post = self.service.create_blog_post(title="New Post", slug="new-post", content="New Content.")
        
        self.assertIsInstance(post, BlogPost)
        self.assertEqual(post.title, "New Post")
        self.assertEqual(post.status, PostStatus.DRAFT)
        self.mock_blog_post_repo.save.assert_called_once_with(ANY)

    def test_create_blog_post_slug_exists_raises_error(self):
        self.mock_blog_post_repo.get_by_slug.return_value = self.blog_post
        
        with self.assertRaises(ValueError, msg="Blog post with slug 'test-post' already exists."):
            self.service.create_blog_post(title="Another Post", slug="test-post", content="Content.")
        self.mock_blog_post_repo.save.assert_not_called()

    def test_get_blog_post_by_id_success(self):
        self.mock_blog_post_repo.get_by_id.return_value = self.blog_post
        post = self.service.get_blog_post_by_id(self.blog_post_id)
        self.assertEqual(post, self.blog_post)
        self.mock_blog_post_repo.get_by_id.assert_called_once_with(self.blog_post_id)

    def test_list_blog_posts_all(self):
        self.mock_blog_post_repo.get_all.return_value = [self.blog_post]
        posts = self.service.list_blog_posts()
        self.assertEqual(len(posts), 1)
        self.mock_blog_post_repo.get_all.assert_called_once_with(status=None)

    def test_update_blog_post_success(self):
        self.mock_blog_post_repo.get_by_id.return_value = self.blog_post
        self.mock_blog_post_repo.get_by_slug.return_value = None # New slug is unique
        
        old_updated_at = self.blog_post.updated_at
        updated_post = self.service.update_blog_post(self.blog_post_id, title="Updated Title", slug="updated-slug")
        
        self.assertEqual(updated_post.title, "Updated Title")
        self.assertEqual(updated_post.slug, "updated-slug")
        self.mock_blog_post_repo.save.assert_called_once_with(self.blog_post)
        self.assertTrue(updated_post.updated_at > old_updated_at)

    def test_publish_blog_post_success(self):
        self.mock_blog_post_repo.get_by_id.return_value = self.blog_post
        
        old_updated_at = self.blog_post.updated_at
        published_post = self.service.publish_blog_post(self.blog_post_id)
        
        self.assertEqual(published_post.status, PostStatus.PUBLISHED)
        self.assertIsNotNone(published_post.published_at)
        self.mock_blog_post_repo.save.assert_called_once_with(self.blog_post)
        self.assertTrue(published_post.updated_at > old_updated_at)

    def test_delete_blog_post_success(self):
        self.mock_blog_post_repo.get_by_id.return_value = self.blog_post
        self.service.delete_blog_post(self.blog_post_id)
        self.mock_blog_post_repo.delete.assert_called_once_with(self.blog_post_id)

    # --- FAQ Tests ---
    def test_create_faq_success(self):
        faq = self.service.create_faq(question="New Q", answer="New A", category="General")
        self.assertIsInstance(faq, FAQ)
        self.assertEqual(faq.question, "New Q")
        self.mock_faq_repo.save.assert_called_once_with(ANY)

    def test_get_faq_by_id_success(self):
        self.mock_faq_repo.get_by_id.return_value = self.faq
        faq = self.service.get_faq_by_id(self.faq_id)
        self.assertEqual(faq, self.faq)
        self.mock_faq_repo.get_by_id.assert_called_once_with(self.faq_id)
    
    def test_list_faqs_all(self):
        self.mock_faq_repo.get_all.return_value = [self.faq]
        faqs = self.service.list_faqs()
        self.assertEqual(len(faqs), 1)
        self.mock_faq_repo.get_all.assert_called_once_with(category=None, is_active=None)

    def test_update_faq_success(self):
        self.mock_faq_repo.get_by_id.return_value = self.faq
        old_updated_at = self.faq.updated_at
        
        updated_faq = self.service.update_faq(self.faq_id, question="Updated Question", is_active=False)
        self.assertEqual(updated_faq.question, "Updated Question")
        self.assertFalse(updated_faq.is_active)
        self.mock_faq_repo.save.assert_called_once_with(self.faq)
        self.assertTrue(updated_faq.updated_at > old_updated_at)

    def test_delete_faq_success(self):
        self.mock_faq_repo.get_by_id.return_value = self.faq
        self.service.delete_faq(self.faq_id)
        self.mock_faq_repo.delete.assert_called_once_with(self.faq_id)

    # --- Site Config Tests ---
    def test_get_site_setting_success(self):
        self.mock_site_config_repo.get_by_key.return_value = self.site_config_setting
        setting = self.service.get_site_setting(self.site_config_key)
        self.assertEqual(setting, self.site_config_setting)
        self.mock_site_config_repo.get_by_key.assert_called_once_with(self.site_config_key)

    def test_get_all_site_settings(self):
        self.mock_site_config_repo.get_all.return_value = [self.site_config_setting]
        settings = self.service.get_all_site_settings()
        self.assertEqual(len(settings), 1)
        self.mock_site_config_repo.get_all.assert_called_once_with(is_public=None)

    def test_update_site_setting_new(self):
        self.mock_site_config_repo.get_by_key.return_value = None
        setting = self.service.update_site_setting("new_key", "new_val", "string")
        self.assertIsInstance(setting, SiteConfigSetting)
        self.assertEqual(setting.key, "new_key")
        self.assertEqual(setting.value, "new_val")
        self.mock_site_config_repo.save.assert_called_once_with(ANY)

    def test_update_site_setting_existing(self):
        self.mock_site_config_repo.get_by_key.return_value = self.site_config_setting
        old_updated_at = self.site_config_setting.updated_at
        
        updated_setting = self.service.update_site_setting(self.site_config_key, "New Site Name", "string", description="Updated")
        self.assertEqual(updated_setting.value, "New Site Name")
        self.assertEqual(updated_setting.description, "Updated")
        self.mock_site_config_repo.save.assert_called_once_with(self.site_config_setting)
        self.assertTrue(updated_setting.updated_at > old_updated_at)

    # --- Feature Flag Tests ---
    def test_get_feature_flag_success(self):
        self.mock_feature_flag_repo.get_by_key.return_value = self.feature_flag
        flag = self.service.get_feature_flag(self.feature_flag_key)
        self.assertEqual(flag, self.feature_flag)
        self.mock_feature_flag_repo.get_by_key.assert_called_once_with(self.feature_flag_key)

    def test_get_all_feature_flags(self):
        self.mock_feature_flag_repo.get_all.return_value = [self.feature_flag]
        flags = self.service.get_all_feature_flags()
        self.assertEqual(len(flags), 1)
        self.mock_feature_flag_repo.get_all.assert_called_once()

    def test_update_feature_flag_new(self):
        self.mock_feature_flag_repo.get_by_key.return_value = None
        flag = self.service.update_feature_flag("new_flag", True, "A new feature")
        self.assertIsInstance(flag, FeatureFlag)
        self.assertEqual(flag.key, "new_flag")
        self.assertTrue(flag.is_enabled)
        self.mock_feature_flag_repo.save.assert_called_once_with(ANY)

    def test_update_feature_flag_existing(self):
        self.mock_feature_flag_repo.get_by_key.return_value = self.feature_flag
        old_updated_at = self.feature_flag.updated_at
        
        updated_flag = self.service.update_feature_flag(self.feature_flag_key, True, "Updated Description")
        self.assertTrue(updated_flag.is_enabled)
        self.assertEqual(updated_flag.description, "Updated Description")
        self.mock_feature_flag_repo.save.assert_called_once_with(self.feature_flag)
        self.assertTrue(updated_flag.updated_at > old_updated_at)

    def test_is_feature_enabled_true(self):
        self.feature_flag.is_enabled = True
        self.mock_feature_flag_repo.get_by_key.return_value = self.feature_flag
        self.assertTrue(self.service.is_feature_enabled(self.feature_flag_key))

    def test_is_feature_enabled_false(self):
        self.feature_flag.is_enabled = False
        self.mock_feature_flag_repo.get_by_key.return_value = self.feature_flag
        self.assertFalse(self.service.is_feature_enabled(self.feature_flag_key))

    def test_is_feature_enabled_not_found(self):
        self.mock_feature_flag_repo.get_by_key.return_value = None
        self.assertFalse(self.service.is_feature_enabled("non_existent_feature"))
