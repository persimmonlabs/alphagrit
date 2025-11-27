'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockData } from '@/lib/mock-data';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Type,
  Image,
  Quote,
  AlertCircle,
  Code,
  Video,
  Minus,
  ChevronRight,
  Layers,
  GripVertical,
  Save,
  Eye,
} from 'lucide-react';

type BlockType = 'text' | 'image' | 'quote' | 'callout' | 'accordion' | 'tabs' | 'code' | 'video' | 'divider';

interface ContentBlock {
  id: string;
  section_id: string;
  block_type: BlockType;
  display_order: number;
  content_en: Record<string, any>;
  content_pt: Record<string, any> | null;
}

interface MockSection {
  id: string;
  chapter_id: string;
  title_en: string | null;
  title_pt: string | null;
  display_order: number;
}

interface Section extends MockSection {
  blocks: ContentBlock[];
}

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
}

interface Product {
  id: string;
  name: string;
  slug: string;
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: any; description: string }[] = [
  { type: 'text', label: 'Text', icon: Type, description: 'Rich text content' },
  { type: 'image', label: 'Image', icon: Image, description: 'Image with caption' },
  { type: 'quote', label: 'Quote', icon: Quote, description: 'Blockquote with attribution' },
  { type: 'callout', label: 'Callout', icon: AlertCircle, description: 'Info, warning, tip, or note' },
  { type: 'code', label: 'Code', icon: Code, description: 'Code snippet with syntax highlighting' },
  { type: 'video', label: 'Video', icon: Video, description: 'Embedded video' },
  { type: 'accordion', label: 'Accordion', icon: ChevronRight, description: 'Expandable content sections' },
  { type: 'tabs', label: 'Tabs', icon: Layers, description: 'Tabbed content panels' },
  { type: 'divider', label: 'Divider', icon: Minus, description: 'Visual separator' },
];

export default function ChapterEditorPage() {
  const router = useRouter();
  const params = useParams();
  const ebookId = params.id as string;
  const chapterId = params.chapterId as string;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [showBlockPicker, setShowBlockPicker] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (!adminToken) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  useEffect(() => {
    // Load data
    const ebooksData = mockData.ebooks || [];
    const foundEbook = ebooksData.find((e: Ebook) => e.id === ebookId);

    if (foundEbook) {
      setEbook(foundEbook);

      const productsData = mockData.products || [];
      const foundProduct = productsData.find((p: Product) => p.id === foundEbook.product_id);
      setProduct(foundProduct || null);

      const chaptersData = mockData.ebookChapters || [];
      const foundChapter = chaptersData.find((c: Chapter) => c.id === chapterId);
      setChapter(foundChapter || null);

      // Load sections with blocks
      const sectionsData = mockData.ebookSections || [];
      const blocksData = mockData.ebookBlocks || [];

      const chapterSections: Section[] = (sectionsData as MockSection[])
        .filter((s) => s.chapter_id === chapterId)
        .map((section) => ({
          ...section,
          blocks: (blocksData as ContentBlock[])
            .filter((b) => b.section_id === section.id)
            .sort((a, b) => a.display_order - b.display_order),
        }))
        .sort((a, b) => a.display_order - b.display_order);

      setSections(chapterSections);

      // Expand first section by default
      if (chapterSections.length > 0) {
        setExpandedSection(chapterSections[0].id);
      }
    }
  }, [ebookId, chapterId]);

  if (!isAuthenticated) {
    return null;
  }

  if (!chapter) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>Chapter not found</p>
      </div>
    );
  }

  const handleChapterUpdate = (field: keyof Chapter, value: any) => {
    setChapter({ ...chapter, [field]: value });
    setHasChanges(true);
  };

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      chapter_id: chapterId,
      title_en: 'New Section',
      title_pt: null,
      display_order: sections.length + 1,
      blocks: [],
    };
    setSections([...sections, newSection]);
    setExpandedSection(newSection.id);
    setHasChanges(true);
  };

  const updateSection = (sectionId: string, field: keyof Section, value: any) => {
    setSections(
      sections.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s))
    );
    setHasChanges(true);
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
    setHasChanges(true);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    newSections.forEach((s, i) => (s.display_order = i + 1));
    setSections(newSections);
    setHasChanges(true);
  };

  const addBlock = (sectionId: string, blockType: BlockType) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const defaultContent = getDefaultBlockContent(blockType);

    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      section_id: sectionId,
      block_type: blockType,
      display_order: section.blocks.length + 1,
      content_en: defaultContent,
      content_pt: null,
    };

    setSections(
      sections.map((s) =>
        s.id === sectionId ? { ...s, blocks: [...s.blocks, newBlock] } : s
      )
    );
    setShowBlockPicker(null);
    setEditingBlock(newBlock.id);
    setHasChanges(true);
  };

  const getDefaultBlockContent = (blockType: BlockType): Record<string, any> => {
    switch (blockType) {
      case 'text':
        return { content: '<p>Enter your text here...</p>' };
      case 'image':
        return { src: '', alt: '', caption: '' };
      case 'quote':
        return { text: '', attribution: '' };
      case 'callout':
        return { type: 'info', title: '', content: '' };
      case 'code':
        return { code: '', language: 'javascript' };
      case 'video':
        return { url: '', title: '' };
      case 'accordion':
        return { items: [{ title: 'Item 1', content: 'Content...' }] };
      case 'tabs':
        return { tabs: [{ label: 'Tab 1', content: 'Content...' }] };
      case 'divider':
        return { style: 'line' };
      default:
        return {};
    }
  };

  const updateBlock = (sectionId: string, blockId: string, content: Record<string, any>, lang: 'en' | 'pt') => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              blocks: s.blocks.map((b) =>
                b.id === blockId
                  ? { ...b, [lang === 'en' ? 'content_en' : 'content_pt']: content }
                  : b
              ),
            }
          : s
      )
    );
    setHasChanges(true);
  };

  const deleteBlock = (sectionId: string, blockId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, blocks: s.blocks.filter((b) => b.id !== blockId) }
          : s
      )
    );
    setHasChanges(true);
  };

  const moveBlock = (sectionId: string, index: number, direction: 'up' | 'down') => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s;

        const newBlocks = [...s.blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newBlocks.length) return s;

        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        newBlocks.forEach((b, i) => (b.display_order = i + 1));
        return { ...s, blocks: newBlocks };
      })
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving chapter:', chapter);
    console.log('Saving sections:', sections);
    alert('Changes saved successfully!');
    setHasChanges(false);
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#00ff41]">AlphaGrit</h1>
        </div>
        <nav className="flex-1 mt-6">
          <Link
            href="/admin"
            className="flex items-center px-6 py-3 hover:bg-neutral-800 transition-colors"
          >
            <span className="text-xl">📊</span>
            <span className="ml-3">Dashboard</span>
          </Link>
          <Link
            href="/admin/ebooks"
            className="flex items-center px-6 py-3 bg-neutral-800 text-[#00ff41] border-l-4 border-[#00ff41]"
          >
            <span className="text-xl">📚</span>
            <span className="ml-3">E-Books</span>
          </Link>
        </nav>

        {/* Section Navigator */}
        <div className="border-t border-neutral-800 p-4">
          <h3 className="text-sm font-semibold text-neutral-400 mb-3">SECTIONS</h3>
          <div className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setExpandedSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  expandedSection === section.id
                    ? 'bg-[#00ff41]/20 text-[#00ff41]'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {section.title_en || 'Untitled Section'}
              </button>
            ))}
            <button
              type="button"
              onClick={addSection}
              className="w-full text-left px-3 py-2 rounded text-sm text-neutral-500 hover:text-[#00ff41] hover:bg-neutral-800"
            >
              <Plus className="w-3 h-3 inline mr-1" />
              Add Section
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-neutral-950 border-b border-neutral-800 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/ebooks/${ebookId}/chapters`}
              className="text-neutral-400 hover:text-white"
            >
              ← Back to Chapters
            </Link>
            <span className="text-neutral-600">|</span>
            <span className="text-white font-medium">Chapter {chapter.chapter_number}</span>
            {hasChanges && (
              <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-500">
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/en/ebooks/${product?.slug}/${chapter.slug}`}
              target="_blank"
              className="flex items-center gap-2 text-neutral-400 hover:text-white"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>
            <Button
              variant="filled"
              className="bg-[#00ff41] hover:bg-[#00cc33] text-black"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="p-8">
          {/* Chapter Details */}
          <Card className="bg-neutral-900 border-neutral-800 mb-8">
            <CardHeader>
              <CardTitle>Chapter Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Title (English)</Label>
                  <Input
                    type="text"
                    value={chapter.title_en}
                    onChange={(e) => handleChapterUpdate('title_en', e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                  />
                </div>
                <div>
                  <Label className="text-white">Title (Portuguese)</Label>
                  <Input
                    type="text"
                    value={chapter.title_pt || ''}
                    onChange={(e) => handleChapterUpdate('title_pt', e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Summary (English)</Label>
                  <Textarea
                    value={chapter.summary_en || ''}
                    onChange={(e) => handleChapterUpdate('summary_en', e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="text-white">Summary (Portuguese)</Label>
                  <Textarea
                    value={chapter.summary_pt || ''}
                    onChange={(e) => handleChapterUpdate('summary_pt', e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white mt-2"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={chapter.is_free_preview}
                    onCheckedChange={(checked) => handleChapterUpdate('is_free_preview', checked)}
                  />
                  <Label className="text-white">Free Preview</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={chapter.is_published}
                    onCheckedChange={(checked) => handleChapterUpdate('is_published', checked)}
                  />
                  <Label className="text-white">Published</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections and Blocks */}
          <div className="space-y-6">
            {sections.map((section, sectionIndex) => (
              <Card
                key={section.id}
                className={`bg-neutral-900 border-neutral-800 ${
                  expandedSection === section.id ? 'ring-1 ring-[#00ff41]/50' : ''
                }`}
              >
                <CardHeader
                  className="cursor-pointer"
                  onClick={() =>
                    setExpandedSection(expandedSection === section.id ? null : section.id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-neutral-500" />
                      <Input
                        type="text"
                        value={section.title_en || ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateSection(section.id, 'title_en', e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent border-none text-lg font-semibold p-0 h-auto focus:ring-0"
                        placeholder="Section Title"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-400">
                        {section.blocks.length} blocks
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(sectionIndex, 'up');
                        }}
                        disabled={sectionIndex === 0}
                        className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(sectionIndex, 'down');
                        }}
                        disabled={sectionIndex === sections.length - 1}
                        className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(section.id);
                        }}
                        className="p-1 text-red-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight
                        className={`w-5 h-5 transition-transform ${
                          expandedSection === section.id ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>
                </CardHeader>

                {expandedSection === section.id && (
                  <CardContent className="pt-0">
                    {/* Portuguese Title */}
                    <div className="mb-4">
                      <Label className="text-neutral-400 text-sm">Title (Portuguese)</Label>
                      <Input
                        type="text"
                        value={section.title_pt || ''}
                        onChange={(e) => updateSection(section.id, 'title_pt', e.target.value)}
                        className="bg-neutral-800 border-neutral-700 text-white mt-1"
                        placeholder="Título da seção"
                      />
                    </div>

                    {/* Blocks */}
                    <div className="space-y-4 mb-4">
                      {section.blocks.map((block, blockIndex) => (
                        <BlockEditor
                          key={block.id}
                          block={block}
                          isEditing={editingBlock === block.id}
                          onStartEdit={() => setEditingBlock(block.id)}
                          onStopEdit={() => setEditingBlock(null)}
                          onUpdate={(content, lang) =>
                            updateBlock(section.id, block.id, content, lang)
                          }
                          onDelete={() => deleteBlock(section.id, block.id)}
                          onMoveUp={() => moveBlock(section.id, blockIndex, 'up')}
                          onMoveDown={() => moveBlock(section.id, blockIndex, 'down')}
                          canMoveUp={blockIndex > 0}
                          canMoveDown={blockIndex < section.blocks.length - 1}
                        />
                      ))}
                    </div>

                    {/* Add Block Button */}
                    {showBlockPicker === section.id ? (
                      <div className="grid grid-cols-3 gap-2 p-4 bg-neutral-800 rounded-lg">
                        {BLOCK_TYPES.map(({ type, label, icon: Icon, description }) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => addBlock(section.id, type)}
                            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-neutral-700 transition-colors text-left"
                          >
                            <Icon className="w-6 h-6 text-[#00ff41]" />
                            <div className="text-center">
                              <div className="font-medium text-sm">{label}</div>
                              <div className="text-xs text-neutral-400">{description}</div>
                            </div>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setShowBlockPicker(null)}
                          className="col-span-3 mt-2 text-sm text-neutral-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full border border-dashed border-neutral-700 text-neutral-400 hover:text-[#00ff41] hover:border-[#00ff41]"
                        onClick={() => setShowBlockPicker(section.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Content Block
                      </Button>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}

            {/* Add Section Button */}
            <Button
              type="button"
              variant="ghost"
              className="w-full py-8 border border-dashed border-neutral-700 text-neutral-400 hover:text-[#00ff41] hover:border-[#00ff41]"
              onClick={addSection}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Section
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Block Editor Component
function BlockEditor({
  block,
  isEditing,
  onStartEdit,
  onStopEdit,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  block: ContentBlock;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onUpdate: (content: Record<string, any>, lang: 'en' | 'pt') => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [editLang, setEditLang] = useState<'en' | 'pt'>('en');
  const content = editLang === 'en' ? block.content_en : (block.content_pt || block.content_en);

  const blockConfig = BLOCK_TYPES.find((b) => b.type === block.block_type);
  const Icon = blockConfig?.icon || Type;

  const handleContentChange = (key: string, value: any) => {
    onUpdate({ ...content, [key]: value }, editLang);
  };

  return (
    <div
      className={`border rounded-lg transition-colors ${
        isEditing ? 'border-[#00ff41] bg-neutral-800' : 'border-neutral-700 bg-neutral-800/50'
      }`}
    >
      {/* Block Header */}
      <div className="flex items-center justify-between p-3 border-b border-neutral-700">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#00ff41]" />
          <span className="text-sm font-medium">{blockConfig?.label || block.block_type}</span>
        </div>
        <div className="flex items-center gap-1">
          {isEditing && (
            <div className="flex items-center gap-1 mr-2">
              <button
                type="button"
                onClick={() => setEditLang('en')}
                className={`px-2 py-1 text-xs rounded ${
                  editLang === 'en' ? 'bg-[#00ff41] text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setEditLang('pt')}
                className={`px-2 py-1 text-xs rounded ${
                  editLang === 'pt' ? 'bg-[#00ff41] text-black' : 'text-neutral-400 hover:text-white'
                }`}
              >
                PT
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-red-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Block Content */}
      <div className="p-4" onClick={!isEditing ? onStartEdit : undefined}>
        {isEditing ? (
          <div className="space-y-3">
            {block.block_type === 'text' && (
              <Textarea
                value={content.content || ''}
                onChange={(e) => handleContentChange('content', e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white min-h-[120px]"
                placeholder="Enter rich text content (HTML supported)..."
              />
            )}

            {block.block_type === 'image' && (
              <>
                <Input
                  type="text"
                  value={content.src || ''}
                  onChange={(e) => handleContentChange('src', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Image URL"
                />
                <Input
                  type="text"
                  value={content.alt || ''}
                  onChange={(e) => handleContentChange('alt', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Alt text"
                />
                <Input
                  type="text"
                  value={content.caption || ''}
                  onChange={(e) => handleContentChange('caption', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Caption (optional)"
                />
              </>
            )}

            {block.block_type === 'quote' && (
              <>
                <Textarea
                  value={content.text || ''}
                  onChange={(e) => handleContentChange('text', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Quote text"
                />
                <Input
                  type="text"
                  value={content.attribution || ''}
                  onChange={(e) => handleContentChange('attribution', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Attribution (optional)"
                />
              </>
            )}

            {block.block_type === 'callout' && (
              <>
                <Select
                  value={content.type || 'info'}
                  onValueChange={(value) => handleContentChange('type', value)}
                >
                  <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-700 border-neutral-600 text-white">
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="tip">Tip</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="text"
                  value={content.title || ''}
                  onChange={(e) => handleContentChange('title', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Title (optional)"
                />
                <Textarea
                  value={content.content || ''}
                  onChange={(e) => handleContentChange('content', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Callout content"
                />
              </>
            )}

            {block.block_type === 'code' && (
              <>
                <Select
                  value={content.language || 'javascript'}
                  onValueChange={(value) => handleContentChange('language', value)}
                >
                  <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-700 border-neutral-600 text-white">
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="bash">Bash</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  value={content.code || ''}
                  onChange={(e) => handleContentChange('code', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white font-mono min-h-[120px]"
                  placeholder="Enter code..."
                />
              </>
            )}

            {block.block_type === 'video' && (
              <>
                <Input
                  type="text"
                  value={content.url || ''}
                  onChange={(e) => handleContentChange('url', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Video URL (YouTube, Vimeo)"
                />
                <Input
                  type="text"
                  value={content.title || ''}
                  onChange={(e) => handleContentChange('title', e.target.value)}
                  className="bg-neutral-700 border-neutral-600 text-white"
                  placeholder="Title (optional)"
                />
              </>
            )}

            {block.block_type === 'divider' && (
              <Select
                value={content.style || 'line'}
                onValueChange={(value) => handleContentChange('style', value)}
              >
                <SelectTrigger className="bg-neutral-700 border-neutral-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-700 border-neutral-600 text-white">
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="dots">Dots</SelectItem>
                  <SelectItem value="space">Space</SelectItem>
                </SelectContent>
              </Select>
            )}

            {block.block_type === 'accordion' && (
              <div className="text-sm text-neutral-400">
                Accordion editor - Add/remove items using JSON:
                <Textarea
                  value={JSON.stringify(content.items || [], null, 2)}
                  onChange={(e) => {
                    try {
                      const items = JSON.parse(e.target.value);
                      handleContentChange('items', items);
                    } catch {}
                  }}
                  className="bg-neutral-700 border-neutral-600 text-white font-mono mt-2"
                  rows={6}
                />
              </div>
            )}

            {block.block_type === 'tabs' && (
              <div className="text-sm text-neutral-400">
                Tabs editor - Add/remove tabs using JSON:
                <Textarea
                  value={JSON.stringify(content.tabs || [], null, 2)}
                  onChange={(e) => {
                    try {
                      const tabs = JSON.parse(e.target.value);
                      handleContentChange('tabs', tabs);
                    } catch {}
                  }}
                  className="bg-neutral-700 border-neutral-600 text-white font-mono mt-2"
                  rows={6}
                />
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onStopEdit}
              className="text-[#00ff41]"
            >
              Done Editing
            </Button>
          </div>
        ) : (
          <div className="text-neutral-400 text-sm cursor-pointer hover:text-white">
            {block.block_type === 'text' && (
              <div dangerouslySetInnerHTML={{ __html: content.content || 'Click to edit...' }} />
            )}
            {block.block_type === 'image' && (
              <div>
                {content.src ? `Image: ${content.src}` : 'Click to add image...'}
              </div>
            )}
            {block.block_type === 'quote' && (
              <div>
                {content.text ? `"${content.text}"` : 'Click to add quote...'}
              </div>
            )}
            {block.block_type === 'callout' && (
              <div>
                [{content.type}] {content.title || content.content || 'Click to edit callout...'}
              </div>
            )}
            {block.block_type === 'code' && (
              <div className="font-mono">
                {content.code ? `${content.language}: ${content.code.substring(0, 50)}...` : 'Click to add code...'}
              </div>
            )}
            {block.block_type === 'video' && (
              <div>
                {content.url ? `Video: ${content.url}` : 'Click to add video...'}
              </div>
            )}
            {block.block_type === 'divider' && (
              <div className="text-center">— Divider ({content.style}) —</div>
            )}
            {block.block_type === 'accordion' && (
              <div>
                Accordion: {content.items?.length || 0} items
              </div>
            )}
            {block.block_type === 'tabs' && (
              <div>
                Tabs: {content.tabs?.length || 0} tabs
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
