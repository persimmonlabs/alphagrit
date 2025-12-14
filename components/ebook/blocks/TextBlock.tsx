'use client';

import { TextBlockContent, BlockConfig } from '@/lib/ebook/types';
import { cn } from '@/lib/utils';

interface TextBlockProps {
  content: TextBlockContent;
  config?: BlockConfig;
}

export function TextBlock({ content, config }: TextBlockProps) {
  return (
    <div
      className={cn(
        'prose prose-base md:prose-lg lg:prose-xl dark:prose-invert max-w-3xl',
        'prose-headings:font-heading prose-headings:text-foreground prose-headings:font-bold',
        'prose-p:text-muted-foreground prose-p:leading-[1.7] prose-p:md:leading-[1.8] prose-p:mb-5',
        'prose-a:text-primary prose-a:font-medium hover:prose-a:text-primary/80 prose-a:no-underline hover:prose-a:underline prose-a:transition-colors',
        'prose-strong:text-foreground prose-strong:font-semibold',
        'prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-ul:space-y-2 prose-ol:space-y-2',
        'prose-li:leading-relaxed',
        config?.className
      )}
      style={config?.style}
      dangerouslySetInnerHTML={{ __html: content.html }}
    />
  );
}
