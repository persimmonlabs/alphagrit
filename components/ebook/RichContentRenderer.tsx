'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { Copy, Check, ChevronDown } from 'lucide-react'

interface RichContentRendererProps {
  content: string
  className?: string
}

/**
 * RichContentRenderer
 *
 * Renders HTML content with interactive blocks:
 * - Accordion: Expandable/collapsible sections
 * - Tabs: Switchable tab panels
 * - Code: Copy-to-clipboard functionality
 * - Video: Embedded YouTube/Vimeo
 * - Callout: Styled info/warning/tip/note boxes
 * - Quote: Styled blockquotes with attribution
 *
 * Blocks are identified by data-block attributes in the HTML.
 */
export function RichContentRenderer({ content, className }: RichContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Process content: if it's plain text, convert to HTML paragraphs
  const processedContent = useMemo(() => {
    if (!content) return ''

    // Check if content already has HTML tags
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content)

    if (hasHtmlTags) {
      return content
    }

    // Convert plain text to HTML paragraphs
    // Split by double newlines for paragraphs, preserve single newlines as <br>
    const paragraphs = content
      .split(/\n\n+/)
      .filter(p => p.trim())
      .map(paragraph => {
        // Check if this looks like a heading (all caps or ends with colon at start)
        const trimmed = paragraph.trim()

        // Detect headings: lines that are short, all caps, or end with specific patterns
        if (trimmed.length < 100 && /^[A-Z][A-Z\s\d]+$/.test(trimmed)) {
          return `<h2 class="text-xl md:text-2xl font-bold text-foreground mt-8 mb-4">${trimmed}</h2>`
        }

        // Check for section headings (Title Case followed by content)
        if (trimmed.length < 80 && /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s*$/.test(trimmed)) {
          return `<h3 class="text-lg md:text-xl font-semibold text-foreground mt-6 mb-3">${trimmed}</h3>`
        }

        // Regular paragraph - convert single newlines to <br>
        const htmlParagraph = paragraph.replace(/\n/g, '<br />')
        return `<p>${htmlParagraph}</p>`
      })
      .join('\n')

    return paragraphs
  }, [content])

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize accordions
    initAccordions(containerRef.current)

    // Initialize tabs
    initTabs(containerRef.current)

    // Initialize code blocks
    initCodeBlocks(containerRef.current, setCopiedCode)

  }, [processedContent])

  return (
    <div
      ref={containerRef}
      className={`rich-content prose prose-base md:prose-lg dark:prose-invert max-w-none
        prose-headings:font-heading prose-headings:font-bold prose-headings:text-foreground
        prose-h1:text-2xl prose-h1:md:text-3xl prose-h1:mt-8 prose-h1:mb-4
        prose-h2:text-xl prose-h2:md:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-orange-500
        prose-h3:text-lg prose-h3:md:text-xl prose-h3:mt-6 prose-h3:mb-3
        prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base prose-p:md:text-lg
        prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-white prose-strong:font-semibold
        prose-ul:text-gray-300 prose-ol:text-gray-300 prose-ul:my-4 prose-ol:my-4
        prose-li:marker:text-orange-500 prose-li:mb-2
        prose-blockquote:border-l-orange-500 prose-blockquote:text-gray-400 prose-blockquote:italic prose-blockquote:pl-4 prose-blockquote:my-6
        prose-code:text-orange-400 prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800 prose-pre:rounded-lg prose-pre:my-6
        prose-img:rounded-xl prose-img:my-6
        [&>p]:first-of-type:text-lg [&>p]:first-of-type:md:text-xl [&>p]:first-of-type:text-gray-200
        ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}

// Initialize accordion functionality
function initAccordions(container: HTMLElement) {
  const accordions = container.querySelectorAll('[data-block="accordion"]')

  accordions.forEach(accordion => {
    const triggers = accordion.querySelectorAll('[data-accordion-trigger]')

    triggers.forEach(trigger => {
      // Remove existing listeners
      const newTrigger = trigger.cloneNode(true) as HTMLElement
      trigger.parentNode?.replaceChild(newTrigger, trigger)

      newTrigger.addEventListener('click', () => {
        const item = newTrigger.closest('[data-accordion-item]')
        const content = item?.querySelector('[data-accordion-content]') as HTMLElement
        const icon = newTrigger.querySelector('span:last-child')

        if (content) {
          const isOpen = content.style.display !== 'none'

          // Close all items in this accordion
          const allItems = accordion.querySelectorAll('[data-accordion-item]')
          allItems.forEach(i => {
            const c = i.querySelector('[data-accordion-content]') as HTMLElement
            const ic = i.querySelector('[data-accordion-trigger] span:last-child') as HTMLElement
            if (c) {
              c.style.display = 'none'
              c.style.maxHeight = '0'
            }
            if (ic) ic.style.transform = 'rotate(0deg)'
          })

          // Toggle current item
          if (!isOpen) {
            content.style.display = 'block'
            content.style.maxHeight = content.scrollHeight + 'px'
            if (icon) (icon as HTMLElement).style.transform = 'rotate(180deg)'
          }
        }
      })
    })

    // Initially collapse all accordion contents
    const contents = accordion.querySelectorAll('[data-accordion-content]') as NodeListOf<HTMLElement>
    contents.forEach(content => {
      content.style.display = 'none'
      content.style.maxHeight = '0'
      content.style.transition = 'max-height 0.2s ease-out'
    })
  })
}

// Initialize tabs functionality
function initTabs(container: HTMLElement) {
  const tabBlocks = container.querySelectorAll('[data-block="tabs"]')

  tabBlocks.forEach(tabBlock => {
    const buttons = tabBlock.querySelectorAll('[data-tab-button]') as NodeListOf<HTMLElement>
    const contents = tabBlock.querySelectorAll('[data-tab-content]') as NodeListOf<HTMLElement>

    buttons.forEach((button, index) => {
      // Remove existing listeners
      const newButton = button.cloneNode(true) as HTMLElement
      button.parentNode?.replaceChild(newButton, button)

      newButton.addEventListener('click', () => {
        // Update button styles
        const allButtons = tabBlock.querySelectorAll('[data-tab-button]') as NodeListOf<HTMLElement>
        allButtons.forEach(btn => {
          btn.classList.remove('border-orange-500', 'text-orange-500')
          btn.classList.add('border-transparent', 'text-gray-400')
        })
        newButton.classList.remove('border-transparent', 'text-gray-400')
        newButton.classList.add('border-orange-500', 'text-orange-500')

        // Show corresponding content
        contents.forEach((content, i) => {
          if (i === index) {
            content.classList.remove('hidden')
          } else {
            content.classList.add('hidden')
          }
        })
      })
    })
  })
}

// Initialize code blocks with copy functionality
function initCodeBlocks(container: HTMLElement, setCopiedCode: (id: string | null) => void) {
  const codeBlocks = container.querySelectorAll('[data-block="code"]')

  codeBlocks.forEach((block, index) => {
    const pre = block.querySelector('pre')
    const code = block.querySelector('code')
    const header = block.querySelector('div:first-child')

    if (!code || !header) return

    // Check if copy button already exists
    if (header.querySelector('.copy-button')) return

    // Create copy button
    const copyButton = document.createElement('button')
    copyButton.className = 'copy-button ml-auto p-1.5 rounded hover:bg-neutral-700 transition-colors flex items-center gap-1 text-xs'
    copyButton.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
      </svg>
      <span>Copy</span>
    `

    copyButton.addEventListener('click', async () => {
      const text = code.textContent || ''
      try {
        await navigator.clipboard.writeText(text)
        copyButton.innerHTML = `
          <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span class="text-green-500">Copied!</span>
        `
        setTimeout(() => {
          copyButton.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <span>Copy</span>
          `
        }, 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    })

    // Make header a flex container and add copy button
    if (header.classList.contains('bg-neutral-800')) {
      header.classList.add('flex', 'items-center', 'justify-between')
      header.appendChild(copyButton)
    }
  })
}

// Export additional styles for the content
export const richContentStyles = `
  .rich-content [data-block="callout"] {
    margin: 1.5rem 0;
  }

  .rich-content [data-block="accordion"] [data-accordion-trigger] {
    cursor: pointer;
    user-select: none;
  }

  .rich-content [data-block="accordion"] [data-accordion-trigger]:hover {
    background-color: rgb(64 64 64);
  }

  .rich-content [data-block="accordion"] [data-accordion-content] {
    overflow: hidden;
    transition: max-height 0.2s ease-out;
  }

  .rich-content [data-block="tabs"] [data-tab-button] {
    cursor: pointer;
    transition: all 0.2s;
  }

  .rich-content [data-block="tabs"] [data-tab-button]:hover {
    color: white;
  }

  .rich-content [data-block="video"] iframe {
    border-radius: 0.5rem;
  }

  .rich-content [data-block="quote"] {
    font-style: italic;
  }

  .rich-content [data-block="code"] pre {
    margin: 0;
    background: transparent;
    border: none;
  }
`
