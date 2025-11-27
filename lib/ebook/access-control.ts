import { serverApiClient } from '@/lib/api-client-server';

interface AccessCheckResponse {
  has_access: boolean;
  ebook_id: string;
  product_id: string;
}

export async function checkEbookAccess(
  userId: string,
  ebookId: string
): Promise<boolean> {
  try {
    const response = await serverApiClient<AccessCheckResponse>(
      `/ebooks/${ebookId}/access?user_id=${userId}`
    );
    return response.has_access;
  } catch (error) {
    console.error('Error checking ebook access:', error);
    return false;
  }
}

export async function getUserPurchasedEbooks(userId: string): Promise<string[]> {
  try {
    const response = await serverApiClient<{ ebook_ids: string[] }>(
      `/users/${userId}/purchased-ebooks`
    );
    return response.ebook_ids || [];
  } catch (error) {
    console.error('Error fetching user ebooks:', error);
    return [];
  }
}
