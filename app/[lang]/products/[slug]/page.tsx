import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { serverApiClient } from '@/lib/api-client-server';
import ProductDetailPageTemplate from '@/components/templates/ProductDetailPageTemplate';
import { notFound } from 'next/navigation';

// Define interfaces for API data
interface Product {
  id: string;
  name: string;
  slug: string;
  description_short?: string;
  description_full?: string;
  cover_image_url?: string;
  file_url?: string;
  file_size_bytes?: number;
  file_format?: string;
  author?: string;
  pages?: number;
  price_brl: number;
  price_usd: number;
  rating: number;
  total_reviews: number;
  category_id?: string;
  status: string;
}

interface Review {
  id: string;
  user_id?: string;
  product_id?: string;
  title?: string;
  content: string;
  rating: number;
  reviewer_name?: string;
  reviewer_avatar_url?: string;
  is_approved: boolean;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
}

export default async function ProductDetailPage({
  params: { lang, slug },
}: {
  params: { lang: Locale; slug: string };
}) {
  const dict = await getDictionary(lang);

  let product: Product | null = null;
  let reviews: Review[] = [];

  try {
    // Fetch product details by slug
    // Assuming the API has an endpoint to get product by slug
    // If not, we would need to list all products and filter by slug, which is less efficient.
    const productsResponse = await serverApiClient<Product[]>(`/products/?slug=${slug}`);
    if (productsResponse.length > 0) {
      product = productsResponse[0];
    } else {
      notFound(); // If product not found by slug, show 404 page
    }
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
    notFound();
  }

  if (product) {
    try {
      // Fetch approved reviews for this product
      reviews = await serverApiClient<Review[]>(`/reviews/?product_id=${product.id}&is_approved=true`);
    } catch (error) {
      console.error(`Error fetching reviews for product ${product.id}:`, error);
    }
  }

  // In a real application, you'd also fetch user data if the user is logged in
  // to pre-fill the review form or check if they can submit a review.
  const currentUser: UserProfile | null = null; // Placeholder for logged-in user

  return (
    <ProductDetailPageTemplate
      content={dict}
      lang={lang}
      product={product}
      reviews={reviews}
      currentUser={currentUser}
    />
  );
}
