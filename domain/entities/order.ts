/**
 * Order Domain Entities
 *
 * TypeScript types and enums for order management
 */

import { OrderStatus } from './content';

export interface OrderEntity {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  status: OrderStatus;
  total_price_usd: number;
  total_price_brl: number;
  currency: 'USD' | 'BRL';
  items: OrderItemEntity[];
  payment_method?: string;
  payment_status?: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface OrderItemEntity {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  quantity: number;
  price_usd: number;
  price_brl: number;
  total_usd: number;
  total_brl: number;
}

export interface DownloadEntity {
  id: string;
  order_id: string;
  product_id: string;
  file_url: string;
  file_name: string;
  downloaded_at?: string;
  created_at: string;
}
