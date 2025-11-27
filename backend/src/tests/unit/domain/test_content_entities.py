import unittest
from datetime import datetime, timedelta
from uuid import uuid4
import json

from src.domain.entities.content import BlogPost, FAQ, SiteConfigSetting, FeatureFlag, PostStatus
from src.domain.entities.user import UserRole, CurrencyType # For author_id reference

class TestBlogPostEntity(unittest.TestCase):
    def test_blog_post_creation_valid(self):
        post = BlogPost(title="Test Post", slug="test-post", content="Some content here.")
        self.assertIsNotNone(post.id)
        self.assertEqual(post.title, "Test Post")
        self.assertEqual(post.status, PostStatus.DRAFT)
        self.assertLessEqual(datetime.now() - post.created_at, timedelta(seconds=1))

    def test_blog_post_creation_no_slug_generates_one(self):
        post = BlogPost(title="Another Post Title", content="Content.")
        self.assertEqual(post.slug, "another-post-title")

    def test_blog_post_creation_empty_title_raises_error(self):
        with self.assertRaises(ValueError, msg="Blog post title cannot be empty"):
            BlogPost(title="", content="Content")

    def test_blog_post_creation_empty_content_raises_error(self):
        with self.assertRaises(ValueError, msg="Blog post content cannot be empty"):
            BlogPost(title="Title", content="")

    def test_blog_post_creation_negative_views_raises_error(self):
        with self.assertRaises(ValueError, msg="Views cannot be negative"):
            BlogPost(title="Title", content="Content", views=-1)

    def test_publish_blog_post(self):
        post = BlogPost(title="Draft Post", content="Content")
        self.assertEqual(post.status, PostStatus.DRAFT)
        
        post.publish()
        self.assertEqual(post.status, PostStatus.PUBLISHED)
        self.assertIsNotNone(post.published_at)
        self.assertLessEqual(datetime.now() - post.updated_at, timedelta(seconds=1))

    def test_publish_blog_post_already_published_raises_error(self):
        post = BlogPost(title="Published Post", content="Content", status=PostStatus.PUBLISHED)
        with self.assertRaises(ValueError, msg="Blog post is already published"):
            post.publish()

    def test_archive_blog_post(self):
        post = BlogPost(title="Published Post", content="Content", status=PostStatus.PUBLISHED)
        
        post.archive()
        self.assertEqual(post.status, PostStatus.ARCHIVED)
        self.assertLessEqual(datetime.now() - post.updated_at, timedelta(seconds=1))

class TestFaqEntity(unittest.TestCase):
    def test_faq_creation_valid(self):
        faq = FAQ(question="What is this?", answer="This is an answer.")
        self.assertIsNotNone(faq.id)
        self.assertEqual(faq.question, "What is this?")
        self.assertTrue(faq.is_active)

    def test_faq_creation_empty_question_raises_error(self):
        with self.assertRaises(ValueError, msg="FAQ question cannot be empty"):
            FAQ(question="", answer="Answer")

    def test_faq_creation_empty_answer_raises_error(self):
        with self.assertRaises(ValueError, msg="FAQ answer cannot be empty"):
            FAQ(question="Question", answer="")

    def test_faq_creation_negative_display_order_raises_error(self):
        with self.assertRaises(ValueError, msg="Display order cannot be negative"):
            FAQ(question="Q", answer="A", display_order=-1)

class TestSiteConfigSettingEntity(unittest.TestCase):
    def test_site_config_creation_valid(self):
        setting = SiteConfigSetting(key="site_name", value="My Site", value_type="string")
        self.assertEqual(setting.key, "site_name")
        self.assertEqual(setting.value, "My Site")
        self.assertEqual(setting.value_type, "string")

    def test_site_config_creation_empty_key_raises_error(self):
        with self.assertRaises(ValueError, msg="Site config key cannot be empty"):
            SiteConfigSetting(key="", value="Value")

    def test_site_config_creation_json_type_valid(self):
        json_val = {"theme": "dark", "layout": "responsive"}
        setting = SiteConfigSetting(key="design_settings", value=json_val, value_type="json")
        self.assertEqual(setting.value, json_val)
    
    def test_site_config_creation_json_type_invalid_raises_error(self):
        with self.assertRaises(ValueError, msg="Value for key 'invalid_json' is not valid JSON for value_type 'json'"):
            SiteConfigSetting(key="invalid_json", value="not a json", value_type="json")
    
    def test_site_config_creation_number_type_valid(self):
        setting = SiteConfigSetting(key="max_items", value=10, value_type="number")
        self.assertEqual(setting.value, 10)
        setting = SiteConfigSetting(key="ratio", value=10.5, value_type="number")
        self.assertEqual(setting.value, 10.5)

    def test_site_config_creation_number_type_invalid_raises_error(self):
        with self.assertRaises(ValueError, msg="Value for key 'invalid_num' is not a valid number for value_type 'number'"):
            SiteConfigSetting(key="invalid_num", value="ten", value_type="number")

    def test_site_config_creation_boolean_type_valid(self):
        setting = SiteConfigSetting(key="pwa_enabled", value=True, value_type="boolean")
        self.assertTrue(setting.value)
        setting = SiteConfigSetting(key="pwa_enabled_str", value="True", value_type="boolean") # String booleans are also valid
        self.assertEqual(setting.value, "True")

    def test_site_config_creation_boolean_type_invalid_raises_error(self):
        with self.assertRaises(ValueError, msg="Value for key 'invalid_bool' is not a valid boolean for value_type 'boolean'"):
            SiteConfigSetting(key="invalid_bool", value="yes", value_type="boolean")

class TestFeatureFlagEntity(unittest.TestCase):
    def test_feature_flag_creation_valid(self):
        flag = FeatureFlag(key="new_feature_enabled", is_enabled=True)
        self.assertEqual(flag.key, "new_feature_enabled")
        self.assertTrue(flag.is_enabled)

    def test_feature_flag_creation_empty_key_raises_error(self):
        with self.assertRaises(ValueError, msg="Feature flag key cannot be empty"):
            FeatureFlag(key="", is_enabled=False)
