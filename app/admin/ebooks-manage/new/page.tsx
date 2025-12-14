'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { createEbook, uploadCoverImage, generateSlug } from '@/lib/supabase/ebooks-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, Save } from 'lucide-react'

export default function NewEbookPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    title_en: '',
    title_pt: '',
    slug: '',
    description_en: '',
    description_pt: '',
    price_usd: 0,
    price_brl: 0,
    stripe_price_id_usd: '',
    stripe_price_id_brl: '',
    estimated_read_time_minutes: 0,
    status: 'draft' as 'draft' | 'active' | 'archived',
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

  function handleTitleChange(title: string) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      // Create ebook first
      const ebook = await createEbook({
        ...form,
        price_usd: Math.round(form.price_usd * 100), // Convert to cents
        price_brl: Math.round(form.price_brl * 100),
      })

      if (!ebook) throw new Error('Failed to create ebook')

      // Upload cover if selected
      if (coverFile) {
        const coverUrl = await uploadCoverImage(coverFile, ebook.id)
        if (coverUrl) {
          const { updateEbook } = await import('@/lib/supabase/ebooks-client')
          await updateEbook(ebook.id, { cover_image_url: coverUrl })
        }
      }

      router.push('/admin/ebooks-manage')
    } catch (error) {
      alert('Failed to create ebook: ' + (error as Error).message)
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/ebooks-manage" className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to E-books
          </Link>
          <h1 className="text-3xl font-bold mt-2">Create New E-book</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cover Image */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Cover Image</h2>
            <div className="flex items-start gap-6">
              <div className="w-32 h-44 bg-neutral-800 rounded-lg flex-shrink-0 overflow-hidden">
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
                  Recommended: 400x600px, JPG or PNG
                </p>
              </div>
            </div>
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
                    onChange={(e) => handleTitleChange(e.target.value)}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description_en">Description (English)</Label>
                  <textarea
                    id="description_en"
                    value={form.description_en}
                    onChange={(e) => setForm(prev => ({ ...prev, description_en: e.target.value }))}
                    className="mt-1 w-full h-32 bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm"
                    placeholder="Brief description in English"
                  />
                </div>
                <div>
                  <Label htmlFor="description_pt">Description (Portuguese)</Label>
                  <textarea
                    id="description_pt"
                    value={form.description_pt}
                    onChange={(e) => setForm(prev => ({ ...prev, description_pt: e.target.value }))}
                    className="mt-1 w-full h-32 bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-sm"
                    placeholder="Brief description in Portuguese"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Note: Pricing removed - subscription-only model */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Access Model</h2>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-400">
                <strong>Subscription-Only Model:</strong> All ebooks are now accessible through subscription only.
                Chapter 1 is always free as a preview. No individual ebook pricing needed.
              </p>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as 'draft' | 'active' | 'archived' }))}
                  className="mt-1 w-full h-10 bg-neutral-800 border border-neutral-700 rounded-md px-3 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active (Published)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <Label htmlFor="read_time">Estimated Read Time (minutes)</Label>
                <Input
                  id="read_time"
                  type="number"
                  min="0"
                  value={form.estimated_read_time_minutes}
                  onChange={(e) => setForm(prev => ({ ...prev, estimated_read_time_minutes: parseInt(e.target.value) || 0 }))}
                  className="mt-1 bg-neutral-800 border-neutral-700"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/ebooks-manage">
              <Button type="button" variant="ghost" className="border border-neutral-700">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Creating...' : 'Create E-book'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
