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
        'relative my-8 md:my-10 pl-6 md:pl-8 pr-4 py-1',
        'border-l-4 border-primary',
        config?.className
      )}
      style={config?.style}
    >
      <p className="text-lg md:text-xl lg:text-2xl italic text-foreground/90 leading-relaxed mb-0">
        &ldquo;{content.text}&rdquo;
      </p>
      {content.author && (
        <footer className="mt-4 text-sm md:text-base text-muted-foreground font-medium">
          &mdash; {content.author}
        </footer>
      )}
    </blockquote>
  );
}
