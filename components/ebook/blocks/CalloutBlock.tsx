'use client';

import { CalloutBlockContent, BlockConfig } from '@/lib/ebook/types';
import { cn } from '@/lib/utils';
import { Info, AlertTriangle, Lightbulb, FileText } from 'lucide-react';

interface CalloutBlockProps {
  content: CalloutBlockContent;
  config?: BlockConfig;
}

const calloutStyles = {
  info: {
    bg: 'bg-blue-500/10 border-blue-500/30',
    icon: Info,
    iconColor: 'text-blue-500',
  },
  warning: {
    bg: 'bg-yellow-500/10 border-yellow-500/30',
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
  },
  tip: {
    bg: 'bg-green-500/10 border-green-500/30',
    icon: Lightbulb,
    iconColor: 'text-green-500',
  },
  note: {
    bg: 'bg-purple-500/10 border-purple-500/30',
    icon: FileText,
    iconColor: 'text-purple-500',
  },
};

export function CalloutBlock({ content, config }: CalloutBlockProps) {
  const style = calloutStyles[content.type] || calloutStyles.info;
  const Icon = style.icon;

  return (
    <div
      className={cn(
        'my-6 p-5 rounded-lg border',
        style.bg,
        config?.className
      )}
      style={config?.style}
    >
      <div className="flex gap-4">
        <Icon className={cn('w-6 h-6 flex-shrink-0 mt-0.5', style.iconColor)} />
        <div className="flex-1 min-w-0">
          {content.title && (
            <h4 className="font-semibold text-foreground mb-2">
              {content.title}
            </h4>
          )}
          <div
            className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
        </div>
      </div>
    </div>
  );
}
