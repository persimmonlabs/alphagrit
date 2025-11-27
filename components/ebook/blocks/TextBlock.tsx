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
        'prose prose-lg dark:prose-invert max-w-none',
        'prose-headings:font-heading prose-headings:text-foreground',
        'prose-p:text-muted-foreground prose-p:leading-relaxed',
        'prose-a:text-primary hover:prose-a:text-primary/80',
        'prose-strong:text-foreground',
        'prose-ul:text-muted-foreground prose-ol:text-muted-foreground',
        config?.className
      )}
      style={config?.style}
      dangerouslySetInnerHTML={{ __html: content.html }}
    />
  );
}
