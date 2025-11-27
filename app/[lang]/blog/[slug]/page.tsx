import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { serverApiClient } from '@/lib/api-client-server';
import BlogPostPageTemplate from '@/components/templates/BlogPostPageTemplate';
import { notFound } from 'next/navigation';
import { PostStatus } from '@/domain/entities/content';

// Define interface for API data
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

export default async function BlogPostPage({
  params: { lang, slug },
}: {
  params: { lang: Locale; slug: string };
}) {
  const dict = await getDictionary(lang);

  let blogPost: BlogPost | null = null;
  let allBlogPosts: BlogPost[] = [];

  try {
    // Fetch blog post details by slug
    const blogPostsResponse = await serverApiClient<BlogPost[]>(`/content/blog-posts/?slug=${slug}`);
    if (blogPostsResponse.length > 0) {
      blogPost = blogPostsResponse[0];
    } else {
      notFound(); // If blog post not found by slug, show 404 page
    }
  } catch (error) {
    console.error(`Error fetching blog post with slug ${slug}:`, error);
    notFound();
  }

  // Ensure only published posts are displayed in the public view
  if (blogPost && blogPost.status !== PostStatus.PUBLISHED) {
    notFound();
  }

  // Fetch all blog posts for related articles
  try {
    allBlogPosts = await serverApiClient<BlogPost[]>(`/content/blog-posts/?status=${PostStatus.PUBLISHED}`);
  } catch (error) {
    console.error('Error fetching all blog posts:', error);
  }

  // Get related posts (same category or random)
  const relatedPosts = allBlogPosts
    .filter((post) => post.id !== blogPost?.id)
    .filter((post) => !blogPost?.category || post.category === blogPost.category)
    .slice(0, 3);

  // If not enough related posts, fill with random posts
  if (relatedPosts.length < 3) {
    const remainingPosts = allBlogPosts
      .filter((post) => post.id !== blogPost?.id && !relatedPosts.find((rp) => rp.id === post.id))
      .slice(0, 3 - relatedPosts.length);
    relatedPosts.push(...remainingPosts);
  }

  return (
    <BlogPostPageTemplate
      content={dict}
      lang={lang}
      blogPost={blogPost}
      relatedPosts={relatedPosts}
    />
  );
}
