'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MOCK_PRODUCTS, Product } from '@/lib/mock-data';

export default function AdminProductsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
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

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name) * direction;
      }
      return (a.price_usd - b.price_usd) * direction;
    });

  const handleDelete = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  const toggleSort = (field: 'name' | 'price') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
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
            className="flex items-center px-6 py-3 bg-neutral-800 text-[#00ff41] border-l-4 border-[#00ff41]"
          >
            <span className="text-xl">📚</span>
            <span className="ml-3">Products</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors"
          >
            <span className="text-xl">🛒</span>
            <span className="ml-3">Orders</span>
          </Link>
          <Link
            href="/admin/customers"
            className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors"
          >
            <span className="text-xl">👥</span>
            <span className="ml-3">Customers</span>
          </Link>
          <Link
            href="/admin/ebooks"
            className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors"
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
            <h1 className="text-3xl font-bold">Products</h1>
            <Link href="/admin/products/new">
              <Button variant="filled" className="bg-[#00ff41] hover:bg-[#00cc33] text-black">
                + New Product
              </Button>
            </Link>
          </div>

          {/* Search and Sort */}
          <div className="mb-6 flex gap-4 items-center">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md bg-neutral-900 border-neutral-800 text-white"
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => toggleSort('name')}
                className="text-white"
              >
                Sort by Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => toggleSort('price')}
                className="text-white"
              >
                Sort by Price {sortBy === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Button>
            </div>
          </div>

          {/* Products Table */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="text-left py-4 px-6 text-neutral-400 font-medium">
                        Product Name
                      </th>
                      <th className="text-left py-4 px-6 text-neutral-400 font-medium">
                        Price (USD)
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
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-neutral-800 hover:bg-neutral-800/50"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-neutral-400">{product.author}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[#00ff41] font-bold">
                          ${product.price_usd}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              product.status === 'active'
                                ? 'bg-[#00ff41]/20 text-[#00ff41]'
                                : 'bg-neutral-700 text-neutral-400'
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex gap-2 justify-end">
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button variant="ghost" className="text-white hover:text-[#00ff41]">
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              className="text-red-400 hover:text-red-500"
                              onClick={() => setDeleteConfirm(product.id)}
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
                <CardHeader>
                  <CardTitle>Confirm Delete</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-400 mb-6">
                    Are you sure you want to delete this product? This action cannot be undone.
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
