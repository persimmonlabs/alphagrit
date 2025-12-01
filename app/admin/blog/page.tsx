'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getBlogPostsAdmin, deleteBlogPost, type BlogPost } from '@/lib/supabase/blog-client'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Eye, EyeOff, Star, FileText } from 'lucide-react'

export default function AdminBlogPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
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

    const postsData = await getBlogPostsAdmin()
    setPosts(postsData)
    setLoading(false)
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    setDeleting(id)
    const success = await deleteBlogPost(id)
    if (success) {
      setPosts(posts.filter(p => p.id !== id))
    } else {
      alert('Failed to delete post')
    }
    setDeleting(null)
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'Not published'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
            <Link href="/admin" className="text-gray-400 hover:text-white text-sm mb-2 block">
              &larr; Back to Admin
            </Link>
            <h1 className="text-3xl font-bold">Blog Posts</h1>
            <p className="text-gray-400 mt-1">{posts.length} posts total</p>
          </div>
          <Link href="/admin/blog/new">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </Link>
        </div>

        {/* Posts Table */}
        {posts.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No blog posts yet</h2>
            <p className="text-gray-400 mb-6">Create your first blog post to get started</p>
            <Link href="/admin/blog/new">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-800/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Title</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Published</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {post.cover_image_url ? (
                          <img
                            src={post.cover_image_url}
                            alt=""
                            className="w-12 h-8 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-8 bg-neutral-700 rounded flex items-center justify-center">
                            <FileText className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {post.title_en}
                            {post.is_featured && (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </p>
                          <p className="text-sm text-gray-500">/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-neutral-800 rounded text-sm capitalize">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {post.is_published ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                          <Eye className="w-3 h-3" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-sm">
                          <EyeOff className="w-3 h-3" />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {formatDate(post.published_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/blog/${post.id}/edit`}>
                          <Button variant="ghost" size="sm" className="hover:bg-neutral-800">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-red-500/20 text-red-400"
                          onClick={() => handleDelete(post.id, post.title_en)}
                          disabled={deleting === post.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
