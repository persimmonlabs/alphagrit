-- =====================================================
-- ALPHA GRIT - BASELINE MIGRATION
-- =====================================================
-- Version: 1.0.0
-- Run this ONCE on your existing Supabase database
--
-- Prerequisites: Tables already exist (profiles, subscriptions,
--                purchases, ebooks, chapters, blog_posts)
--
-- This migration adds:
--   1. Row Level Security (RLS) policies
--   2. Triggers (auto-create profile, update timestamps)
--   3. Indexes for performance
--   4. Storage buckets for images
-- =====================================================

-- =====================================================
-- PART 1: FIX FOREIGN KEY CONSTRAINTS
-- =====================================================
-- Add ON DELETE CASCADE to profiles (critical for user deletion)

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- =====================================================
-- PART 2: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 3: RLS POLICIES FOR PROFILES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
CREATE POLICY "Service role can manage profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- PART 4: RLS POLICIES FOR SUBSCRIPTIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- PART 5: RLS POLICIES FOR PURCHASES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage purchases" ON purchases;
CREATE POLICY "Service role can manage purchases" ON purchases
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- PART 6: RLS POLICIES FOR EBOOKS
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view active ebooks" ON ebooks;
CREATE POLICY "Anyone can view active ebooks" ON ebooks
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage ebooks" ON ebooks;
CREATE POLICY "Admins can manage ebooks" ON ebooks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- PART 7: RLS POLICIES FOR CHAPTERS
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view published chapters" ON chapters;
CREATE POLICY "Anyone can view published chapters" ON chapters
  FOR SELECT USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM ebooks
      WHERE ebooks.id = chapters.ebook_id
      AND ebooks.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins can manage chapters" ON chapters;
CREATE POLICY "Admins can manage chapters" ON chapters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- PART 8: RLS POLICIES FOR BLOG POSTS
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;
CREATE POLICY "Admins can manage blog posts" ON blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- PART 9: TRIGGER - AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PART 10: TRIGGER - AUTO-UPDATE TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ebooks_updated_at ON ebooks;
CREATE TRIGGER update_ebooks_updated_at
  BEFORE UPDATE ON ebooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PART 11: INDEXES FOR PERFORMANCE
-- =====================================================

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Purchases indexes
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);

-- Ebooks indexes
CREATE INDEX IF NOT EXISTS idx_ebooks_status ON ebooks(status);
CREATE INDEX IF NOT EXISTS idx_ebooks_slug ON ebooks(slug);

-- Chapters indexes
CREATE INDEX IF NOT EXISTS idx_chapters_ebook_id ON chapters(ebook_id);
CREATE INDEX IF NOT EXISTS idx_chapters_slug ON chapters(ebook_id, slug);

-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- =====================================================
-- PART 12: STORAGE BUCKETS
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('ebook-covers', 'ebook-covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('blog-images', 'blog-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- PART 13: STORAGE POLICIES
-- =====================================================

-- Ebook covers: Public read
DROP POLICY IF EXISTS "Public can view ebook covers" ON storage.objects;
CREATE POLICY "Public can view ebook covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'ebook-covers');

-- Ebook covers: Admin write
DROP POLICY IF EXISTS "Admins can upload ebook covers" ON storage.objects;
CREATE POLICY "Admins can upload ebook covers" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'ebook-covers'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update ebook covers" ON storage.objects;
CREATE POLICY "Admins can update ebook covers" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'ebook-covers'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete ebook covers" ON storage.objects;
CREATE POLICY "Admins can delete ebook covers" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'ebook-covers'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Blog images: Public read
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
CREATE POLICY "Public can view blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

-- Blog images: Admin write
DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
CREATE POLICY "Admins can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
CREATE POLICY "Admins can update blog images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'blog-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
CREATE POLICY "Admins can delete blog images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- DONE!
-- =====================================================
--
-- This migration has configured:
--   ✓ Row Level Security on all 6 tables
--   ✓ Auto-create profile trigger
--   ✓ Auto-update timestamp triggers
--   ✓ Performance indexes
--   ✓ Storage buckets with policies
--
-- Next step: Run this in Supabase SQL Editor
-- =====================================================
