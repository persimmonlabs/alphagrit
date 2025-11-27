'use client';

import { CodeBlockContent, BlockConfig } from '@/lib/ebook/types';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  content: CodeBlockContent;
  config?: BlockConfig;
}

export function CodeBlock({ content, config }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      className={cn('my-6 rounded-lg overflow-hidden', config?.className)}
      style={config?.style}
    >
      {/* Header */}
      {(content.filename || content.language) && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border">
          <span className="text-xs text-muted-foreground font-mono">
            {content.filename || content.language}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-muted-foreground/10 transition-colors"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
      )}

      {/* Code Content */}
      <pre className="p-4 bg-muted/50 overflow-x-auto">
        <code className="text-sm font-mono text-foreground">
          {content.code}
        </code>
      </pre>
    </div>
  );
}
