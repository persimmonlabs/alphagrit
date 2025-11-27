'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
}

interface Product {
  id: string;
  name: string;
  slug: string;
}

export default function EditEbookPage() {
  const router = useRouter();
  const params = useParams();
  const ebookId = params.id as string;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    primaryColor: '#f97316',
    accentColor: '#ef4444',
    fontFamily: 'Inter',
    status: 'draft' as 'draft' | 'active' | 'published',
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    // Load ebook data
    const ebooksData = mockData.ebooks || [];
    const foundEbook = ebooksData.find((e: Ebook) => e.id === ebookId);

    if (foundEbook) {
      setEbook(foundEbook);
      setFormData({
        primaryColor: foundEbook.theme_config?.primaryColor || '#f97316',
        accentColor: foundEbook.theme_config?.accentColor || '#ef4444',
        fontFamily: foundEbook.theme_config?.fontFamily || 'Inter',
        status: foundEbook.status as 'draft' | 'active' | 'published',
      });

      // Load product data
      const productsData = mockData.products || [];
      const foundProduct = productsData.find((p: Product) => p.id === foundEbook.product_id);
      setProduct(foundProduct || null);
    }
  }, [ebookId]);

  if (!isAuthenticated) {
    return null;
  }

  if (!ebook) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>E-book not found</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updating e-book:', formData);
    alert('E-book updated successfully!');
    router.push('/admin/ebooks');
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
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Edit E-Book</h1>
              <p className="text-neutral-400">
                {product?.name || 'Unknown Product'}
              </p>
            </div>
            <Link href={`/admin/ebooks/${ebookId}/chapters`}>
              <Button variant="filled" className="bg-[#00ff41] hover:bg-[#00cc33] text-black">
                Manage Chapters ({ebook.total_chapters})
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#00ff41]">{ebook.total_chapters}</div>
                <div className="text-sm text-neutral-400">Chapters</div>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#00ff41]">
                  {ebook.estimated_read_time_minutes || '-'}
                </div>
                <div className="text-sm text-neutral-400">Minutes to Read</div>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#00ff41]">0</div>
                <div className="text-sm text-neutral-400">Active Readers</div>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#00ff41]">0%</div>
                <div className="text-sm text-neutral-400">Avg. Completion</div>
              </CardContent>
            </Card>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="bg-neutral-900 border-neutral-800 mb-6">
              <CardHeader>
                <CardTitle>Theme Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor" className="text-white">
                      Primary Color
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) =>
                          setFormData({ ...formData, primaryColor: e.target.value })
                        }
                        className="w-12 h-10 p-1 bg-neutral-800 border-neutral-700"
                      />
                      <Input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) =>
                          setFormData({ ...formData, primaryColor: e.target.value })
                        }
                        className="bg-neutral-800 border-neutral-700 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accentColor" className="text-white">
                      Accent Color
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) =>
                          setFormData({ ...formData, accentColor: e.target.value })
                        }
                        className="w-12 h-10 p-1 bg-neutral-800 border-neutral-700"
                      />
                      <Input
                        type="text"
                        value={formData.accentColor}
                        onChange={(e) =>
                          setFormData({ ...formData, accentColor: e.target.value })
                        }
                        className="bg-neutral-800 border-neutral-700 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Font Family */}
                <div>
                  <Label htmlFor="fontFamily" className="text-white">
                    Font Family
                  </Label>
                  <Select
                    value={formData.fontFamily}
                    onValueChange={(value) => setFormData({ ...formData, fontFamily: value })}
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectItem value="Inter">Inter (Default)</SelectItem>
                      <SelectItem value="Merriweather">Merriweather (Serif)</SelectItem>
                      <SelectItem value="Roboto Mono">Roboto Mono (Monospace)</SelectItem>
                      <SelectItem value="Lora">Lora (Elegant)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                  <div>
                    <Label htmlFor="status" className="text-white">
                      Publish E-Book
                    </Label>
                    <p className="text-sm text-neutral-400 mt-1">
                      {formData.status === 'active' || formData.status === 'published'
                        ? 'E-book is visible to customers who purchased the product'
                        : 'E-book is hidden (draft mode)'}
                    </p>
                  </div>
                  <Switch
                    id="status"
                    checked={formData.status === 'active' || formData.status === 'published'}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, status: checked ? 'active' : 'draft' })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="bg-neutral-900 border-neutral-800 mb-6">
              <CardHeader>
                <CardTitle>Theme Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="p-6 rounded-lg border border-neutral-700 bg-neutral-950"
                  style={{
                    fontFamily: formData.fontFamily,
                  }}
                >
                  <h4
                    className="text-xl font-bold mb-2"
                    style={{ color: formData.primaryColor }}
                  >
                    Chapter 1: Introduction
                  </h4>
                  <p className="text-neutral-300 mb-4">
                    This is how your e-book content will appear with the selected theme
                    settings. The primary color is used for headings and highlights.
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className="px-4 py-2 rounded text-black font-medium"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      Continue Reading
                    </button>
                    <span
                      className="text-sm"
                      style={{ color: formData.accentColor }}
                    >
                      *Important note
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="submit"
                variant="filled"
                className="bg-[#00ff41] hover:bg-[#00cc33] text-black"
              >
                Save Changes
              </Button>
              <Link href="/admin/ebooks">
                <Button type="button" variant="ghost" className="text-white">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
