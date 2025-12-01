import { createClient } from './client'
import type { Ebook, Chapter } from './ebooks'

// Re-export types
export type { Ebook, Chapter }

// Client-side ebook operations for admin UI

// Get all ebooks for admin
export async function getEbooksAdmin(): Promise<Ebook[]> {
  const supabase = createClient()
  if (!supabase) return []

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

  return (ebooks || []).map((ebook: Ebook & { chapters?: Chapter[] }) => ({
    ...ebook,
    chapters: (ebook.chapters || [])
      .sort((a: Chapter, b: Chapter) => a.chapter_number - b.chapter_number)
  }))
}

// Get ebook by ID
export async function getEbookById(id: string): Promise<Ebook | null> {
  const supabase = createClient()
  if (!supabase) return null

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

// Get chapter by ID
export async function getChapterById(id: string): Promise<Chapter | null> {
  const supabase = createClient()
  if (!supabase) return null

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
  if (!supabase) return null

  const { data, error } = await supabase
    .from('ebooks')
    .insert(ebook)
    .select()
    .single()

  if (error) {
    console.error('Error creating ebook:', error)
    throw new Error(error.message)
  }

  return data
}

// Update ebook
export async function updateEbook(id: string, ebook: Partial<Ebook>): Promise<Ebook | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('ebooks')
    .update(ebook)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating ebook:', error)
    throw new Error(error.message)
  }

  return data
}

// Delete ebook
export async function deleteEbook(id: string): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false

  const { error } = await supabase
    .from('ebooks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting ebook:', error)
    throw new Error(error.message)
  }

  return true
}

// Create chapter
export async function createChapter(chapter: Partial<Chapter>): Promise<Chapter | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('chapters')
    .insert(chapter)
    .select()
    .single()

  if (error) {
    console.error('Error creating chapter:', error)
    throw new Error(error.message)
  }

  return data
}

// Update chapter
export async function updateChapter(id: string, chapter: Partial<Chapter>): Promise<Chapter | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('chapters')
    .update(chapter)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating chapter:', error)
    throw new Error(error.message)
  }

  return data
}

// Delete chapter
export async function deleteChapter(id: string): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false

  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting chapter:', error)
    throw new Error(error.message)
  }

  return true
}

// Upload cover image
export async function uploadCoverImage(file: File, ebookId: string): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return null

  const fileExt = file.name.split('.').pop()
  const fileName = `${ebookId}-${Date.now()}.${fileExt}`
  const filePath = `covers/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('ebook-covers')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    console.error('Error uploading cover:', uploadError)
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage
    .from('ebook-covers')
    .getPublicUrl(filePath)

  return data.publicUrl
}

// Upload chapter image
export async function uploadChapterImage(file: File, chapterId: string): Promise<string | null> {
  const supabase = createClient()
  if (!supabase) return null

  const fileExt = file.name.split('.').pop()
  const fileName = `chapter-${chapterId}-${Date.now()}.${fileExt}`
  const filePath = `chapters/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('ebook-covers')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    console.error('Error uploading chapter image:', uploadError)
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage
    .from('ebook-covers')
    .getPublicUrl(filePath)

  return data.publicUrl
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
