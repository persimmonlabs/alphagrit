import { createClient } from './client'

// Helper to verify admin role before mutations
async function requireAdmin(): Promise<void> {
  const supabase = createClient()
  if (!supabase) throw new Error('Supabase client not available')

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    throw new Error('Admin privileges required')
  }
}

// Types for blog posts
export interface BlogPost {
  id: string
  title_en: string
  title_pt: string | null
  slug: string
  excerpt_en: string | null
  excerpt_pt: string | null
  content_en: string | null
  content_pt: string | null
  cover_image_url: string | null
  author_name: string
  author_avatar_url: string | null
  category: string
  tags: string[]
  estimated_read_time_minutes: number
  is_featured: boolean
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  // Audio fields
  audio_url: string | null
  audio_title: string | null
  audio_artist: string | null
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Get all blog posts for admin (includes drafts)
export async function getBlogPostsAdmin(): Promise<BlogPost[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }

  return posts || []
}

// Get blog post by ID (for admin)
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching blog post:', error)
    return null
  }

  return post
}

// Create blog post
export async function createBlogPost(post: Partial<BlogPost>): Promise<BlogPost | null> {
  await requireAdmin()
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(post)
    .select()
    .single()

  if (error) {
    console.error('Error creating blog post:', error)
    throw error
  }

  return data
}

// Update blog post
export async function updateBlogPost(id: string, post: Partial<BlogPost>): Promise<BlogPost | null> {
  await requireAdmin()
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('blog_posts')
    .update(post)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating blog post:', error)
    throw error
  }

  return data
}

// Delete blog post
export async function deleteBlogPost(id: string): Promise<boolean> {
  await requireAdmin()
  const supabase = createClient()
  if (!supabase) return false

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting blog post:', error)
    return false
  }

  return true
}

// Upload blog cover image
export async function uploadBlogImage(file: File, postId: string): Promise<string | null> {
  await requireAdmin()
  const supabase = createClient()
  if (!supabase) return null

  const fileExt = file.name.split('.').pop()
  const fileName = `${postId}-${Date.now()}.${fileExt}`
  const filePath = `covers/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    console.error('Error uploading cover:', uploadError)
    return null
  }

  const { data } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}

// Upload blog audio file
export async function uploadBlogAudio(file: File, postId: string): Promise<string | null> {
  await requireAdmin()
  const supabase = createClient()
  if (!supabase) return null

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp3'
  const fileName = `${postId}-${Date.now()}.${fileExt}`
  const filePath = `audio/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('blog-audio')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    console.error('Error uploading audio:', uploadError)
    return null
  }

  const { data } = supabase.storage
    .from('blog-audio')
    .getPublicUrl(filePath)

  return data.publicUrl
}

// Delete blog audio file
export async function deleteBlogAudio(audioUrl: string): Promise<boolean> {
  await requireAdmin()
  const supabase = createClient()
  if (!supabase) return false

  // Extract file path from URL
  const urlParts = audioUrl.split('/blog-audio/')
  if (urlParts.length < 2) return false
  const filePath = urlParts[1]

  const { error } = await supabase.storage
    .from('blog-audio')
    .remove([filePath])

  if (error) {
    console.error('Error deleting audio:', error)
    return false
  }

  return true
}

// Blog categories
export const BLOG_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'mindset', label: 'Mindset' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'motivation', label: 'Motivation' },
]
