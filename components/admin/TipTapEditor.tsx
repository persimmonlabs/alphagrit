'use client'

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useState } from 'react'
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Quote, Undo, Redo, Link as LinkIcon, Image as ImageIcon,
  Heading1, Heading2, Heading3, Minus, Plus,
  Info, AlertTriangle, Lightbulb, FileText,
  ChevronDown, Play, Code2, LayoutGrid
} from 'lucide-react'

interface TipTapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  // For image uploads - provide bucket and folder
  imageBucket?: 'ebook-covers' | 'blog-images'
  imageFolder?: string // e.g., 'content/chapter-123'
}

// Block insertion modal state
interface BlockModalState {
  type: 'callout' | 'accordion' | 'tabs' | 'code' | 'video' | 'image' | null
  isOpen: boolean
}

export function TipTapEditor({ content, onChange, placeholder, imageBucket, imageFolder }: TipTapEditorProps) {
  const [blockModal, setBlockModal] = useState<BlockModalState>({ type: null, isOpen: false })
  const [showBlockMenu, setShowBlockMenu] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-orange-500 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg my-4',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[400px] p-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return <div className="min-h-[400px] bg-neutral-800 rounded-lg animate-pulse" />
  }

  const setLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    if (imageBucket) {
      // Open upload modal if bucket is configured
      setBlockModal({ type: 'image', isOpen: true })
    } else {
      // Fallback to URL prompt
      const url = prompt('Enter image URL:')
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    }
  }

  const insertImage = (url: string, alt?: string, caption?: string) => {
    if (caption) {
      const html = `
        <figure class="my-6">
          <img src="${url}" alt="${alt || ''}" class="w-full rounded-lg" />
          <figcaption class="mt-2 text-center text-sm text-gray-400">${caption}</figcaption>
        </figure>
        <p></p>
      `
      editor.chain().focus().insertContent(html).run()
    } else {
      editor.chain().focus().setImage({ src: url, alt: alt || '' }).run()
    }
  }

  // Insert callout block
  const insertCallout = (type: 'info' | 'warning' | 'tip' | 'note', title: string, content: string) => {
    const icons: Record<string, string> = {
      info: 'ℹ️',
      warning: '⚠️',
      tip: '💡',
      note: '📝'
    }
    const colors: Record<string, string> = {
      info: 'border-blue-500 bg-blue-500/10',
      warning: 'border-yellow-500 bg-yellow-500/10',
      tip: 'border-green-500 bg-green-500/10',
      note: 'border-purple-500 bg-purple-500/10'
    }

    const html = `
      <div data-block="callout" data-callout-type="${type}" class="my-6 p-4 rounded-lg border-l-4 ${colors[type]}">
        <div class="flex gap-3">
          <span class="text-xl">${icons[type]}</span>
          <div>
            ${title ? `<strong class="block mb-1">${title}</strong>` : ''}
            <p class="text-gray-300 m-0">${content}</p>
          </div>
        </div>
      </div>
      <p></p>
    `
    editor.chain().focus().insertContent(html).run()
  }

  // Insert accordion block
  const insertAccordion = (items: Array<{ title: string; content: string }>) => {
    const itemsHtml = items.map((item, i) => `
      <div data-accordion-item="${i}" class="border border-neutral-700 rounded-lg mb-2 overflow-hidden">
        <div data-accordion-trigger class="px-4 py-3 bg-neutral-800 font-medium cursor-pointer hover:bg-neutral-700 flex justify-between items-center">
          <span>${item.title}</span>
          <span>▼</span>
        </div>
        <div data-accordion-content class="px-4 py-3 border-t border-neutral-700">
          ${item.content}
        </div>
      </div>
    `).join('')

    const html = `
      <div data-block="accordion" class="my-6">
        ${itemsHtml}
      </div>
      <p></p>
    `
    editor.chain().focus().insertContent(html).run()
  }

  // Insert tabs block
  const insertTabs = (tabs: Array<{ label: string; content: string }>) => {
    const tabButtonsHtml = tabs.map((tab, i) => `
      <button data-tab-button="${i}" class="px-4 py-2 border-b-2 ${i === 0 ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}">${tab.label}</button>
    `).join('')

    const tabContentsHtml = tabs.map((tab, i) => `
      <div data-tab-content="${i}" class="${i === 0 ? '' : 'hidden'} p-4">
        ${tab.content}
      </div>
    `).join('')

    const html = `
      <div data-block="tabs" class="my-6 border border-neutral-700 rounded-lg overflow-hidden">
        <div class="flex border-b border-neutral-700 bg-neutral-800">
          ${tabButtonsHtml}
        </div>
        <div>
          ${tabContentsHtml}
        </div>
      </div>
      <p></p>
    `
    editor.chain().focus().insertContent(html).run()
  }

  // Insert code block
  const insertCodeBlock = (code: string, language: string, filename?: string) => {
    const html = `
      <div data-block="code" data-language="${language}" ${filename ? `data-filename="${filename}"` : ''} class="my-6 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-700">
        ${filename || language ? `<div class="px-4 py-2 bg-neutral-800 border-b border-neutral-700 text-xs text-gray-400 font-mono">${filename || language}</div>` : ''}
        <pre class="p-4 overflow-x-auto m-0"><code class="text-sm font-mono text-gray-200">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
      </div>
      <p></p>
    `
    editor.chain().focus().insertContent(html).run()
  }

  // Insert video block
  const insertVideo = (url: string, type: 'youtube' | 'vimeo', title?: string) => {
    let embedUrl = url
    if (type === 'youtube') {
      const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1]
      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url
    } else if (type === 'vimeo') {
      const videoId = url.match(/vimeo\.com\/(?:.*\/)?([0-9]+)/)?.[1]
      embedUrl = videoId ? `https://player.vimeo.com/video/${videoId}` : url
    }

    const html = `
      <div data-block="video" data-video-type="${type}" class="my-8">
        <div class="relative aspect-video rounded-lg overflow-hidden bg-neutral-800">
          <iframe src="${embedUrl}" title="${title || 'Video'}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="absolute inset-0 w-full h-full"></iframe>
        </div>
        ${title ? `<p class="mt-2 text-center text-sm text-gray-400">${title}</p>` : ''}
      </div>
      <p></p>
    `
    editor.chain().focus().insertContent(html).run()
  }

  // Insert quote block
  const insertQuote = (text: string, author?: string) => {
    const html = `
      <blockquote data-block="quote" ${author ? `data-author="${author}"` : ''} class="my-8 pl-6 border-l-4 border-orange-500 bg-neutral-800/50 py-4 pr-4 rounded-r-lg">
        <p class="text-lg italic text-gray-200 m-0">"${text}"</p>
        ${author ? `<footer class="mt-3 text-sm text-gray-400">— ${author}</footer>` : ''}
      </blockquote>
      <p></p>
    `
    editor.chain().focus().insertContent(html).run()
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    children,
    title
  }: {
    onClick: () => void
    isActive?: boolean
    children: React.ReactNode
    title?: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-neutral-700 transition-colors ${
        isActive ? 'bg-neutral-700 text-orange-500' : 'text-gray-400'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="border border-neutral-700 rounded-lg overflow-hidden bg-neutral-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-neutral-700 bg-neutral-800">
        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-neutral-700 mx-1" />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-neutral-700 mx-1" />

        {/* Lists & Structure */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-neutral-700 mx-1" />

        {/* Links & Media */}
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Add Image">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-neutral-700 mx-1" />

        {/* Rich Blocks Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowBlockMenu(!showBlockMenu)}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/20 text-orange-500 rounded hover:bg-orange-500/30 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Insert Block
            <ChevronDown className={`w-3 h-3 transition-transform ${showBlockMenu ? 'rotate-180' : ''}`} />
          </button>

          {showBlockMenu && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-50 py-1">
              <button
                type="button"
                onClick={() => {
                  setBlockModal({ type: 'callout', isOpen: true })
                  setShowBlockMenu(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-neutral-700 transition-colors"
              >
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Callout Box</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBlockModal({ type: 'accordion', isOpen: true })
                  setShowBlockMenu(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-neutral-700 transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-purple-400" />
                <span className="text-sm">Accordion</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBlockModal({ type: 'tabs', isOpen: true })
                  setShowBlockMenu(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-neutral-700 transition-colors"
              >
                <LayoutGrid className="w-4 h-4 text-green-400" />
                <span className="text-sm">Tabs</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBlockModal({ type: 'code', isOpen: true })
                  setShowBlockMenu(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-neutral-700 transition-colors"
              >
                <Code2 className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">Code Block</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBlockModal({ type: 'video', isOpen: true })
                  setShowBlockMenu(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-neutral-700 transition-colors"
              >
                <Play className="w-4 h-4 text-red-400" />
                <span className="text-sm">Video Embed</span>
              </button>
              <div className="border-t border-neutral-700 my-1" />
              <button
                type="button"
                onClick={() => {
                  const text = prompt('Quote text:')
                  const author = prompt('Author (optional):')
                  if (text) {
                    insertQuote(text, author || undefined)
                  }
                  setShowBlockMenu(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-neutral-700 transition-colors"
              >
                <Quote className="w-4 h-4 text-orange-400" />
                <span className="text-sm">Styled Quote</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Undo/Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Block Insertion Modals */}
      {blockModal.isOpen && blockModal.type === 'callout' && (
        <CalloutModal
          onClose={() => setBlockModal({ type: null, isOpen: false })}
          onInsert={(type, title, content) => {
            insertCallout(type, title, content)
            setBlockModal({ type: null, isOpen: false })
          }}
        />
      )}

      {blockModal.isOpen && blockModal.type === 'accordion' && (
        <AccordionModal
          onClose={() => setBlockModal({ type: null, isOpen: false })}
          onInsert={(items) => {
            insertAccordion(items)
            setBlockModal({ type: null, isOpen: false })
          }}
        />
      )}

      {blockModal.isOpen && blockModal.type === 'tabs' && (
        <TabsModal
          onClose={() => setBlockModal({ type: null, isOpen: false })}
          onInsert={(tabs) => {
            insertTabs(tabs)
            setBlockModal({ type: null, isOpen: false })
          }}
        />
      )}

      {blockModal.isOpen && blockModal.type === 'code' && (
        <CodeModal
          onClose={() => setBlockModal({ type: null, isOpen: false })}
          onInsert={(code, language, filename) => {
            insertCodeBlock(code, language, filename)
            setBlockModal({ type: null, isOpen: false })
          }}
        />
      )}

      {blockModal.isOpen && blockModal.type === 'video' && (
        <VideoModal
          onClose={() => setBlockModal({ type: null, isOpen: false })}
          onInsert={(url, type, title) => {
            insertVideo(url, type, title)
            setBlockModal({ type: null, isOpen: false })
          }}
        />
      )}

      {blockModal.isOpen && blockModal.type === 'image' && imageBucket && (
        <ImageUploadModal
          bucket={imageBucket}
          folder={imageFolder}
          onClose={() => setBlockModal({ type: null, isOpen: false })}
          onInsert={(url, alt, caption) => {
            insertImage(url, alt, caption)
            setBlockModal({ type: null, isOpen: false })
          }}
        />
      )}
    </div>
  )
}

// Modal Components
function ModalWrapper({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-700">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function CalloutModal({ onClose, onInsert }: { onClose: () => void; onInsert: (type: 'info' | 'warning' | 'tip' | 'note', title: string, content: string) => void }) {
  const [type, setType] = useState<'info' | 'warning' | 'tip' | 'note'>('info')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  return (
    <ModalWrapper onClose={onClose} title="Insert Callout">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <div className="grid grid-cols-4 gap-2">
            {(['info', 'warning', 'tip', 'note'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-2 rounded-lg border capitalize text-sm ${
                  type === t ? 'border-orange-500 bg-orange-500/20' : 'border-neutral-700 hover:bg-neutral-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm"
            placeholder="e.g., Pro Tip"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm h-24"
            placeholder="Callout content..."
          />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
          <button
            type="button"
            onClick={() => content && onInsert(type, title, content)}
            disabled={!content}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            Insert
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

function AccordionModal({ onClose, onInsert }: { onClose: () => void; onInsert: (items: Array<{ title: string; content: string }>) => void }) {
  const [items, setItems] = useState([{ title: '', content: '' }])

  const addItem = () => setItems([...items, { title: '', content: '' }])
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const updateItem = (index: number, field: 'title' | 'content', value: string) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  return (
    <ModalWrapper onClose={onClose} title="Insert Accordion">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {items.map((item, index) => (
          <div key={index} className="p-4 bg-neutral-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Item {index + 1}</span>
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(index)} className="text-red-400 text-sm">Remove</button>
              )}
            </div>
            <input
              type="text"
              value={item.title}
              onChange={e => updateItem(index, 'title', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm"
              placeholder="Section title"
            />
            <textarea
              value={item.content}
              onChange={e => updateItem(index, 'content', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm h-20"
              placeholder="Section content (HTML supported)"
            />
          </div>
        ))}
        <button type="button" onClick={addItem} className="w-full py-2 border border-dashed border-neutral-700 rounded-lg text-sm text-gray-400 hover:text-white hover:border-neutral-600">
          + Add Item
        </button>
      </div>
      <div className="flex justify-end gap-3 mt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
        <button
          type="button"
          onClick={() => items.some(i => i.title && i.content) && onInsert(items.filter(i => i.title && i.content))}
          disabled={!items.some(i => i.title && i.content)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          Insert
        </button>
      </div>
    </ModalWrapper>
  )
}

function TabsModal({ onClose, onInsert }: { onClose: () => void; onInsert: (tabs: Array<{ label: string; content: string }>) => void }) {
  const [tabs, setTabs] = useState([{ label: '', content: '' }])

  const addTab = () => setTabs([...tabs, { label: '', content: '' }])
  const removeTab = (index: number) => setTabs(tabs.filter((_, i) => i !== index))
  const updateTab = (index: number, field: 'label' | 'content', value: string) => {
    const newTabs = [...tabs]
    newTabs[index][field] = value
    setTabs(newTabs)
  }

  return (
    <ModalWrapper onClose={onClose} title="Insert Tabs">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {tabs.map((tab, index) => (
          <div key={index} className="p-4 bg-neutral-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tab {index + 1}</span>
              {tabs.length > 1 && (
                <button type="button" onClick={() => removeTab(index)} className="text-red-400 text-sm">Remove</button>
              )}
            </div>
            <input
              type="text"
              value={tab.label}
              onChange={e => updateTab(index, 'label', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm"
              placeholder="Tab label"
            />
            <textarea
              value={tab.content}
              onChange={e => updateTab(index, 'content', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm h-20"
              placeholder="Tab content (HTML supported)"
            />
          </div>
        ))}
        <button type="button" onClick={addTab} className="w-full py-2 border border-dashed border-neutral-700 rounded-lg text-sm text-gray-400 hover:text-white hover:border-neutral-600">
          + Add Tab
        </button>
      </div>
      <div className="flex justify-end gap-3 mt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
        <button
          type="button"
          onClick={() => tabs.some(t => t.label && t.content) && onInsert(tabs.filter(t => t.label && t.content))}
          disabled={!tabs.some(t => t.label && t.content)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          Insert
        </button>
      </div>
    </ModalWrapper>
  )
}

function CodeModal({ onClose, onInsert }: { onClose: () => void; onInsert: (code: string, language: string, filename?: string) => void }) {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [filename, setFilename] = useState('')

  const languages = ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'bash', 'sql', 'go', 'rust', 'java', 'c', 'cpp', 'php', 'ruby', 'swift', 'kotlin']

  return (
    <ModalWrapper onClose={onClose} title="Insert Code Block">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filename (optional)</label>
            <input
              type="text"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm"
              placeholder="e.g., app.js"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Code</label>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm h-40 font-mono"
            placeholder="Paste your code here..."
          />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
          <button
            type="button"
            onClick={() => code && onInsert(code, language, filename || undefined)}
            disabled={!code}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            Insert
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

function VideoModal({ onClose, onInsert }: { onClose: () => void; onInsert: (url: string, type: 'youtube' | 'vimeo', title?: string) => void }) {
  const [url, setUrl] = useState('')
  const [type, setType] = useState<'youtube' | 'vimeo'>('youtube')
  const [title, setTitle] = useState('')

  return (
    <ModalWrapper onClose={onClose} title="Insert Video">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Platform</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('youtube')}
              className={`px-3 py-2 rounded-lg border text-sm ${
                type === 'youtube' ? 'border-red-500 bg-red-500/20' : 'border-neutral-700 hover:bg-neutral-800'
              }`}
            >
              YouTube
            </button>
            <button
              type="button"
              onClick={() => setType('vimeo')}
              className={`px-3 py-2 rounded-lg border text-sm ${
                type === 'vimeo' ? 'border-blue-500 bg-blue-500/20' : 'border-neutral-700 hover:bg-neutral-800'
              }`}
            >
              Vimeo
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Video URL</label>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm"
            placeholder={type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://vimeo.com/...'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Caption (optional)</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm"
            placeholder="Video caption"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
          <button
            type="button"
            onClick={() => url && onInsert(url, type, title || undefined)}
            disabled={!url}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            Insert
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

function ImageUploadModal({
  bucket,
  folder,
  onClose,
  onInsert
}: {
  bucket: 'ebook-covers' | 'blog-images'
  folder?: string
  onClose: () => void
  onInsert: (url: string, alt?: string, caption?: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [alt, setAlt] = useState('')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Allowed: JPEG, PNG, WebP, GIF')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Max size: 5MB')
      return
    }

    setError(null)
    setUploading(true)

    // Show preview
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    try {
      // Dynamic import for Supabase client
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Generate unique filename
      const ext = file.name.split('.').pop()
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(7)
      const filePath = folder
        ? `${folder}/${timestamp}-${randomStr}.${ext}`
        : `${timestamp}-${randomStr}.${ext}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      setUploadedUrl(urlData.publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <ModalWrapper onClose={onClose} title="Upload Image">
      <div className="space-y-4">
        {!preview ? (
          <div className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer text-gray-400 hover:text-white"
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Click to upload image</span>
                <span className="text-xs text-gray-500">JPEG, PNG, WebP, GIF (max 5MB)</span>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-neutral-800">
              <img src={preview} alt="Preview" className="w-full h-48 object-contain" />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Alt Text</label>
              <input
                type="text"
                value={alt}
                onChange={e => setAlt(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm"
                placeholder="Describe the image for accessibility"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Caption (optional)</label>
              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm"
                placeholder="Image caption"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => uploadedUrl && onInsert(uploadedUrl, alt || undefined, caption || undefined)}
            disabled={!uploadedUrl || uploading}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Insert'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}
