-- E-book CMS Schema for Supabase
-- Run this in Supabase SQL Editor

-- Ebooks table
CREATE TABLE IF NOT EXISTS ebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_pt TEXT,
  slug TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_pt TEXT,
  cover_image_url TEXT,
  price_usd INTEGER DEFAULT 0, -- in cents
  price_brl INTEGER DEFAULT 0, -- in cents
  stripe_price_id_usd TEXT,
  stripe_price_id_brl TEXT,
  estimated_read_time_minutes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ebook_id UUID NOT NULL REFERENCES ebooks(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title_en TEXT NOT NULL,
  title_pt TEXT,
  slug TEXT NOT NULL,
  cover_image_url TEXT, -- Chapter header/cover image
  content_en TEXT, -- HTML content from TipTap
  content_pt TEXT,
  summary_en TEXT,
  summary_pt TEXT,
  estimated_read_time_minutes INTEGER DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ebook_id, slug),
  UNIQUE(ebook_id, chapter_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ebooks_status ON ebooks(status);
CREATE INDEX IF NOT EXISTS idx_ebooks_slug ON ebooks(slug);
CREATE INDEX IF NOT EXISTS idx_chapters_ebook_id ON chapters(ebook_id);
CREATE INDEX IF NOT EXISTS idx_chapters_slug ON chapters(ebook_id, slug);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_ebooks_updated_at ON ebooks;
CREATE TRIGGER update_ebooks_updated_at
  BEFORE UPDATE ON ebooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies

-- Enable RLS
ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Ebooks: Anyone can read active ebooks
DROP POLICY IF EXISTS "Anyone can view active ebooks" ON ebooks;
CREATE POLICY "Anyone can view active ebooks" ON ebooks
  FOR SELECT USING (status = 'active');

-- Ebooks: Admins can do everything
DROP POLICY IF EXISTS "Admins can manage ebooks" ON ebooks;
CREATE POLICY "Admins can manage ebooks" ON ebooks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Chapters: Anyone can read published chapters of active ebooks
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

-- Chapters: Admins can do everything
DROP POLICY IF EXISTS "Admins can manage chapters" ON chapters;
CREATE POLICY "Admins can manage chapters" ON chapters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Storage bucket for ebook covers (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('ebook-covers', 'ebook-covers', true);
