'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getEbooksAdmin, deleteEbook, type Ebook } from '@/lib/supabase/ebooks-client'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, BookOpen, Eye, EyeOff, ChevronRight } from 'lucide-react'

export default function EbooksManagePage() {
  const router = useRouter()
  const [ebooks, setEbooks] = useState<Ebook[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

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

    const data = await getEbooksAdmin()
    setEbooks(data)
    setLoading(false)
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"? This will also delete all chapters.`)) {
      return
    }

    setDeleting(id)
    try {
      await deleteEbook(id)
      setEbooks(ebooks.filter(e => e.id !== id))
    } catch (error) {
      alert('Failed to delete ebook')
    }
    setDeleting(null)
  }

  const statusColors = {
    draft: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    active: 'bg-green-500/10 text-green-500 border-green-500/20',
    archived: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-gray-400 hover:text-white text-sm mb-2 inline-block">
              ← Back to Admin
            </Link>
            <h1 className="text-3xl font-bold">E-book Management</h1>
            <p className="text-gray-400 mt-1">Create and manage your e-books</p>
          </div>
          <Link href="/admin/ebooks-manage/new">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              New E-book
            </Button>
          </Link>
        </div>

        {/* Ebooks List */}
        {ebooks.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900 rounded-xl border border-neutral-800">
            <BookOpen className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No e-books yet</h2>
            <p className="text-gray-400 mb-6">Create your first e-book to get started.</p>
            <Link href="/admin/ebooks-manage/new">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Create E-book
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {ebooks.map((ebook) => (
              <div
                key={ebook.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start gap-6">
                  {/* Cover Image */}
                  <div className="w-24 h-32 bg-neutral-800 rounded-lg flex-shrink-0 overflow-hidden">
                    {ebook.cover_image_url ? (
                      <img
                        src={ebook.cover_image_url}
                        alt={ebook.title_en}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {ebook.title_en}
                        </h3>
                        {ebook.title_pt && (
                          <p className="text-gray-400 text-sm mb-2">PT: {ebook.title_pt}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`px-2 py-1 text-xs rounded border ${statusColors[ebook.status]}`}>
                            {ebook.status.toUpperCase()}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {ebook.chapters?.length || 0} chapters
                          </span>
                          <span className="text-gray-400 text-sm">
                            ${(ebook.price_usd / 100).toFixed(2)} USD
                          </span>
                        </div>
                      </div>
                    </div>

                    {ebook.description_en && (
                      <p className="text-gray-400 text-sm mt-3 line-clamp-2">
                        {ebook.description_en}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/admin/ebooks-manage/${ebook.id}/chapters`}>
                      <Button variant="ghost" size="sm" className="border border-neutral-700">
                        <BookOpen className="w-4 h-4 mr-1" />
                        Chapters
                      </Button>
                    </Link>
                    <Link href={`/admin/ebooks-manage/${ebook.id}`}>
                      <Button variant="ghost" size="sm" className="border border-neutral-700">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="border border-red-800 text-red-500 hover:bg-red-950"
                      onClick={() => handleDelete(ebook.id, ebook.title_en)}
                      disabled={deleting === ebook.id}
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
