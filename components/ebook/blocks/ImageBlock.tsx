'use client';

import Image from 'next/image';
import { ImageBlockContent, BlockConfig } from '@/lib/ebook/types';
import { cn } from '@/lib/utils';

interface ImageBlockProps {
  content: ImageBlockContent;
  config?: BlockConfig;
}

export function ImageBlock({ content, config }: ImageBlockProps) {
  return (
    <figure className={cn('my-8', config?.className)} style={config?.style}>
      <div className="relative overflow-hidden rounded-lg">
        <Image
          src={content.src}
          alt={content.alt}
          width={800}
          height={450}
          className="w-full h-auto object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
        />
      </div>
      {content.caption && (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground italic">
          {content.caption}
        </figcaption>
      )}
    </figure>
  );
}
