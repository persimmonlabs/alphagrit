'use client';

import { useState } from 'react';
import { AccordionBlockContent, BlockConfig } from '@/lib/ebook/types';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface AccordionBlockProps {
  content: AccordionBlockContent;
  config?: BlockConfig;
}

export function AccordionBlock({ content, config }: AccordionBlockProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div
      className={cn('my-6 space-y-2', config?.className)}
      style={config?.style}
    >
      {content.items.map((item, index) => {
        const isOpen = openItems.has(index);
        return (
          <div
            key={index}
            className="border border-border rounded-lg overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggleItem(index)}
              className={cn(
                'w-full flex items-center justify-between gap-4 px-5 py-4',
                'text-left font-medium text-foreground',
                'hover:bg-muted/50 transition-colors',
                isOpen && 'bg-muted/30'
              )}
            >
              <span>{item.title}</span>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            <div
              className={cn(
                'overflow-hidden transition-all duration-200',
                isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <div
                className="px-5 py-4 border-t border-border prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
