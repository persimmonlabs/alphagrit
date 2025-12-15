import { createClient } from './server'

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

// Get all published blog posts
export async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = createClient()

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }

  return posts || []
}

// Get featured blog posts
export async function getFeaturedBlogPosts(): Promise<BlogPost[]> {
  const supabase = createClient()

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(3)

  if (error) {
    console.error('Error fetching featured blog posts:', error)
    return []
  }

  return posts || []
}

// Get blog posts by category
export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  const supabase = createClient()

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .eq('category', category)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts by category:', error)
    return []
  }

  return posts || []
}

// Get all blog posts for admin (includes drafts)
export async function getBlogPostsAdmin(): Promise<BlogPost[]> {
  const supabase = createClient()

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

// Get single blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createClient()

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching blog post:', error)
    return null
  }

  return post
}

// Get blog post by ID (for admin)
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const supabase = createClient()

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
  const supabase = createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(post)
    .select()
    .single()

  if (error) {
    console.error('Error creating blog post:', error)
    return null
  }

  return data
}

// Update blog post
export async function updateBlogPost(id: string, post: Partial<BlogPost>): Promise<BlogPost | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .update(post)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating blog post:', error)
    return null
  }

  return data
}

// Delete blog post
export async function deleteBlogPost(id: string): Promise<boolean> {
  const supabase = createClient()

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

// Get all blog post slugs (for static generation)
export async function getBlogPostSlugs(): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('is_published', true)

  if (error) {
    console.error('Error fetching blog post slugs:', error)
    return []
  }

  return (data || []).map(p => p.slug)
}

// Get all categories
export async function getBlogCategories(): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('is_published', true)

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  const categories = Array.from(new Set((data || []).map(p => p.category)))
  return categories
}

// Upload blog cover image
export async function uploadBlogImage(file: File, postId: string): Promise<string | null> {
  const supabase = createClient()

  const fileExt = file.name.split('.').pop()
  const fileName = `${postId}.${fileExt}`
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
