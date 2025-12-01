'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getEbookById, updateEbook, uploadCoverImage, generateSlug, type Ebook } from '@/lib/supabase/ebooks-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, Save, BookOpen } from 'lucide-react'

export default function EditEbookPage() {
  const router = useRouter()
  const params = useParams()
  const ebookId = params.id as string

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
    cover_image_url: '',
  })

  useEffect(() => {
    checkAdminAndLoad()
  }, [ebookId])

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

    // Load ebook
    const ebook = await getEbookById(ebookId)
    if (!ebook) {
      router.push('/admin/ebooks-manage')
      return
    }

    setForm({
      title_en: ebook.title_en,
      title_pt: ebook.title_pt || '',
      slug: ebook.slug,
      description_en: ebook.description_en || '',
      description_pt: ebook.description_pt || '',
      price_usd: ebook.price_usd / 100, // Convert from cents
      price_brl: ebook.price_brl / 100,
      stripe_price_id_usd: ebook.stripe_price_id_usd || '',
      stripe_price_id_brl: ebook.stripe_price_id_brl || '',
      estimated_read_time_minutes: ebook.estimated_read_time_minutes,
      status: ebook.status,
      cover_image_url: ebook.cover_image_url || '',
    })
    setCoverPreview(ebook.cover_image_url || null)
    setLoading(false)
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
      let coverUrl = form.cover_image_url

      // Upload new cover if selected
      if (coverFile) {
        const newUrl = await uploadCoverImage(coverFile, ebookId)
        if (newUrl) coverUrl = newUrl
      }

      await updateEbook(ebookId, {
        title_en: form.title_en,
        title_pt: form.title_pt || null,
        slug: form.slug,
        description_en: form.description_en || null,
        description_pt: form.description_pt || null,
        price_usd: Math.round(form.price_usd * 100),
        price_brl: Math.round(form.price_brl * 100),
        stripe_price_id_usd: form.stripe_price_id_usd || null,
        stripe_price_id_brl: form.stripe_price_id_brl || null,
        estimated_read_time_minutes: form.estimated_read_time_minutes,
        status: form.status,
        cover_image_url: coverUrl || null,
      })

      router.push('/admin/ebooks-manage')
    } catch (error) {
      alert('Failed to update ebook: ' + (error as Error).message)
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
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-3xl font-bold">Edit E-book</h1>
            <Link href={`/admin/ebooks-manage/${ebookId}/chapters`}>
              <Button variant="ghost" className="border border-neutral-700">
                <BookOpen className="w-4 h-4 mr-2" />
                Manage Chapters
              </Button>
            </Link>
          </div>
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
                <Label htmlFor="cover">Upload New Cover Image</Label>
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
                    onChange={(e) => setForm(prev => ({ ...prev, title_en: e.target.value }))}
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

          {/* Pricing */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_usd">Price (USD)</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <Input
                    id="price_usd"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price_usd}
                    onChange={(e) => setForm(prev => ({ ...prev, price_usd: parseFloat(e.target.value) || 0 }))}
                    className="pl-7 bg-neutral-800 border-neutral-700"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="price_brl">Price (BRL)</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                  <Input
                    id="price_brl"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price_brl}
                    onChange={(e) => setForm(prev => ({ ...prev, price_brl: parseFloat(e.target.value) || 0 }))}
                    className="pl-10 bg-neutral-800 border-neutral-700"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="stripe_price_id_usd">Stripe Price ID (USD)</Label>
                <Input
                  id="stripe_price_id_usd"
                  value={form.stripe_price_id_usd}
                  onChange={(e) => setForm(prev => ({ ...prev, stripe_price_id_usd: e.target.value }))}
                  className="mt-1 bg-neutral-800 border-neutral-700"
                  placeholder="price_..."
                />
              </div>
              <div>
                <Label htmlFor="stripe_price_id_brl">Stripe Price ID (BRL)</Label>
                <Input
                  id="stripe_price_id_brl"
                  value={form.stripe_price_id_brl}
                  onChange={(e) => setForm(prev => ({ ...prev, stripe_price_id_brl: e.target.value }))}
                  className="mt-1 bg-neutral-800 border-neutral-700"
                  placeholder="price_..."
                />
              </div>
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
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
