/**
 * Tiptap JSON to HTML renderer for blog content
 */

import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import type { JSONContent } from '@tiptap/react'

/**
 * Convert Tiptap JSON content to HTML string
 */
export function renderTiptapContent(content: JSONContent | string): string {
  // If content is already a string (Markdown or HTML), return it
  if (typeof content === 'string') {
    return content
  }

  // Generate HTML from Tiptap JSON
  const html = generateHTML(content, [
    StarterKit,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary hover:underline',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'rounded-lg max-w-full h-auto',
      },
    }),
  ])

  return html
}

/**
 * Extract plain text from Tiptap JSON (for meta descriptions)
 */
export function extractPlainText(content: JSONContent | string, maxLength = 160): string {
  if (typeof content === 'string') {
    // Strip HTML tags if it's HTML
    const stripped = content.replace(/<[^>]*>/g, '')
    return stripped.substring(0, maxLength).trim() + (stripped.length > maxLength ? '...' : '')
  }

  // Extract text from JSON content recursively
  const extractText = (node: JSONContent): string => {
    let text = ''

    if (node.text) {
      text += node.text
    }

    if (node.content) {
      for (const child of node.content) {
        text += extractText(child)
      }
    }

    return text
  }

  const fullText = extractText(content)
  return fullText.substring(0, maxLength).trim() + (fullText.length > maxLength ? '...' : '')
}

/**
 * Generate reading time estimate from content
 */
export function calculateReadingTime(content: JSONContent | string): number {
  const plainText = extractPlainText(content, 999999)
  const wordsPerMinute = 200
  const wordCount = plainText.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}
