-- =====================================================
-- ALPHA GRIT - BLOG AUDIO MIGRATION
-- =====================================================
-- Version: 1.0.1
-- Purpose: Add audio support to blog posts
--
-- This migration adds:
--   1. Audio fields to blog_posts table
--   2. Storage bucket for blog audio files
--   3. Storage policies for admin upload
-- =====================================================

-- =====================================================
-- PART 1: ADD AUDIO COLUMNS TO BLOG_POSTS
-- =====================================================

-- Add audio_url column (main audio file URL)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS audio_url TEXT DEFAULT NULL;

-- Add audio metadata fields
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS audio_title TEXT DEFAULT NULL;

ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS audio_artist TEXT DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN blog_posts.audio_url IS 'Public URL to audio file in Supabase Storage (blog-audio bucket)';
COMMENT ON COLUMN blog_posts.audio_title IS 'Title/name of the audio track';
COMMENT ON COLUMN blog_posts.audio_artist IS 'Artist or source of the audio';

-- =====================================================
-- PART 2: CREATE STORAGE BUCKET FOR BLOG AUDIO
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-audio',
  'blog-audio',
  true,
  52428800,  -- 50 MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac', 'audio/m4a']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- PART 3: STORAGE POLICIES FOR BLOG AUDIO
-- =====================================================

-- Blog audio: Public read
DROP POLICY IF EXISTS "Public can view blog audio" ON storage.objects;
CREATE POLICY "Public can view blog audio" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-audio');

-- Blog audio: Admin write
DROP POLICY IF EXISTS "Admins can upload blog audio" ON storage.objects;
CREATE POLICY "Admins can upload blog audio" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-audio'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update blog audio" ON storage.objects;
CREATE POLICY "Admins can update blog audio" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'blog-audio'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete blog audio" ON storage.objects;
CREATE POLICY "Admins can delete blog audio" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'blog-audio'
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
--   ✓ Audio fields on blog_posts table (audio_url, audio_title, audio_artist)
--   ✓ Storage bucket for blog audio (50MB limit, audio formats)
--   ✓ Storage policies (public read, admin write)
--
-- Next step: Run this in Supabase SQL Editor
-- =====================================================
