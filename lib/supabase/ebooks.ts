import { createClient } from './server'

// Types for ebooks
export interface Ebook {
  id: string
  title_en: string
  title_pt: string | null
  slug: string
  description_en: string | null
  description_pt: string | null
  cover_image_url: string | null
  price_usd: number
  price_brl: number
  stripe_price_id_usd: string | null
  stripe_price_id_brl: string | null
  estimated_read_time_minutes: number
  status: 'draft' | 'active' | 'archived'
  created_at: string
  updated_at: string
  chapters?: Chapter[]
}

export interface Chapter {
  id: string
  ebook_id: string
  chapter_number: number
  title_en: string
  title_pt: string | null
  slug: string
  cover_image_url: string | null
  content_en: string | null
  content_pt: string | null
  summary_en: string | null
  summary_pt: string | null
  estimated_read_time_minutes: number
  is_free_preview: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

// Get all active ebooks with their published chapters
export async function getEbooks(): Promise<Ebook[]> {
  const supabase = createClient()

  const { data: ebooks, error } = await supabase
    .from('ebooks')
    .select(`
      *,
      chapters (
        id,
        chapter_number,
        title_en,
        title_pt,
        slug,
        is_free_preview,
        is_published,
        estimated_read_time_minutes
      )
    `)
    .eq('status', 'active')
    .order('title_en', { ascending: true })

  if (error) {
    console.error('Error fetching ebooks:', error)
    return []
  }

  // Filter to only published chapters and sort by chapter_number
  return (ebooks || []).map(ebook => ({
    ...ebook,
    chapters: (ebook.chapters || [])
      .filter((ch: Chapter) => ch.is_published)
      .sort((a: Chapter, b: Chapter) => a.chapter_number - b.chapter_number)
  }))
}

// Get all ebooks for admin (includes drafts)
export async function getEbooksAdmin(): Promise<Ebook[]> {
  const supabase = createClient()

  const { data: ebooks, error } = await supabase
    .from('ebooks')
    .select(`
      *,
      chapters (
        id,
        chapter_number,
        title_en,
        title_pt,
        slug,
        is_free_preview,
        is_published
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching ebooks:', error)
    return []
  }

  return (ebooks || []).map(ebook => ({
    ...ebook,
    chapters: (ebook.chapters || [])
      .sort((a: Chapter, b: Chapter) => a.chapter_number - b.chapter_number)
  }))
}

// Get single ebook by slug
export async function getEbookBySlug(slug: string): Promise<Ebook | null> {
  const supabase = createClient()

  const { data: ebook, error } = await supabase
    .from('ebooks')
    .select(`
      *,
      chapters (
        id,
        chapter_number,
        title_en,
        title_pt,
        slug,
        summary_en,
        summary_pt,
        is_free_preview,
        is_published,
        estimated_read_time_minutes
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching ebook:', error)
    return null
  }

  return {
    ...ebook,
    chapters: (ebook.chapters || [])
      .filter((ch: Chapter) => ch.is_published)
      .sort((a: Chapter, b: Chapter) => a.chapter_number - b.chapter_number)
  }
}

// Get ebook by ID (for admin)
export async function getEbookById(id: string): Promise<Ebook | null> {
  const supabase = createClient()

  const { data: ebook, error } = await supabase
    .from('ebooks')
    .select(`
      *,
      chapters (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching ebook:', error)
    return null
  }

  return {
    ...ebook,
    chapters: (ebook.chapters || [])
      .sort((a: Chapter, b: Chapter) => a.chapter_number - b.chapter_number)
  }
}

// Get chapter with full content
export async function getChapterBySlug(
  ebookSlug: string,
  chapterSlug: string
): Promise<{ ebook: Ebook; chapter: Chapter } | null> {
  const supabase = createClient()

  // First get the ebook
  const { data: ebook, error: ebookError } = await supabase
    .from('ebooks')
    .select(`
      *,
      chapters (
        id,
        chapter_number,
        title_en,
        title_pt,
        slug,
        is_free_preview,
        is_published
      )
    `)
    .eq('slug', ebookSlug)
    .single()

  if (ebookError || !ebook) {
    console.error('Error fetching ebook:', ebookError)
    return null
  }

  // Then get the full chapter content
  const { data: chapter, error: chapterError } = await supabase
    .from('chapters')
    .select('*')
    .eq('ebook_id', ebook.id)
    .eq('slug', chapterSlug)
    .single()

  if (chapterError || !chapter) {
    console.error('Error fetching chapter:', chapterError)
    return null
  }

  return {
    ebook: {
      ...ebook,
      chapters: (ebook.chapters || [])
        .filter((ch: Chapter) => ch.is_published)
        .sort((a: Chapter, b: Chapter) => a.chapter_number - b.chapter_number)
    },
    chapter
  }
}

// Get chapter by ID (for admin)
export async function getChapterById(id: string): Promise<Chapter | null> {
  const supabase = createClient()

  const { data: chapter, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching chapter:', error)
    return null
  }

  return chapter
}

// Create ebook
export async function createEbook(ebook: Partial<Ebook>): Promise<Ebook | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ebooks')
    .insert(ebook)
    .select()
    .single()

  if (error) {
    console.error('Error creating ebook:', error)
    return null
  }

  return data
}

// Update ebook
export async function updateEbook(id: string, ebook: Partial<Ebook>): Promise<Ebook | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ebooks')
    .update(ebook)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating ebook:', error)
    return null
  }

  return data
}

// Delete ebook
export async function deleteEbook(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('ebooks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting ebook:', error)
    return false
  }

  return true
}

// Create chapter
export async function createChapter(chapter: Partial<Chapter>): Promise<Chapter | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('chapters')
    .insert(chapter)
    .select()
    .single()

  if (error) {
    console.error('Error creating chapter:', error)
    return null
  }

  return data
}

// Update chapter
export async function updateChapter(id: string, chapter: Partial<Chapter>): Promise<Chapter | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('chapters')
    .update(chapter)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating chapter:', error)
    return null
  }

  return data
}

// Delete chapter
export async function deleteChapter(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting chapter:', error)
    return false
  }

  return true
}

// Get all ebook slugs (for static generation)
export async function getEbookSlugs(): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ebooks')
    .select('slug')
    .eq('status', 'active')

  if (error) {
    console.error('Error fetching ebook slugs:', error)
    return []
  }

  return (data || []).map(e => e.slug)
}

// Upload cover image
export async function uploadCoverImage(file: File, ebookId: string): Promise<string | null> {
  const supabase = createClient()

  const fileExt = file.name.split('.').pop()
  const fileName = `${ebookId}.${fileExt}`
  const filePath = `covers/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('ebook-covers')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    console.error('Error uploading cover:', uploadError)
    return null
  }

  const { data } = supabase.storage
    .from('ebook-covers')
    .getPublicUrl(filePath)

  return data.publicUrl
}
