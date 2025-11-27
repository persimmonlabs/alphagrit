'use client';

import { QuoteBlockContent, BlockConfig } from '@/lib/ebook/types';
import { cn } from '@/lib/utils';
import { Quote } from 'lucide-react';

interface QuoteBlockProps {
  content: QuoteBlockContent;
  config?: BlockConfig;
}

export function QuoteBlock({ content, config }: QuoteBlockProps) {
  return (
    <blockquote
      className={cn(
        'relative my-8 pl-8 pr-4 py-6',
        'border-l-4 border-primary bg-muted/30 rounded-r-lg',
        config?.className
      )}
      style={config?.style}
    >
      <Quote className="absolute top-4 left-2 w-5 h-5 text-primary/50" />
      <p className="text-lg italic text-foreground leading-relaxed">
        &ldquo;{content.text}&rdquo;
      </p>
      {content.author && (
        <footer className="mt-4 text-sm text-muted-foreground">
          &mdash; {content.author}
        </footer>
      )}
    </blockquote>
  );
}
