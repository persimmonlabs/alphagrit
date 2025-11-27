import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { serverApiClient } from '@/lib/api-client-server';
import CheckoutTemplate from '@/components/templates/CheckoutTemplate';
import { notFound } from 'next/navigation';

// Define interfaces for API data
interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product_name?: string;
  product_price_usd?: number;
  product_cover_image_url?: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
}

export default async function CheckoutPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(lang);

  // TODO: Replace with actual user ID from authentication context
  const userId = 'test_user_id';
  // TODO: Fetch real user profile from API based on userId
  const currentUser: UserProfile = {
    id: userId,
    email: 'test@example.com', // Dummy email
    full_name: 'Test User',     // Dummy name
  };

  let cartItems: CartItem[] = [];

  try {
    cartItems = await serverApiClient<CartItem[]>(`/orders/${userId}/items`);
    if (cartItems.length === 0) {
      // If cart is empty, redirect to cart page or show a message
      // For now, we'll let the template handle the empty cart state
    }
  } catch (error) {
    console.error(`Error fetching cart items for user ${userId}:`, error);
    // Handle error, e.g., show an empty cart or error message
  }

  return (
    <CheckoutTemplate
      content={dict}
      lang={lang}
      cartItems={cartItems}
      currentUser={currentUser}
    />
  );
}
