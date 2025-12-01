'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getEbookById, getChapterById, updateChapter, uploadChapterImage, type Ebook, type Chapter } from '@/lib/supabase/ebooks-client'
import { TipTapEditor } from '@/components/admin/TipTapEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, ImageIcon } from 'lucide-react'

export default function EditChapterPage() {
  const router = useRouter()
  const params = useParams()
  const ebookId = params.id as string
  const chapterId = params.chapterId as string

  const [ebook, setEbook] = useState<Ebook | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'en' | 'pt'>('en')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    chapter_number: 1,
    title_en: '',
    title_pt: '',
    slug: '',
    cover_image_url: '',
    content_en: '',
    content_pt: '',
    summary_en: '',
    summary_pt: '',
    estimated_read_time_minutes: 5,
    is_free_preview: false,
    is_published: false,
  })

  useEffect(() => {
    checkAdminAndLoad()
  }, [ebookId, chapterId])

  async function checkAdminAndLoad() {
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

    const [ebookData, chapterData] = await Promise.all([
      getEbookById(ebookId),
      getChapterById(chapterId)
    ])

    if (!ebookData || !chapterData) {
      router.push('/admin/ebooks-manage')
      return
    }

    setEbook(ebookData)
    setForm({
      chapter_number: chapterData.chapter_number,
      title_en: chapterData.title_en,
      title_pt: chapterData.title_pt || '',
      slug: chapterData.slug,
      cover_image_url: chapterData.cover_image_url || '',
      content_en: chapterData.content_en || '',
      content_pt: chapterData.content_pt || '',
      summary_en: chapterData.summary_en || '',
      summary_pt: chapterData.summary_pt || '',
      estimated_read_time_minutes: chapterData.estimated_read_time_minutes,
      is_free_preview: chapterData.is_free_preview,
      is_published: chapterData.is_published,
    })
    setImagePreview(chapterData.cover_image_url || null)
    setLoading(false)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      let coverUrl = form.cover_image_url

      // Upload new image if selected
      if (imageFile) {
        const newUrl = await uploadChapterImage(imageFile, chapterId)
        if (newUrl) coverUrl = newUrl
      }

      await updateChapter(chapterId, {
        chapter_number: form.chapter_number,
        title_en: form.title_en,
        title_pt: form.title_pt || null,
        slug: form.slug,
        cover_image_url: coverUrl || null,
        content_en: form.content_en || null,
        content_pt: form.content_pt || null,
        summary_en: form.summary_en || null,
        summary_pt: form.summary_pt || null,
        estimated_read_time_minutes: form.estimated_read_time_minutes,
        is_free_preview: form.is_free_preview,
        is_published: form.is_published,
      })

      router.push(`/admin/ebooks-manage/${ebookId}/chapters`)
    } catch (error) {
      alert('Failed to update chapter: ' + (error as Error).message)
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
          <Link href={`/admin/ebooks-manage/${ebookId}/chapters`} className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Chapters
          </Link>
          <h1 className="text-3xl font-bold mt-2">Edit Chapter</h1>
          <p className="text-gray-400 mt-1">{ebook?.title_en}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Chapter Image */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Chapter Image</h2>
            <div className="flex items-start gap-6">
              <div className="w-48 h-28 bg-neutral-800 rounded-lg flex-shrink-0 overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Chapter image preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="chapter_image">Upload New Chapter Image</Label>
                <Input
                  id="chapter_image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2 bg-neutral-800 border-neutral-700"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 1200x400px, JPG or PNG. This image appears at the top of the chapter.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Chapter Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="chapter_number">Chapter #</Label>
                  <Input
                    id="chapter_number"
                    type="number"
                    min="1"
                    value={form.chapter_number}
                    onChange={(e) => setForm(prev => ({ ...prev, chapter_number: parseInt(e.target.value) || 1 }))}
                    required
                    className="mt-1 bg-neutral-800 border-neutral-700"
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    required
                    className="mt-1 bg-neutral-800 border-neutral-700"
                    placeholder="chapter-slug"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title_en">Title (English) *</Label>
                  <Input
                    id="title_en"
                    value={form.title_en}
                    onChange={(e) => setForm(prev => ({ ...prev, title_en: e.target.value }))}
                    required
                    className="mt-1 bg-neutral-800 border-neutral-700"
                    placeholder="Chapter title in English"
                  />
                </div>
                <div>
                  <Label htmlFor="title_pt">Title (Portuguese)</Label>
                  <Input
                    id="title_pt"
                    value={form.title_pt}
                    onChange={(e) => setForm(prev => ({ ...prev, title_pt: e.target.value }))}
                    className="mt-1 bg-neutral-800 border-neutral-700"
                    placeholder="Chapter title in Portuguese"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="read_time">Read Time (min)</Label>
                  <Input
                    id="read_time"
                    type="number"
                    min="1"
                    value={form.estimated_read_time_minutes}
                    onChange={(e) => setForm(prev => ({ ...prev, estimated_read_time_minutes: parseInt(e.target.value) || 5 }))}
                    className="mt-1 bg-neutral-800 border-neutral-700"
                  />
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_free_preview}
                      onChange={(e) => setForm(prev => ({ ...prev, is_free_preview: e.target.checked }))}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-800"
                    />
                    <span className="text-sm">Free Preview</span>
                  </label>
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) => setForm(prev => ({ ...prev, is_published: e.target.checked }))}
                      className="w-4 h-4 rounded border-neutral-700 bg-neutral-800"
                    />
                    <span className="text-sm">Published</span>
                  </label>
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
              <div className="space-y-4">
                <div>
                  <Label>Summary (English)</Label>
                  <textarea
                    value={form.summary_en}
                    onChange={(e) => setForm(prev => ({ ...prev, summary_en: e.target.value }))}
                    className="mt-1 w-full h-24 bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm"
                    placeholder="Brief summary of this chapter..."
                  />
                </div>
                <div>
                  <Label>Content (English)</Label>
                  <div className="mt-1">
                    <TipTapEditor
                      content={form.content_en}
                      onChange={(content) => setForm(prev => ({ ...prev, content_en: content }))}
                      imageBucket="ebook-covers"
                      imageFolder={`chapters/${chapterId}`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Summary (Portuguese)</Label>
                  <textarea
                    value={form.summary_pt}
                    onChange={(e) => setForm(prev => ({ ...prev, summary_pt: e.target.value }))}
                    className="mt-1 w-full h-24 bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm"
                    placeholder="Resumo do capítulo..."
                  />
                </div>
                <div>
                  <Label>Content (Portuguese)</Label>
                  <div className="mt-1">
                    <TipTapEditor
                      content={form.content_pt}
                      onChange={(content) => setForm(prev => ({ ...prev, content_pt: content }))}
                      imageBucket="ebook-covers"
                      imageFolder={`chapters/${chapterId}`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href={`/admin/ebooks-manage/${ebookId}/chapters`}>
              <Button type="button" variant="ghost" className="border border-neutral-700">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
