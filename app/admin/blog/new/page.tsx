'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function NewBlogPostPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    titlePT: '',
    titleEN: '',
    excerptPT: '',
    excerptEN: '',
    contentPT: '',
    contentEN: '',
    author: 'Wagner Nascimento',
    status: 'draft' as 'draft' | 'published',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);

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
    console.log('Creating blog post:', formData);
    alert('Blog post created successfully!');
    router.push('/admin/blog');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New Blog Post</h1>
            <p className="text-neutral-400">Share your knowledge with your audience</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="bg-neutral-900 border-neutral-800 mb-6">
              <CardHeader>
                <CardTitle>Post Information</CardTitle>
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
                    placeholder="Título do post em português"
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
                    placeholder="Post title in English"
                  />
                </div>

                {/* Excerpt PT */}
                <div>
                  <Label htmlFor="excerptPT" className="text-white">Excerpt (Portuguese)</Label>
                  <Textarea
                    id="excerptPT"
                    required
                    value={formData.excerptPT}
                    onChange={(e) => setFormData({ ...formData, excerptPT: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                    placeholder="Resumo breve do post"
                    rows={2}
                  />
                </div>

                {/* Excerpt EN */}
                <div>
                  <Label htmlFor="excerptEN" className="text-white">Excerpt (English)</Label>
                  <Textarea
                    id="excerptEN"
                    required
                    value={formData.excerptEN}
                    onChange={(e) => setFormData({ ...formData, excerptEN: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                    placeholder="Brief post summary"
                    rows={2}
                  />
                </div>

                {/* Content PT */}
                <div>
                  <Label htmlFor="contentPT" className="text-white">Content (Portuguese)</Label>
                  <Textarea
                    id="contentPT"
                    required
                    value={formData.contentPT}
                    onChange={(e) => setFormData({ ...formData, contentPT: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                    placeholder="Conteúdo completo do post em português"
                    rows={10}
                  />
                </div>

                {/* Content EN */}
                <div>
                  <Label htmlFor="contentEN" className="text-white">Content (English)</Label>
                  <Textarea
                    id="contentEN"
                    required
                    value={formData.contentEN}
                    onChange={(e) => setFormData({ ...formData, contentEN: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                    placeholder="Full post content in English"
                    rows={10}
                  />
                </div>

                {/* Author */}
                <div>
                  <Label htmlFor="author" className="text-white">Author</Label>
                  <Input
                    id="author"
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                  />
                </div>

                {/* Cover Image Upload */}
                <div>
                  <Label htmlFor="coverImage" className="text-white">Cover Image</Label>
                  <Input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                  />
                  {coverImage && (
                    <p className="text-sm text-[#00ff41] mt-2">✓ {coverImage.name} uploaded</p>
                  )}
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="status" className="text-white">Status</Label>
                    <p className="text-sm text-neutral-400 mt-1">
                      {formData.status === 'published'
                        ? 'Post is visible to readers'
                        : 'Post is hidden (draft)'}
                    </p>
                  </div>
                  <Switch
                    id="status"
                    checked={formData.status === 'published'}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, status: checked ? 'published' : 'draft' })
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
                Create Post
              </Button>
              <Link href="/admin/blog">
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
