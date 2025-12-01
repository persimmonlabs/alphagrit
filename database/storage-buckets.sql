-- =====================================================
-- SUPABASE STORAGE BUCKETS SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create the storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('ebook-covers', 'ebook-covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('blog-images', 'blog-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies for ebook-covers bucket

-- Anyone can view ebook covers (public)
DROP POLICY IF EXISTS "Public can view ebook covers" ON storage.objects;
CREATE POLICY "Public can view ebook covers" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'ebook-covers');

-- Only admins can upload ebook covers
DROP POLICY IF EXISTS "Admins can upload ebook covers" ON storage.objects;
CREATE POLICY "Admins can upload ebook covers" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'ebook-covers'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update ebook covers
DROP POLICY IF EXISTS "Admins can update ebook covers" ON storage.objects;
CREATE POLICY "Admins can update ebook covers" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'ebook-covers'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can delete ebook covers
DROP POLICY IF EXISTS "Admins can delete ebook covers" ON storage.objects;
CREATE POLICY "Admins can delete ebook covers" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'ebook-covers'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 3. Storage Policies for blog-images bucket

-- Anyone can view blog images (public)
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
CREATE POLICY "Public can view blog images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog-images');

-- Only admins can upload blog images
DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
CREATE POLICY "Admins can upload blog images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'blog-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update blog images
DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
CREATE POLICY "Admins can update blog images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'blog-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can delete blog images
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
CREATE POLICY "Admins can delete blog images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'blog-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check buckets exist
-- SELECT * FROM storage.buckets WHERE id IN ('ebook-covers', 'blog-images');

-- Check policies
-- SELECT policyname, tablename, cmd FROM pg_policies WHERE tablename = 'objects';
