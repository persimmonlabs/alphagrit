import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { serverApiClient } from '@/lib/api-client-server';
import ShoppingCartTemplate from '@/components/templates/ShoppingCartTemplate';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Define interfaces for API data
interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  // Potentially include product details directly or fetch them separately
  product_name?: string;
  product_slug?: string;
  product_price_usd?: number;
  product_cover_image_url?: string;
}

export default async function CartPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);

  // TODO: Replace with actual user ID from authentication context
  const userId = 'test_user_id'; 

  let cartItems: CartItem[] = [];

  try {
    cartItems = await serverApiClient<CartItem[]>(`/orders/cart/${userId}/items`);
  } catch (error) {
    console.error(`Error fetching cart items for user ${userId}:`, error);
    // Depending on error, might show an empty cart or an error message
  }

  return (
    <ShoppingCartTemplate
      content={dict}
      lang={lang}
      initialCartItems={cartItems}
      userId={userId}
    />
  );
}
