'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockData } from '@/lib/mock-data';

interface Product {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export default function NewEbookPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    productId: '',
    primaryColor: '#f97316',
    accentColor: '#ef4444',
    fontFamily: 'Inter',
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
    // Load products that don't have e-books yet
    const allProducts = mockData.products || [];
    const existingEbookProductIds = (mockData.ebooks || []).map((e: any) => e.product_id);
    const availableProducts = allProducts.filter(
      (p: Product) => !existingEbookProductIds.includes(p.id)
    );
    setProducts(availableProducts);
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission
    console.log('Creating e-book:', formData);
    alert('E-book created successfully! Redirecting to chapters...');
    // In real app, would create the ebook and redirect to its edit page
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New E-Book</h1>
            <p className="text-neutral-400">
              Link an e-book to an existing product to enable interactive reading
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="bg-neutral-900 border-neutral-800 mb-6">
              <CardHeader>
                <CardTitle>E-Book Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Selection */}
                <div>
                  <Label htmlFor="product" className="text-white">
                    Link to Product
                  </Label>
                  <p className="text-sm text-neutral-400 mt-1 mb-2">
                    Select the product this e-book belongs to
                  </p>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) => setFormData({ ...formData, productId: value })}
                    required
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                      {products.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No products available
                        </SelectItem>
                      ) : (
                        products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {products.length === 0 && (
                    <p className="text-yellow-500 text-sm mt-2">
                      All products already have e-books linked. Create a new product first.
                    </p>
                  )}
                </div>

                {/* Theme Configuration */}
                <div className="border-t border-neutral-800 pt-6">
                  <h3 className="text-lg font-semibold mb-4">Theme Configuration</h3>
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
                          placeholder="#f97316"
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
                          placeholder="#ef4444"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
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
                </div>

                {/* Preview */}
                <div className="border-t border-neutral-800 pt-6">
                  <h3 className="text-lg font-semibold mb-4">Theme Preview</h3>
                  <div
                    className="p-6 rounded-lg border border-neutral-700"
                    style={{
                      fontFamily: formData.fontFamily,
                    }}
                  >
                    <h4
                      className="text-xl font-bold mb-2"
                      style={{ color: formData.primaryColor }}
                    >
                      Chapter Title Example
                    </h4>
                    <p className="text-neutral-300 mb-4">
                      This is how your e-book content will appear with the selected theme
                      settings. The primary color is used for headings and highlights.
                    </p>
                    <button
                      type="button"
                      className="px-4 py-2 rounded text-black font-medium"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      Continue Reading
                    </button>
                    <span
                      className="ml-4 text-sm"
                      style={{ color: formData.accentColor }}
                    >
                      *Accent color for highlights
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
                disabled={!formData.productId}
              >
                Create E-Book
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
