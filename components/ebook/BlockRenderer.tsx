'use client';

import { EbookContentBlock, BlockType, getLocalizedContent } from '@/lib/ebook/types';
import { ComponentType } from 'react';

// Import block components
import { TextBlock } from './blocks/TextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { QuoteBlock } from './blocks/QuoteBlock';
import { CalloutBlock } from './blocks/CalloutBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { VideoBlock } from './blocks/VideoBlock';
import { DividerBlock } from './blocks/DividerBlock';
import { AccordionBlock } from './interactive/AccordionBlock';
import { TabsBlock } from './interactive/TabsBlock';

// Block component registry
const blockComponents: Record<BlockType, ComponentType<{ content: unknown; config?: unknown }>> = {
  text: TextBlock as ComponentType<{ content: unknown; config?: unknown }>,
  image: ImageBlock as ComponentType<{ content: unknown; config?: unknown }>,
  quote: QuoteBlock as ComponentType<{ content: unknown; config?: unknown }>,
  callout: CalloutBlock as ComponentType<{ content: unknown; config?: unknown }>,
  accordion: AccordionBlock as ComponentType<{ content: unknown; config?: unknown }>,
  tabs: TabsBlock as ComponentType<{ content: unknown; config?: unknown }>,
  code: CodeBlock as ComponentType<{ content: unknown; config?: unknown }>,
  video: VideoBlock as ComponentType<{ content: unknown; config?: unknown }>,
  divider: DividerBlock as ComponentType<{ content: unknown; config?: unknown }>,
};

interface BlockRendererProps {
  blocks: EbookContentBlock[];
  lang?: 'en' | 'pt';
  className?: string;
}

export function BlockRenderer({ blocks, lang = 'en', className }: BlockRendererProps) {
  return (
    <div className={className || 'space-y-6'}>
      {blocks.map((block) => {
        const Component = blockComponents[block.blockType];

        if (!Component) {
          console.warn(`Unknown block type: ${block.blockType}`);
          return null;
        }

        const content = getLocalizedContent(block, lang);

        return (
          <Component
            key={block.id}
            content={content}
            config={block.config}
          />
        );
      })}
    </div>
  );
}

// Export individual blocks for direct use
export {
  TextBlock,
  ImageBlock,
  QuoteBlock,
  CalloutBlock,
  CodeBlock,
  VideoBlock,
  DividerBlock,
  AccordionBlock,
  TabsBlock,
};
