'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { validateDownload } from '@/lib/downloads/validate-download';
import { getDownloadStats } from '@/lib/downloads/track-download';

export interface DownloadInfo {
  productId: string;
  productName: string;
  downloadUrl: string;
  downloadCount: number;
  maxDownloads: number;
  remainingDownloads: number;
  expiresAt: string;
  isExpired: boolean;
  isLimitReached: boolean;
  canDownload: boolean;
}

/**
 * Server Action to get download information for a product
 * Used to display download status on user's ebooks page
 */
export async function getDownloadInfo(productId: string): Promise<{
  success: boolean;
  data?: DownloadInfo;
  error?: string;
}> {
  try {
    const supabase = createServerActionClient({ cookies });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Validate download eligibility
    const validation = await validateDownload(user.id, productId);

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('name')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return {
        success: false,
        error: 'Product not found'
      };
    }

    const maxDownloads = 5;
    const downloadCount = validation.downloadCount || 0;
    const remainingDownloads = Math.max(0, maxDownloads - downloadCount);
    const expiresAt = validation.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const isExpired = new Date(expiresAt) < new Date();
    const isLimitReached = downloadCount >= maxDownloads;
    const canDownload = validation.valid && !isExpired && !isLimitReached;

    return {
      success: true,
      data: {
        productId,
        productName: product.name,
        downloadUrl: `/api/download/${productId}`,
        downloadCount,
        maxDownloads,
        remainingDownloads,
        expiresAt,
        isExpired,
        isLimitReached,
        canDownload
      }
    };
  } catch (error) {
    console.error('Error getting download info:', error);
    return {
      success: false,
      error: 'Failed to retrieve download information'
    };
  }
}

/**
 * Server Action to get all downloadable products for the current user
 */
export async function getUserDownloads(): Promise<{
  success: boolean;
  data?: DownloadInfo[];
  error?: string;
}> {
  try {
    const supabase = createServerActionClient({ cookies });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Get all products user has purchased
    const { data: orderItems, error: orderError } = await supabase
      .from('order_items')
      .select(`
        product_id,
        products (
          id,
          name
        ),
        orders!inner (
          user_id,
          status
        )
      `)
      .eq('orders.user_id', user.id)
      .eq('orders.status', 'completed');

    if (orderError) {
      return {
        success: false,
        error: 'Failed to retrieve purchases'
      };
    }

    if (!orderItems || orderItems.length === 0) {
      return {
        success: true,
        data: []
      };
    }

    // Get download info for each product
    const downloadInfoPromises = orderItems.map(async (item) => {
      const result = await getDownloadInfo(item.product_id);
      return result.success ? result.data : null;
    });

    const downloadInfos = await Promise.all(downloadInfoPromises);
    const validDownloads = downloadInfos.filter((info): info is DownloadInfo => info !== null);

    return {
      success: true,
      data: validDownloads
    };
  } catch (error) {
    console.error('Error getting user downloads:', error);
    return {
      success: false,
      error: 'Failed to retrieve downloads'
    };
  }
}

/**
 * Server Action to initiate a download
 * Returns the download URL that the client should navigate to
 */
export async function initiateDownload(productId: string): Promise<{
  success: boolean;
  downloadUrl?: string;
  error?: string;
}> {
  try {
    const supabase = createServerActionClient({ cookies });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Validate download eligibility
    const validation = await validateDownload(user.id, productId);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Download not allowed'
      };
    }

    // Return the API endpoint URL
    return {
      success: true,
      downloadUrl: `/api/download/${productId}`
    };
  } catch (error) {
    console.error('Error initiating download:', error);
    return {
      success: false,
      error: 'Failed to initiate download'
    };
  }
}
