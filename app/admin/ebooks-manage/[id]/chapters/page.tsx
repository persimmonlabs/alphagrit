'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getEbookById, deleteChapter, type Ebook, type Chapter } from '@/lib/supabase/ebooks-client'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, ArrowLeft, Eye, EyeOff, GripVertical, BookOpen } from 'lucide-react'

export default function ChaptersPage() {
  const router = useRouter()
  const params = useParams()
  const ebookId = params.id as string

  const [ebook, setEbook] = useState<Ebook | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

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

    const data = await getEbookById(ebookId)
    if (!data) {
      router.push('/admin/ebooks-manage')
      return
    }

    setEbook(data)
    setLoading(false)
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    setDeleting(id)
    try {
      await deleteChapter(id)
      setEbook(prev => prev ? {
        ...prev,
        chapters: prev.chapters?.filter(c => c.id !== id)
      } : null)
    } catch (error) {
      alert('Failed to delete chapter')
    }
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!ebook) {
    return null
  }

  const chapters = ebook.chapters || []

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/admin/ebooks-manage/${ebookId}`} className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to E-book
          </Link>
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold">Chapters</h1>
              <p className="text-gray-400 mt-1">{ebook.title_en}</p>
            </div>
            <Link href={`/admin/ebooks-manage/${ebookId}/chapters/new`}>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Chapter
              </Button>
            </Link>
          </div>
        </div>

        {/* Chapters List */}
        {chapters.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900 rounded-xl border border-neutral-800">
            <BookOpen className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No chapters yet</h2>
            <p className="text-gray-400 mb-6">Add your first chapter to get started.</p>
            <Link href={`/admin/ebooks-manage/${ebookId}/chapters/new`}>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Chapter
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Drag Handle */}
                  <div className="text-gray-600 cursor-grab">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Chapter Number */}
                  <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center text-lg font-bold">
                    {chapter.chapter_number}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">
                      {chapter.title_en}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      {chapter.is_published ? (
                        <span className="flex items-center gap-1 text-xs text-green-500">
                          <Eye className="w-3 h-3" />
                          Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <EyeOff className="w-3 h-3" />
                          Draft
                        </span>
                      )}
                      {chapter.is_free_preview && (
                        <span className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded">
                          Free Preview
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/ebooks-manage/${ebookId}/chapters/${chapter.id}`}>
                      <Button variant="ghost" size="sm" className="border border-neutral-700">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="border border-red-800 text-red-500 hover:bg-red-950"
                      onClick={() => handleDelete(chapter.id, chapter.title_en)}
                      disabled={deleting === chapter.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
