'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { mockData } from '@/lib/mock-data';
import { GripVertical, Plus, Trash2, Eye, Edit, ChevronUp, ChevronDown } from 'lucide-react';

interface Chapter {
  id: string;
  ebook_id: string;
  chapter_number: number;
  display_order: number;
  title_en: string;
  title_pt: string | null;
  slug: string;
  summary_en: string | null;
  summary_pt: string | null;
  estimated_read_time_minutes: number | null;
  is_free_preview: boolean;
  is_published: boolean;
}

interface Ebook {
  id: string;
  product_id: string;
  total_chapters: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
}

export default function ChaptersPage() {
  const router = useRouter();
  const params = useParams();
  const ebookId = params.id as string;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [showNewChapterForm, setShowNewChapterForm] = useState(false);
  const [newChapter, setNewChapter] = useState({
    title_en: '',
    title_pt: '',
    slug: '',
    summary_en: '',
    summary_pt: '',
    is_free_preview: false,
  });
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
    // Load ebook and chapters
    const ebooksData = mockData.ebooks || [];
    const foundEbook = ebooksData.find((e: Ebook) => e.id === ebookId);

    if (foundEbook) {
      setEbook(foundEbook);

      // Load product
      const productsData = mockData.products || [];
      const foundProduct = productsData.find((p: Product) => p.id === foundEbook.product_id);
      setProduct(foundProduct || null);

      // Load chapters
      const chaptersData = mockData.ebookChapters || [];
      const ebookChapters = chaptersData
        .filter((c: Chapter) => c.ebook_id === ebookId)
        .sort((a: Chapter, b: Chapter) => a.display_order - b.display_order);
      setChapters(ebookChapters);
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `chapter-${Date.now()}`;
    const chapterNumber = chapters.length + 1;

    const chapter: Chapter = {
      id: newId,
      ebook_id: ebookId,
      chapter_number: chapterNumber,
      display_order: chapterNumber,
      title_en: newChapter.title_en,
      title_pt: newChapter.title_pt || null,
      slug: newChapter.slug || generateSlug(newChapter.title_en),
      summary_en: newChapter.summary_en || null,
      summary_pt: newChapter.summary_pt || null,
      estimated_read_time_minutes: null,
      is_free_preview: newChapter.is_free_preview,
      is_published: false,
    };

    setChapters([...chapters, chapter]);
    setNewChapter({
      title_en: '',
      title_pt: '',
      slug: '',
      summary_en: '',
      summary_pt: '',
      is_free_preview: false,
    });
    setShowNewChapterForm(false);
  };

  const handleDeleteChapter = (id: string) => {
    setChapters(chapters.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  };

  const moveChapter = (index: number, direction: 'up' | 'down') => {
    const newChapters = [...chapters];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= chapters.length) return;

    [newChapters[index], newChapters[targetIndex]] = [newChapters[targetIndex], newChapters[index]];

    // Update display order
    newChapters.forEach((chapter, i) => {
      chapter.display_order = i + 1;
      chapter.chapter_number = i + 1;
    });

    setChapters(newChapters);
  };

  const togglePublished = (id: string) => {
    setChapters(
      chapters.map((c) =>
        c.id === id ? { ...c, is_published: !c.is_published } : c
      )
    );
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
          {/* Breadcrumb */}
          <div className="mb-4 text-sm">
            <Link href="/admin/ebooks" className="text-neutral-400 hover:text-white">
              E-Books
            </Link>
            <span className="text-neutral-600 mx-2">/</span>
            <Link href={`/admin/ebooks/${ebookId}`} className="text-neutral-400 hover:text-white">
              {product?.name || 'E-Book'}
            </Link>
            <span className="text-neutral-600 mx-2">/</span>
            <span className="text-white">Chapters</span>
          </div>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Chapters</h1>
              <p className="text-neutral-400">
                Manage chapters for {product?.name || 'this e-book'}
              </p>
            </div>
            <Button
              variant="filled"
              className="bg-[#00ff41] hover:bg-[#00cc33] text-black"
              onClick={() => setShowNewChapterForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Chapter
            </Button>
          </div>

          {/* New Chapter Form */}
          {showNewChapterForm && (
            <Card className="bg-neutral-900 border-neutral-800 mb-6">
              <CardHeader>
                <CardTitle>New Chapter</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddChapter} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title_en" className="text-white">Title (English)</Label>
                      <Input
                        id="title_en"
                        type="text"
                        required
                        value={newChapter.title_en}
                        onChange={(e) => {
                          setNewChapter({
                            ...newChapter,
                            title_en: e.target.value,
                            slug: generateSlug(e.target.value),
                          });
                        }}
                        className="bg-neutral-800 border-neutral-700 text-white mt-2"
                        placeholder="Chapter title in English"
                      />
                    </div>
                    <div>
                      <Label htmlFor="title_pt" className="text-white">Title (Portuguese)</Label>
                      <Input
                        id="title_pt"
                        type="text"
                        value={newChapter.title_pt}
                        onChange={(e) => setNewChapter({ ...newChapter, title_pt: e.target.value })}
                        className="bg-neutral-800 border-neutral-700 text-white mt-2"
                        placeholder="Título do capítulo em português"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="slug" className="text-white">URL Slug</Label>
                    <Input
                      id="slug"
                      type="text"
                      value={newChapter.slug}
                      onChange={(e) => setNewChapter({ ...newChapter, slug: e.target.value })}
                      className="bg-neutral-800 border-neutral-700 text-white mt-2"
                      placeholder="chapter-url-slug"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="summary_en" className="text-white">Summary (English)</Label>
                      <Input
                        id="summary_en"
                        type="text"
                        value={newChapter.summary_en}
                        onChange={(e) => setNewChapter({ ...newChapter, summary_en: e.target.value })}
                        className="bg-neutral-800 border-neutral-700 text-white mt-2"
                        placeholder="Brief summary for table of contents"
                      />
                    </div>
                    <div>
                      <Label htmlFor="summary_pt" className="text-white">Summary (Portuguese)</Label>
                      <Input
                        id="summary_pt"
                        type="text"
                        value={newChapter.summary_pt}
                        onChange={(e) => setNewChapter({ ...newChapter, summary_pt: e.target.value })}
                        className="bg-neutral-800 border-neutral-700 text-white mt-2"
                        placeholder="Breve resumo para o sumário"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      id="is_free_preview"
                      checked={newChapter.is_free_preview}
                      onCheckedChange={(checked) =>
                        setNewChapter({ ...newChapter, is_free_preview: checked })
                      }
                    />
                    <Label htmlFor="is_free_preview" className="text-white">
                      Free Preview (accessible without purchase)
                    </Label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      variant="filled"
                      className="bg-[#00ff41] hover:bg-[#00cc33] text-black"
                    >
                      Create Chapter
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-white"
                      onClick={() => setShowNewChapterForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Chapters List */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-0">
              {chapters.length === 0 ? (
                <div className="py-12 text-center text-neutral-400">
                  <p className="mb-4">No chapters yet. Add your first chapter to get started.</p>
                  <Button
                    variant="ghost"
                    className="text-[#00ff41]"
                    onClick={() => setShowNewChapterForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Chapter
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-neutral-800">
                  {chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className="p-4 flex items-center gap-4 hover:bg-neutral-800/50"
                    >
                      {/* Reorder Controls */}
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => moveChapter(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveChapter(index, 'down')}
                          disabled={index === chapters.length - 1}
                          className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Chapter Number */}
                      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-[#00ff41]">
                        {chapter.chapter_number}
                      </div>

                      {/* Chapter Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{chapter.title_en}</h3>
                          {chapter.is_free_preview && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">
                              Free
                            </span>
                          )}
                          {!chapter.is_published && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500">
                              Draft
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-400 truncate">
                          {chapter.summary_en || 'No summary'}
                        </p>
                      </div>

                      {/* Read Time */}
                      <div className="text-sm text-neutral-400">
                        {chapter.estimated_read_time_minutes
                          ? `${chapter.estimated_read_time_minutes} min`
                          : '-'}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={chapter.is_published}
                          onCheckedChange={() => togglePublished(chapter.id)}
                          title={chapter.is_published ? 'Published' : 'Draft'}
                        />
                        <Link href={`/admin/ebooks/${ebookId}/chapters/${chapter.id}`}>
                          <Button variant="ghost" size="sm" className="text-white hover:text-[#00ff41]">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-500"
                          onClick={() => setDeleteConfirm(chapter.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            <Link href={`/admin/ebooks/${ebookId}`}>
              <Button variant="ghost" className="text-white">
                Back to E-Book Settings
              </Button>
            </Link>
          </div>

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <Card className="bg-neutral-900 border-neutral-800 max-w-md w-full mx-4">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Delete Chapter</h3>
                  <p className="text-neutral-400 mb-6">
                    Are you sure you want to delete this chapter? All sections and content
                    blocks will be permanently removed. This action cannot be undone.
                  </p>
                  <div className="flex gap-4">
                    <Button
                      variant="filled"
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                      onClick={() => handleDeleteChapter(deleteConfirm)}
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
