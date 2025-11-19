import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export interface DownloadValidationResult {
  valid: boolean;
  error?: string;
  linkId?: string;
  filePath?: string;
  downloadCount?: number;
  maxDownloads?: number;
  expiresAt?: string;
}

/**
 * Validates if a user can download a product
 * Checks: authentication, ownership, expiry, download limits
 */
export async function validateDownload(
  userId: string,
  productId: string
): Promise<DownloadValidationResult> {
  try {
    const supabase = createAdminClient();

    // 1. Check if user has purchased this product
    const { data: orderItems, error: orderError } = await supabase
      .from('order_items')
      .select(`
        id,
        orders!inner (
          user_id,
          status,
          created_at
        )
      `)
      .eq('product_id', productId)
      .eq('orders.user_id', userId)
      .eq('orders.status', 'completed')
      .order('orders.created_at', { ascending: false })
      .limit(1);

    if (orderError || !orderItems || orderItems.length === 0) {
      return {
        valid: false,
        error: "You don't own this product. Please purchase it first."
      };
    }

    // 2. Get or create download link
    const { data: existingLink } = await supabase
      .from('download_links')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    let downloadLink = existingLink;

    // If no link exists, create one
    if (!downloadLink) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      const { data: product } = await supabase
        .from('products')
        .select('file_path')
        .eq('id', productId)
        .single();

      if (!product?.file_path) {
        return {
          valid: false,
          error: 'Product file not available. Please contact support.'
        };
      }

      const { data: newLink, error: createError } = await supabase
        .from('download_links')
        .insert({
          user_id: userId,
          product_id: productId,
          expires_at: expiresAt.toISOString(),
          download_count: 0,
          ip_addresses: []
        })
        .select()
        .single();

      if (createError || !newLink) {
        return {
          valid: false,
          error: 'Failed to create download link. Please try again.'
        };
      }

      downloadLink = newLink;
    }

    // 3. Check if link has expired
    const expiresAt = new Date(downloadLink.expires_at);
    if (expiresAt < new Date()) {
      return {
        valid: false,
        error: 'This download link has expired. Please contact support for assistance.'
      };
    }

    // 4. Check download limit
    const maxDownloads = 5;
    if (downloadLink.download_count >= maxDownloads) {
      return {
        valid: false,
        error: `Download limit reached (${maxDownloads}/${maxDownloads}). Contact support if you need more downloads.`,
        downloadCount: downloadLink.download_count,
        maxDownloads
      };
    }

    // 5. Get product file path
    const { data: product } = await supabase
      .from('products')
      .select('file_path')
      .eq('id', productId)
      .single();

    if (!product?.file_path) {
      return {
        valid: false,
        error: 'Product file not available. Please contact support.'
      };
    }

    // All validations passed
    return {
      valid: true,
      linkId: downloadLink.id,
      filePath: product.file_path,
      downloadCount: downloadLink.download_count,
      maxDownloads,
      expiresAt: downloadLink.expires_at
    };
  } catch (error) {
    console.error('Exception validating download:', error);
    return {
      valid: false,
      error: 'An error occurred while validating your download. Please try again.'
    };
  }
}
