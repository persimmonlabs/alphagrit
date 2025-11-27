'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MOCK_CATEGORIES } from '@/lib/mock-data';

export default function NewProductPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    titlePT: '',
    titleEN: '',
    descriptionPT: '',
    descriptionEN: '',
    priceBRL: '',
    priceUSD: '',
    categoryId: '',
    author: '',
    pages: '',
    status: 'draft' as 'draft' | 'active',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission - in real app, this would send data to API
    console.log('Creating product:', formData);
    alert('Product created successfully!');
    router.push('/admin/products');
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file);
      // Mock progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 100);
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
          <Link href="/admin" className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors">
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
          <Link href="/admin/blog" className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors">
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New Product</h1>
            <p className="text-neutral-400">Add a new ebook to your platform</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="bg-neutral-900 border-neutral-800 mb-6">
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title PT */}
                <div>
                  <Label htmlFor="titlePT" className="text-white">Title (Portuguese)</Label>
                  <Input
                    id="titlePT"
                    type="text"
                    required
                    value={formData.titlePT}
                    onChange={(e) => setFormData({ ...formData, titlePT: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                    placeholder="Nome do produto em português"
                  />
                </div>

                {/* Title EN */}
                <div>
                  <Label htmlFor="titleEN" className="text-white">Title (English)</Label>
                  <Input
                    id="titleEN"
                    type="text"
                    required
                    value={formData.titleEN}
                    onChange={(e) => setFormData({ ...formData, titleEN: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                    placeholder="Product name in English"
                  />
                </div>

                {/* Description PT */}
                <div>
                  <Label htmlFor="descriptionPT" className="text-white">Description (Portuguese)</Label>
                  <Textarea
                    id="descriptionPT"
                    required
                    value={formData.descriptionPT}
                    onChange={(e) => setFormData({ ...formData, descriptionPT: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                    placeholder="Descrição do produto em português"
                    rows={4}
                  />
                </div>

                {/* Description EN */}
                <div>
                  <Label htmlFor="descriptionEN" className="text-white">Description (English)</Label>
                  <Textarea
                    id="descriptionEN"
                    required
                    value={formData.descriptionEN}
                    onChange={(e) => setFormData({ ...formData, descriptionEN: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                    placeholder="Product description in English"
                    rows={4}
                  />
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priceBRL" className="text-white">Price (BRL)</Label>
                    <Input
                      id="priceBRL"
                      type="number"
                      step="0.01"
                      required
                      value={formData.priceBRL}
                      onChange={(e) => setFormData({ ...formData, priceBRL: e.target.value })}
                      className="bg-neutral-800 border-neutral-700 text-white mt-2"
                      placeholder="99.90"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priceUSD" className="text-white">Price (USD)</Label>
                    <Input
                      id="priceUSD"
                      type="number"
                      step="0.01"
                      required
                      value={formData.priceUSD}
                      onChange={(e) => setFormData({ ...formData, priceUSD: e.target.value })}
                      className="bg-neutral-800 border-neutral-700 text-white mt-2"
                      placeholder="19.99"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white mt-2">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                      {MOCK_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Author and Pages */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="author" className="text-white">Author</Label>
                    <Input
                      id="author"
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="bg-neutral-800 border-neutral-700 text-white mt-2"
                      placeholder="Wagner Nascimento"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pages" className="text-white">Pages</Label>
                    <Input
                      id="pages"
                      type="number"
                      required
                      value={formData.pages}
                      onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                      className="bg-neutral-800 border-neutral-700 text-white mt-2"
                      placeholder="350"
                    />
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div>
                  <Label htmlFor="coverImage" className="text-white">Cover Image</Label>
                  <Input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setCoverImage)}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                  />
                  {coverImage && (
                    <p className="text-sm text-[#00ff41] mt-2">
                      ✓ {coverImage.name} uploaded
                    </p>
                  )}
                </div>

                {/* PDF Upload */}
                <div>
                  <Label htmlFor="pdfFile" className="text-white">PDF File</Label>
                  <Input
                    id="pdfFile"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, setPdfFile)}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                  />
                  {pdfFile && uploadProgress > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-neutral-400">{pdfFile.name}</span>
                        <span className="text-[#00ff41]">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-neutral-700 rounded-full h-2">
                        <div
                          className="bg-[#00ff41] h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="status" className="text-white">Status</Label>
                    <p className="text-sm text-neutral-400 mt-1">
                      {formData.status === 'active' ? 'Product is visible to customers' : 'Product is hidden (draft)'}
                    </p>
                  </div>
                  <Switch
                    id="status"
                    checked={formData.status === 'active'}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, status: checked ? 'active' : 'draft' })
                    }
                  />
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
                Create Product
              </Button>
              <Link href="/admin/products">
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
