import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { serverApiClient } from '@/lib/api-client-server';
import ProductCatalogTemplate from '@/components/templates/ProductCatalogTemplate';

export const dynamic = 'force-dynamic';

// Define interfaces for API data
interface Product {
  id: string;
  name: string;
  slug: string;
  description_short?: string;
  cover_image_url?: string;
  price_brl: number;
  price_usd: number;
  rating: number;
  total_reviews: number;
  category_id?: string;
  status: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default async function ProductsPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);

  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    products = await serverApiClient<Product[]>('/products/');
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  try {
    categories = await serverApiClient<Category[]>('/products/categories');
  } catch (error) {
    console.error('Error fetching categories:', error);
  }

  return (
    <ProductCatalogTemplate
      content={dict}
      lang={lang}
      products={products}
      categories={categories}
    />
  );
}
