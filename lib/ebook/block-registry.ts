import { ComponentType } from 'react';
import { BlockType, BlockContent, BlockConfig } from './types';

// Block component props type
export interface BlockComponentProps {
  content: BlockContent;
  config?: BlockConfig;
}

// Registry of block components
export type BlockRegistry = Partial<Record<BlockType, ComponentType<BlockComponentProps>>>;

// This will be populated in the BlockRenderer component
// to avoid importing client components in this shared file
