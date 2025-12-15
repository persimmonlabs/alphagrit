'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { createBlogPost, uploadBlogImage, uploadBlogAudio, generateSlug, BLOG_CATEGORIES } from '@/lib/supabase/blog-client'
import { TipTapEditor } from '@/components/admin/TipTapEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, Save, Music, X } from 'lucide-react'

export default function NewBlogPostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioFileName, setAudioFileName] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'en' | 'pt'>('en')

  const [form, setForm] = useState({
    title_en: '',
    title_pt: '',
    slug: '',
    excerpt_en: '',
    excerpt_pt: '',
    content_en: '',
    content_pt: '',
    author_name: 'Alpha Grit',
    category: 'general',
    tags: '',
    estimated_read_time_minutes: 5,
    is_featured: false,
    is_published: false,
    audio_title: '',
    audio_artist: '',
  })

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const supabase = createClient()
    if (!supabase) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/admin/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/admin/login')
      return
    }

    setLoading(false)
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value
    setForm(prev => ({
      ...prev,
      title_en: title,
      slug: generateSlug(title)
    }))
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  function handleAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
      setAudioFileName(file.name)
    }
  }

  function removeAudio() {
    setAudioFile(null)
    setAudioFileName(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      // Create the post first to get the ID
      const post = await createBlogPost({
        title_en: form.title_en,
        title_pt: form.title_pt || null,
        slug: form.slug,
        excerpt_en: form.excerpt_en || null,
        excerpt_pt: form.excerpt_pt || null,
        content_en: form.content_en || null,
        content_pt: form.content_pt || null,
        author_name: form.author_name,
        category: form.category,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        estimated_read_time_minutes: form.estimated_read_time_minutes,
        is_featured: form.is_featured,
        is_published: form.is_published,
        published_at: form.is_published ? new Date().toISOString() : null,
        audio_title: form.audio_title || null,
        audio_artist: form.audio_artist || null,
      })

      if (!post) throw new Error('Failed to create post')

      // Upload cover image and audio if selected
      const updates: Record<string, string | null> = {}

      if (coverFile && post.id) {
        const coverUrl = await uploadBlogImage(coverFile, post.id)
        if (coverUrl) {
          updates.cover_image_url = coverUrl
        }
      }

      if (audioFile && post.id) {
        const audioUrl = await uploadBlogAudio(audioFile, post.id)
        if (audioUrl) {
          updates.audio_url = audioUrl
        }
      }

      // Update post with uploaded files
      if (Object.keys(updates).length > 0) {
        const { updateBlogPost } = await import('@/lib/supabase/blog-client')
        await updateBlogPost(post.id, updates)
      }

      router.push('/admin/blog')
    } catch (error) {
      alert('Failed to create post: ' + (error as Error).message)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/blog" className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog Posts
          </Link>
          <h1 className="text-3xl font-bold mt-2">New Blog Post</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cover Image */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Cover Image</h2>
            <div className="flex items-start gap-6">
              <div className="w-48 h-28 bg-neutral-800 rounded-lg flex-shrink-0 overflow-hidden">
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <Upload className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="cover">Upload Cover Image</Label>
                <Input
                  id="cover"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="mt-2 bg-neutral-800 border-neutral-700"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 1200x630px, JPG or PNG
                </p>
              </div>
            </div>
          </div>

          {/* Background Audio */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-orange-500" />
              Background Audio (Optional)
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Add background music that plays when readers view this post. Audio will attempt to autoplay but users can control playback.
            </p>

            {audioFileName ? (
              <div className="flex items-center justify-between bg-neutral-800 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Music className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{audioFileName}</p>
                    <p className="text-xs text-gray-500">Ready to upload</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeAudio}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div>
                <Input
                  id="audio"
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,audio/aac,.mp3,.wav,.ogg,.m4a"
                  onChange={handleAudioChange}
                  className="bg-neutral-800 border-neutral-700"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Supported: MP3, WAV, OGG, M4A (max 50MB). MP3 recommended for best compatibility.
                </p>
              </div>
            )}

            {/* Audio Metadata */}
            {(audioFileName || audioFile) && (
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-neutral-800">
                <div>
                  <Label htmlFor="audio_title">Audio Title</Label>
                  <Input
                    id="audio_title"
                    value={form.audio_title}
                    onChange={(e) => setForm(prev => ({ ...prev, audio_title: e.target.value }))}
                    className="mt-1 bg-neutral-800 border-neutral-700"
                    placeholder="e.g., Ambient Focus Music"
                  />
                </div>
                <div>
                  <Label htmlFor="audio_artist">Artist / Source</Label>
                  <Input
                    id="audio_artist"
                    value={form.audio_artist}
                    onChange={(e) => setForm(prev => ({ ...prev, audio_artist: e.target.value }))}
                    className="mt-1 bg-neutral-800 border-neutral-700"
                    placeholder="e.g., Royalty Free Music"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title_en">Title (English) *</Label>
                  <Input
                    id="title_en"
                    value={form.title_en}
                    onChange={handleTitleChange}
                    required
                    className="mt-1 bg-neutral-800 border-neutral-700"
                    placeholder="Enter title in English"
                  />
                </div>
                <div>
                  <Label htmlFor="title_pt">Title (Portuguese)</Label>
                  <Input
                    id="title_pt"
                    value={form.title_pt}
                    onChange={(e) => setForm(prev => ({ ...prev, title_pt: e.target.value }))}
                    className="mt-1 bg-neutral-800 border-neutral-700"
                    placeholder="Enter title in Portuguese"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    required
                    className="mt-1 bg-neutral-800 border-neutral-700"
                    placeholder="url-friendly-slug"
                  />
                </div>
                <div>
                  <Label htmlFor="author_name">Author Name</Label>
                  <Input
                    id="author_name"
                    value={form.author_name}
                    onChange={(e) => setForm(prev => ({ ...prev, author_name: e.target.value }))}
                    className="mt-1 bg-neutral-800 border-neutral-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 w-full h-10 bg-neutral-800 border border-neutral-700 rounded-md px-3 text-sm"
                  >
                    {BLOG_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={form.tags}
                    onChange={(e) => setForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="mt-1 bg-neutral-800 border-neutral-700"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="excerpt_en">Excerpt (English)</Label>
                  <textarea
                    id="excerpt_en"
                    value={form.excerpt_en}
                    onChange={(e) => setForm(prev => ({ ...prev, excerpt_en: e.target.value }))}
                    className="mt-1 w-full h-24 bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm"
                    placeholder="Brief summary of the post..."
                  />
                </div>
                <div>
                  <Label htmlFor="excerpt_pt">Excerpt (Portuguese)</Label>
                  <textarea
                    id="excerpt_pt"
                    value={form.excerpt_pt}
                    onChange={(e) => setForm(prev => ({ ...prev, excerpt_pt: e.target.value }))}
                    className="mt-1 w-full h-24 bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm"
                    placeholder="Resumo do post..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Content</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                    activeTab === 'en'
                      ? 'bg-orange-500 text-white'
                      : 'bg-neutral-800 text-gray-400 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pt')}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                    activeTab === 'pt'
                      ? 'bg-orange-500 text-white'
                      : 'bg-neutral-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Portuguese
                </button>
              </div>
            </div>

            {activeTab === 'en' ? (
              <TipTapEditor
                content={form.content_en}
                onChange={(content) => setForm(prev => ({ ...prev, content_en: content }))}
                imageBucket="blog-images"
                imageFolder="content"
              />
            ) : (
              <TipTapEditor
                content={form.content_pt}
                onChange={(content) => setForm(prev => ({ ...prev, content_pt: content }))}
                imageBucket="blog-images"
                imageFolder="content"
              />
            )}
          </div>

          {/* Settings */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="read_time">Estimated Read Time (min)</Label>
                <Input
                  id="read_time"
                  type="number"
                  min="1"
                  value={form.estimated_read_time_minutes}
                  onChange={(e) => setForm(prev => ({ ...prev, estimated_read_time_minutes: parseInt(e.target.value) || 5 }))}
                  className="mt-1 bg-neutral-800 border-neutral-700"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4 rounded border-neutral-700 bg-neutral-800"
                  />
                  <span className="text-sm">Featured Post</span>
                </label>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm(prev => ({ ...prev, is_published: e.target.checked }))}
                    className="w-4 h-4 rounded border-neutral-700 bg-neutral-800"
                  />
                  <span className="text-sm">Publish Now</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/blog">
              <Button type="button" variant="ghost" className="border border-neutral-700">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Creating...' : 'Create Post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
