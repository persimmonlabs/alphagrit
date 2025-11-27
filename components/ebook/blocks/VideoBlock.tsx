'use client';

import { VideoBlockContent, BlockConfig } from '@/lib/ebook/types';
import { cn } from '@/lib/utils';

interface VideoBlockProps {
  content: VideoBlockContent;
  config?: BlockConfig;
}

function getYoutubeEmbedUrl(url: string): string {
  const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

function getVimeoEmbedUrl(url: string): string {
  const videoId = url.match(/vimeo\.com\/(?:.*\/)?([0-9]+)/)?.[1];
  return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
}

export function VideoBlock({ content, config }: VideoBlockProps) {
  let embedUrl = content.src;

  if (content.type === 'youtube') {
    embedUrl = getYoutubeEmbedUrl(content.src);
  } else if (content.type === 'vimeo') {
    embedUrl = getVimeoEmbedUrl(content.src);
  }

  if (content.type === 'file') {
    return (
      <figure className={cn('my-8', config?.className)} style={config?.style}>
        <video
          src={content.src}
          controls
          className="w-full rounded-lg"
          title={content.title}
        >
          Your browser does not support the video tag.
        </video>
        {content.title && (
          <figcaption className="mt-3 text-center text-sm text-muted-foreground">
            {content.title}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className={cn('my-8', config?.className)} style={config?.style}>
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
        <iframe
          src={embedUrl}
          title={content.title || 'Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
      {content.title && (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {content.title}
        </figcaption>
      )}
    </figure>
  );
}
