import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import uuid4
from datetime import datetime, timedelta
import json

from src.domain.entities.content import BlogPost, FAQ, SiteConfigSetting, FeatureFlag, PostStatus
from src.domain.entities.user import Profile, UserRole, CurrencyType
from src.infrastructure.database import Base
from src.infrastructure.repositories.sqlalchemy_content_repository import (
    SQLAlchemyBlogPostRepository,
    SQLAlchemyFaqRepository,
    SQLAlchemySiteConfigRepository,
    SQLAlchemyFeatureFlagRepository,
    BlogPostORM,
    FaqORM,
    SiteConfigORM,
    FeatureFlagORM,
)
from src.infrastructure.repositories.sqlalchemy_user_repository import ProfileORM


class TestSQLAlchemyBlogPostRepository(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.blog_repo = SQLAlchemyBlogPostRepository(self.session)

        self.author_id = str(uuid4())
        self.session.add(ProfileORM(id=self.author_id, email="author@test.com", full_name="Test Author"))
        self.session.commit()

    def tearDown(self):
        self.session.rollback()
        self.session.close()
        Base.metadata.drop_all(self.engine)

    def test_save_new_blog_post(self):
        post = BlogPost(title="New Post", slug="new-post", content="Content here.", author_id=self.author_id)
        self.blog_repo.save(post)

        retrieved = self.blog_repo.get_by_id(post.id)
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.title, "New Post")
        self.assertEqual(retrieved.author_id, self.author_id)

    def test_update_existing_blog_post(self):
        post = BlogPost(title="Original Post", slug="original-post", content="Old content.", author_id=self.author_id)
        self.blog_repo.save(post)

        post.title = "Updated Title"
        post.content = "New content."
        post.status = PostStatus.PUBLISHED
        self.blog_repo.save(post)

        updated_post = self.blog_repo.get_by_id(post.id)
        self.assertEqual(updated_post.title, "Updated Title")
        self.assertEqual(updated_post.status, PostStatus.PUBLISHED)

    def test_get_by_slug(self):
        post = BlogPost(title="Slug Post", slug="slug-post-unique", content="Content.", author_id=self.author_id)
        self.blog_repo.save(post)

        found_post = self.blog_repo.get_by_slug("slug-post-unique")
        self.assertIsNotNone(found_post)
        self.assertEqual(found_post.id, post.id)

    def test_get_all_blog_posts(self):
        post1 = BlogPost(title="P1", slug="p1", content="C1", status=PostStatus.PUBLISHED, author_id=self.author_id)
        post2 = BlogPost(title="P2", slug="p2", content="C2", status=PostStatus.DRAFT, author_id=self.author_id)
        self.blog_repo.save(post1)
        self.blog_repo.save(post2)

        all_posts = self.blog_repo.get_all()
        self.assertEqual(len(all_posts), 2)

        published_posts = self.blog_repo.get_all(status=PostStatus.PUBLISHED)
        self.assertEqual(len(published_posts), 1)
        self.assertEqual(published_posts[0].title, "P1")

    def test_delete_blog_post(self):
        post = BlogPost(title="To Delete", slug="to-delete", content="Content.", author_id=self.author_id)
        self.blog_repo.save(post)

        self.blog_repo.delete(post.id)
        retrieved = self.blog_repo.get_by_id(post.id)
        self.assertIsNone(retrieved)


class TestSQLAlchemyFaqRepository(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.faq_repo = SQLAlchemyFaqRepository(self.session)

    def tearDown(self):
        self.session.rollback()
        self.session.close()
        Base.metadata.drop_all(self.engine)

    def test_save_new_faq(self):
        faq = FAQ(question="New Q", answer="New A", category="General")
        self.faq_repo.save(faq)

        retrieved = self.faq_repo.get_by_id(faq.id)
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.question, "New Q")

    def test_update_existing_faq(self):
        faq = FAQ(question="Old Q", answer="Old A", category="General")
        self.faq_repo.save(faq)

        faq.question = "Updated Q"
        faq.is_active = False
        self.faq_repo.save(faq)

        updated_faq = self.faq_repo.get_by_id(faq.id)
        self.assertEqual(updated_faq.question, "Updated Q")
        self.assertFalse(updated_faq.is_active)

    def test_get_all_faqs(self):
        faq1 = FAQ(question="Q1", answer="A1", category="Tech", is_active=True)
        faq2 = FAQ(question="Q2", answer="A2", category="Sales", is_active=False)
        self.faq_repo.save(faq1)
        self.faq_repo.save(faq2)

        all_faqs = self.faq_repo.get_all()
        self.assertEqual(len(all_faqs), 2)

        tech_faqs = self.faq_repo.get_all(category="Tech")
        self.assertEqual(len(tech_faqs), 1)
        self.assertEqual(tech_faqs[0].question, "Q1")

        active_faqs = self.faq_repo.get_all(is_active=True)
        self.assertEqual(len(active_faqs), 1)
        self.assertEqual(active_faqs[0].question, "Q1")

    def test_delete_faq(self):
        faq = FAQ(question="To Delete", answer="Answer")
        self.faq_repo.save(faq)

        self.faq_repo.delete(faq.id)
        retrieved = self.faq_repo.get_by_id(faq.id)
        self.assertIsNone(retrieved)


class TestSQLAlchemySiteConfigRepository(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.config_repo = SQLAlchemySiteConfigRepository(self.session)

    def tearDown(self):
        self.session.rollback()
        self.session.close()
        Base.metadata.drop_all(self.engine)

    def test_save_new_setting(self):
        setting = SiteConfigSetting(key="new_setting", value="new_value", value_type="string")
        self.config_repo.save(setting)

        retrieved = self.config_repo.get_by_key("new_setting")
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.value, "new_value")

    def test_update_existing_setting(self):
        setting = SiteConfigSetting(key="existing_setting", value="old_value", value_type="string")
        self.config_repo.save(setting)

        setting.value = {"theme": "dark"}
        setting.value_type = "json"
        setting.is_public = True
        self.config_repo.save(setting)

        updated_setting = self.config_repo.get_by_key("existing_setting")
        self.assertEqual(updated_setting.value, {"theme": "dark"})
        self.assertEqual(updated_setting.value_type, "json")
        self.assertTrue(updated_setting.is_public)

    def test_get_all_settings(self):
        setting1 = SiteConfigSetting(key="s1", value="v1", value_type="string", is_public=True)
        setting2 = SiteConfigSetting(key="s2", value="v2", value_type="string", is_public=False)
        self.config_repo.save(setting1)
        self.config_repo.save(setting2)

        all_settings = self.config_repo.get_all()
        self.assertEqual(len(all_settings), 2)

        public_settings = self.config_repo.get_all(is_public=True)
        self.assertEqual(len(public_settings), 1)
        self.assertEqual(public_settings[0].key, "s1")


class TestSQLAlchemyFeatureFlagRepository(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

        self.flag_repo = SQLAlchemyFeatureFlagRepository(self.session)

    def tearDown(self):
        self.session.rollback()
        self.session.close()
        Base.metadata.drop_all(self.engine)

    def test_save_new_flag(self):
        flag = FeatureFlag(key="new_feature", is_enabled=True)
        self.flag_repo.save(flag)

        retrieved = self.flag_repo.get_by_key("new_feature")
        self.assertIsNotNone(retrieved)
        self.assertTrue(retrieved.is_enabled)

    def test_update_existing_flag(self):
        flag = FeatureFlag(key="existing_feature", is_enabled=False)
        self.flag_repo.save(flag)

        flag.is_enabled = True
        flag.description = "Updated description"
        self.flag_repo.save(flag)

        updated_flag = self.flag_repo.get_by_key("existing_feature")
        self.assertTrue(updated_flag.is_enabled)
        self.assertEqual(updated_flag.description, "Updated description")

    def test_get_all_flags(self):
        flag1 = FeatureFlag(key="flag1", is_enabled=True)
        flag2 = FeatureFlag(key="flag2", is_enabled=False)
        self.flag_repo.save(flag1)
        self.flag_repo.save(flag2)

        all_flags = self.flag_repo.get_all()
        self.assertEqual(len(all_flags), 2)
