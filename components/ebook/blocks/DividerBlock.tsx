'use client';

import { DividerBlockContent, BlockConfig } from '@/lib/ebook/types';
import { cn } from '@/lib/utils';

interface DividerBlockProps {
  content: DividerBlockContent;
  config?: BlockConfig;
}

export function DividerBlock({ content, config }: DividerBlockProps) {
  const style = content.style || 'line';

  if (style === 'space') {
    return <div className={cn('my-12', config?.className)} style={config?.style} />;
  }

  if (style === 'dots') {
    return (
      <div
        className={cn('my-8 flex justify-center gap-3', config?.className)}
        style={config?.style}
      >
        <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
      </div>
    );
  }

  return (
    <hr
      className={cn(
        'my-8 border-t border-border',
        config?.className
      )}
      style={config?.style}
    />
  );
}
