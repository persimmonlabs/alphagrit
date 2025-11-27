import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { serverApiClient } from '@/lib/api-client-server';
import BlogIndexTemplate from '@/components/templates/BlogIndexTemplate';
import { PostStatus } from '@/domain/entities/content'; // Assuming this enum is available

// Define interfaces for API data
interface BlogPost {
  id: string;
  title: string;
  title_pt?: string;
  title_en?: string;
  slug: string;
  excerpt?: string;
  excerpt_pt?: string;
  excerpt_en?: string;
  content: string;
  content_pt?: string;
  content_en?: string;
  author_id?: string;
  author_name?: string;
  author?: string;
  cover_image_url?: string;
  status: PostStatus;
  published_at?: string;
  created_at: string;
  updated_at: string;
  category?: string;
  read_time?: number;
}

export default async function BlogIndexPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);

  let blogPosts: BlogPost[] = [];

  try {
    // Fetch only published blog posts
    blogPosts = await serverApiClient<BlogPost[]>(`/content/blog-posts/?status=${PostStatus.PUBLISHED}`);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
  }

  return (
    <BlogIndexTemplate
      content={dict}
      lang={lang}
      blogPosts={blogPosts}
    />
  );
}
