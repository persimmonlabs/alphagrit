'use server';

import { createServerClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';

export type Product = Database['public']['Tables']['products']['Row'];

/**
 * Fetch all active products
 */
export async function getProducts() {
  try {
    const supabase = await createServerClient();
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: products };
  } catch (error) {
    console.error('Unexpected error fetching products:', error);
    return { success: false, error: 'Failed to fetch products', data: [] };
  }
}

/**
 * Fetch a single product by slug
 */
export async function getProductBySlug(slug: string) {
  try {
    const supabase = await createServerClient();

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error(`Error fetching product with slug ${slug}:`, error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error(`Unexpected error fetching product ${slug}:`, error);
    return { success: false, error: 'Failed to fetch product', data: null };
  }
}
