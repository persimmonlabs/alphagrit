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

export interface DownloadTrackingResult {
  success: boolean;
  error?: string;
  remainingDownloads?: number;
}

/**
 * Tracks a download event and enforces download limits
 * @param linkId - Download link ID
 * @param ipAddress - User's IP address
 * @param maxDownloads - Maximum allowed downloads (default: 5)
 * @returns Result with success status and remaining downloads
 */
export async function trackDownload(
  linkId: string,
  ipAddress: string,
  maxDownloads: number = 5
): Promise<DownloadTrackingResult> {
  try {
    const supabase = createAdminClient();

    // Get current download link
    const { data: link, error: fetchError } = await supabase
      .from('download_links')
      .select('download_count, ip_addresses')
      .eq('id', linkId)
      .single();

    if (fetchError || !link) {
      return {
        success: false,
        error: 'Download link not found'
      };
    }

    // Check download limit
    if (link.download_count >= maxDownloads) {
      return {
        success: false,
        error: `Download limit reached (${maxDownloads}/${maxDownloads})`,
        remainingDownloads: 0
      };
    }

    // Update download count and IP addresses
    const ipAddresses = link.ip_addresses || [];
    if (!ipAddresses.includes(ipAddress)) {
      ipAddresses.push(ipAddress);
    }

    const { error: updateError } = await supabase
      .from('download_links')
      .update({
        download_count: link.download_count + 1,
        ip_addresses: ipAddresses,
        last_downloaded_at: new Date().toISOString()
      })
      .eq('id', linkId);

    if (updateError) {
      console.error('Error updating download tracking:', updateError);
      return {
        success: false,
        error: 'Failed to track download'
      };
    }

    return {
      success: true,
      remainingDownloads: maxDownloads - (link.download_count + 1)
    };
  } catch (error) {
    console.error('Exception tracking download:', error);
    return {
      success: false,
      error: 'Internal error tracking download'
    };
  }
}

/**
 * Gets download statistics for a link
 * @param linkId - Download link ID
 * @returns Download stats or null if error
 */
export async function getDownloadStats(linkId: string) {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('download_links')
      .select('download_count, ip_addresses, last_downloaded_at, expires_at')
      .eq('id', linkId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      downloadCount: data.download_count,
      uniqueIPs: data.ip_addresses?.length || 0,
      lastDownloadedAt: data.last_downloaded_at,
      expiresAt: data.expires_at
    };
  } catch (error) {
    console.error('Exception getting download stats:', error);
    return null;
  }
}
