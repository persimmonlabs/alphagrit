// Account-related TypeScript types

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  total: number;
  status: 'pending' | 'completed' | 'refunded' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method: string | null;
  stripe_payment_intent_id: string | null;
  refund_status: 'none' | 'requested' | 'approved' | 'rejected' | 'completed';
  refund_reason: string | null;
  refund_requested_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    title: string;
    slug: string;
    type: 'physical' | 'ebook' | 'bundle';
    cover_image: string | null;
  };
}

export interface PurchasedEbook {
  id: string;
  order_id: string;
  product_id: string;
  download_count: number;
  max_downloads: number;
  expires_at: string | null;
  created_at: string;
  product: {
    id: string;
    title: string;
    slug: string;
    cover_image: string | null;
    file_url: string | null;
  };
  order: {
    created_at: string;
  };
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  avatar_url?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface RefundRequest {
  orderId: string;
  reason: string;
}

export interface UserPreferences {
  language: 'pt' | 'en';
  theme: 'light' | 'dark' | 'system';
}

export interface AccountStats {
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  ebooksOwned: number;
}
