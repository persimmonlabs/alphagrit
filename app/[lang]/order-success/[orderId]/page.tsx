import { getDictionary } from '@/lib/dictionary';
import type { Locale } from '@/i18n-config';
import { serverApiClient } from '@/lib/api-client-server';
import OrderSuccessTemplate from '@/components/templates/OrderSuccessTemplate';
import { notFound } from 'next/navigation';

// Define interfaces for API data
interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_slug?: string;
  file_url?: string; // The original file URL from the product at time of order
}

interface Order {
  id: string;
  order_number?: string;
  customer_email: string;
  total: number;
  currency: string;
  status: string; // OrderStatus enum string
  created_at: string;
  items: OrderItem[];
}

interface DownloadLink {
  token: string;
  file_url: string; // The secure download URL
  expires_at: string;
  product_name?: string; // For display purposes
  product_slug?: string; // For linking back to product page
}

export default async function OrderSuccessPage({
  params: { lang, orderId },
}: {
  params: { lang: Locale; orderId: string };
}) {
  const dict = await getDictionary(lang);

  let order: Order | null = null;
  let downloadLinks: DownloadLink[] = [];

  try {
    order = await serverApiClient<Order>(`/orders/${orderId}`);
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    notFound(); // If order not found or error, show 404 page
  }

  if (order.status !== 'paid') { // Only show download links for paid orders
    // Optionally redirect or show a message for pending/failed orders
    // For now, we'll proceed but the template might handle this visually
  }

  // Generate download links for items that have a file_url
  // Assuming the backend has an endpoint to generate/retrieve secure download tokens
  // For now, we'll simulate these links or use the file_url directly from order items
  // In a real scenario, you'd likely hit an API like /downloads?order_id=X&product_id=Y
  downloadLinks = order.items
    .filter(item => item.file_url)
    .map(item => ({
      token: `${order.id}-${item.product_id}-secure-token`, // Placeholder token
      file_url: item.file_url || '#', // Use original file_url, actual secured URL would come from API
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      product_name: item.product_name,
      product_slug: item.product_slug,
    }));

  return (
    <OrderSuccessTemplate
      content={dict}
      lang={lang}
      order={order}
      downloadLinks={downloadLinks}
    />
  );
}
