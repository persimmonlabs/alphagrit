'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockData } from '@/lib/mock-data';

interface Ebook {
  id: string;
  product_id: string;
  total_chapters: number;
  estimated_read_time_minutes: number | null;
  status: string;
  theme_config: {
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
  } | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export default function AdminEbooksPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ebooks, setEbooks] = useState<(Ebook & { product?: Product })[]>([]);
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

  useEffect(() => {
    // Load ebooks with product data
    const ebooksData = mockData.ebooks || [];
    const productsData = mockData.products || [];

    const ebooksWithProducts = ebooksData.map((ebook: Ebook) => ({
      ...ebook,
      product: productsData.find((p: Product) => p.id === ebook.product_id),
    }));

    setEbooks(ebooksWithProducts);
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const filteredEbooks = ebooks.filter((ebook) =>
    ebook.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setEbooks(ebooks.filter((e) => e.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#00ff41]">AlphaGrit</h1>
        </div>
        <nav className="mt-6">
          <Link
            href="/admin"
            className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors"
          >
            <span className="text-xl">📊</span>
            <span className="ml-3">Dashboard</span>
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors"
          >
            <span className="text-xl">📦</span>
            <span className="ml-3">Products</span>
          </Link>
          <Link
            href="/admin/ebooks"
            className="flex items-center px-6 py-3 bg-neutral-800 text-[#00ff41] border-l-4 border-[#00ff41]"
          >
            <span className="text-xl">📚</span>
            <span className="ml-3">E-Books</span>
          </Link>
          <Link
            href="/admin/blog"
            className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors"
          >
            <span className="text-xl">✍️</span>
            <span className="ml-3">Blog</span>
          </Link>
          <Link
            href="/admin/settings/general"
            className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors"
          >
            <span className="text-xl">⚙️</span>
            <span className="ml-3">Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">E-Books</h1>
              <p className="text-neutral-400 mt-1">
                Manage interactive e-book content for your products
              </p>
            </div>
            <Link href="/admin/ebooks/new">
              <Button variant="filled" className="bg-[#00ff41] hover:bg-[#00cc33] text-black">
                + New E-Book
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search e-books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md bg-neutral-900 border-neutral-800 text-white"
            />
          </div>

          {/* E-books Table */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left py-4 px-6 text-neutral-400 font-medium">
                        E-Book Name
                      </th>
                      <th className="text-left py-4 px-6 text-neutral-400 font-medium">
                        Chapters
                      </th>
                      <th className="text-left py-4 px-6 text-neutral-400 font-medium">
                        Read Time
                      </th>
                      <th className="text-left py-4 px-6 text-neutral-400 font-medium">
                        Status
                      </th>
                      <th className="text-right py-4 px-6 text-neutral-400 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEbooks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-neutral-400">
                          No e-books found. Create one to get started.
                        </td>
                      </tr>
                    ) : (
                      filteredEbooks.map((ebook) => (
                        <tr
                          key={ebook.id}
                          className="border-b border-neutral-800 hover:bg-neutral-800/50"
                        >
                          <td className="py-4 px-6">
                            <div>
                              <div className="font-medium">{ebook.product?.name || 'Unknown Product'}</div>
                              <div className="text-sm text-neutral-400">
                                {ebook.product?.slug || ebook.product_id}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-[#00ff41] font-bold">
                              {ebook.total_chapters}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-neutral-400">
                            {ebook.estimated_read_time_minutes
                              ? `${ebook.estimated_read_time_minutes} min`
                              : '-'}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-3 py-1 rounded-full text-xs ${
                                ebook.status === 'active' || ebook.status === 'published'
                                  ? 'bg-[#00ff41]/20 text-[#00ff41]'
                                  : 'bg-neutral-700 text-neutral-400'
                              }`}
                            >
                              {ebook.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex gap-2 justify-end">
                              <Link href={`/admin/ebooks/${ebook.id}`}>
                                <Button variant="ghost" className="text-white hover:text-[#00ff41]">
                                  Edit
                                </Button>
                              </Link>
                              <Link href={`/admin/ebooks/${ebook.id}/chapters`}>
                                <Button variant="ghost" className="text-white hover:text-[#00ff41]">
                                  Chapters
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                className="text-red-400 hover:text-red-500"
                                onClick={() => setDeleteConfirm(ebook.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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
                    Are you sure you want to delete this e-book? This will remove all chapters,
                    sections, and content blocks. This action cannot be undone.
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
