import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Creates an admin Supabase client with service role key
 * Used for server-side operations that bypass RLS
 */
function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Generates a signed URL for secure file download from Supabase Storage
 * @param filePath - Path to file in Supabase Storage (e.g., 'products/ebook.pdf')
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL or null if error
 */
export async function generateSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase.storage
      .from('products')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Error generating signed URL:', error);
      return null;
    }

    if (!data?.signedUrl) {
      console.error('No signed URL returned from Supabase');
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Exception generating signed URL:', error);
    return null;
  }
}

/**
 * Validates that a file exists in Supabase Storage
 * @param filePath - Path to file in Supabase Storage
 * @returns true if file exists, false otherwise
 */
export async function validateFileExists(filePath: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase.storage
      .from('products')
      .list(filePath.split('/').slice(0, -1).join('/'), {
        search: filePath.split('/').pop()
      });

    if (error) {
      console.error('Error validating file existence:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Exception validating file existence:', error);
    return false;
  }
}
