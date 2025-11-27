'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MOCK_BLOG_POSTS, BlogPost } from '@/lib/mock-data';

export default function AdminBlogPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>(MOCK_BLOG_POSTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return null;
  }

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setPosts(posts.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#00ff41]">AlphaGrit</h1>
        </div>
        <nav className="mt-6">
          <Link href="/admin" className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors">
            <span className="text-xl">📊</span>
            <span className="ml-3">Dashboard</span>
          </Link>
          <Link href="/admin/products" className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors">
            <span className="text-xl">📚</span>
            <span className="ml-3">Products</span>
          </Link>
          <Link
            href="/admin/blog"
            className="flex items-center px-6 py-3 bg-neutral-800 text-[#00ff41] border-l-4 border-[#00ff41]"
          >
            <span className="text-xl">✍️</span>
            <span className="ml-3">Blog</span>
          </Link>
          <Link href="/admin/settings/general" className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors">
            <span className="text-xl">⚙️</span>
            <span className="ml-3">Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Blog Posts</h1>
            <Link href="/admin/blog/new">
              <Button variant="filled" className="bg-[#00ff41] hover:bg-[#00cc33] text-black">
                + New Post
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search blog posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md bg-neutral-900 border-neutral-800 text-white"
            />
          </div>

          {/* Blog Posts Table */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left py-4 px-6 text-neutral-400 font-medium">Title</th>
                      <th className="text-left py-4 px-6 text-neutral-400 font-medium">Author</th>
                      <th className="text-left py-4 px-6 text-neutral-400 font-medium">Published Date</th>
                      <th className="text-left py-4 px-6 text-neutral-400 font-medium">Status</th>
                      <th className="text-right py-4 px-6 text-neutral-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr key={post.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                        <td className="py-4 px-6">
                          <div className="font-medium">{post.title}</div>
                          <div className="text-sm text-neutral-400 mt-1">{post.excerpt}</div>
                        </td>
                        <td className="py-4 px-6">{post.author}</td>
                        <td className="py-4 px-6 text-neutral-400">{formatDate(post.published_at)}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              post.status === 'published'
                                ? 'bg-[#00ff41]/20 text-[#00ff41]'
                                : 'bg-neutral-700 text-neutral-400'
                            }`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex gap-2 justify-end">
                            <Link href={`/admin/blog/${post.id}/edit`}>
                              <Button variant="ghost" className="text-white hover:text-[#00ff41]">
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              className="text-red-400 hover:text-red-500"
                              onClick={() => setDeleteConfirm(post.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <Card className="bg-neutral-900 border-neutral-800 max-w-md w-full mx-4">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
                  <p className="text-neutral-400 mb-6">
                    Are you sure you want to delete this blog post? This action cannot be undone.
                  </p>
                  <div className="flex gap-4">
                    <Button
                      variant="filled"
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => handleDelete(deleteConfirm)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 text-white"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
