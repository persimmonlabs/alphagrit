'use client';

import { useState } from 'react';
import { TabsBlockContent, BlockConfig } from '@/lib/ebook/types';
import { cn } from '@/lib/utils';

interface TabsBlockProps {
  content: TabsBlockContent;
  config?: BlockConfig;
}

export function TabsBlock({ content, config }: TabsBlockProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (!content.tabs || content.tabs.length === 0) {
    return null;
  }

  return (
    <div className={cn('my-6', config?.className)} style={config?.style}>
      {/* Tab Headers */}
      <div className="flex border-b border-border overflow-x-auto">
        {content.tabs.map((tab, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveTab(index)}
            className={cn(
              'px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              'border-b-2 -mb-px',
              activeTab === index
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {content.tabs.map((tab, index) => (
          <div
            key={index}
            className={cn(
              'prose prose-sm dark:prose-invert max-w-none',
              activeTab === index ? 'block' : 'hidden'
            )}
            dangerouslySetInnerHTML={{ __html: tab.content }}
          />
        ))}
      </div>
    </div>
  );
}
