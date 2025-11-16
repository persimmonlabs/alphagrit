/**
 * Supabase database types (generated)
 * This will be replaced by actual generated types from Supabase CLI
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          price_brl: number
          price_usd: number
          type: string
          category: string | null
          cover_image_url: string | null
          file_url: string | null
          file_size_bytes: number | null
          status: string
          stripe_product_id: string | null
          stripe_price_id_brl: string | null
          stripe_price_id_usd: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          price_brl: number
          price_usd: number
          type?: string
          category?: string | null
          cover_image_url?: string | null
          file_url?: string | null
          file_size_bytes?: number | null
          status?: string
          stripe_product_id?: string | null
          stripe_price_id_brl?: string | null
          stripe_price_id_usd?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          price_brl?: number
          price_usd?: number
          type?: string
          category?: string | null
          cover_image_url?: string | null
          file_url?: string | null
          file_size_bytes?: number | null
          status?: string
          stripe_product_id?: string | null
          stripe_price_id_brl?: string | null
          stripe_price_id_usd?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          order_number: string
          email: string
          status: string
          currency: string
          subtotal: number
          total: number
          payment_provider: string | null
          payment_intent_id: string | null
          payment_status: string | null
          refund_status: string | null
          refund_reason: string | null
          refunded_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          order_number: string
          email: string
          status?: string
          currency: string
          subtotal: number
          total: number
          payment_provider?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          refund_status?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          order_number?: string
          email?: string
          status?: string
          currency?: string
          subtotal?: number
          total?: number
          payment_provider?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          refund_status?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_type: string
          quantity: number
          price: number
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_type: string
          quantity?: number
          price: number
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_type?: string
          quantity?: number
          price?: number
          metadata?: Json
          created_at?: string
        }
      }
      download_links: {
        Row: {
          id: string
          order_id: string
          product_id: string
          user_id: string
          signed_url: string
          download_count: number
          download_limit: number
          expires_at: string
          ip_addresses: string[]
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          user_id: string
          signed_url: string
          download_count?: number
          download_limit?: number
          expires_at: string
          ip_addresses?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          user_id?: string
          signed_url?: string
          download_count?: number
          download_limit?: number
          expires_at?: string
          ip_addresses?: string[]
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          author_name: string
          author_title: string | null
          rating: number | null
          content: string
          featured: boolean
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          author_name: string
          author_title?: string | null
          rating?: number | null
          content: string
          featured?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          author_name?: string
          author_title?: string | null
          rating?: number | null
          content?: string
          featured?: boolean
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          cover_image_url: string | null
          author_id: string | null
          status: string
          published_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          cover_image_url?: string | null
          author_id?: string | null
          status?: string
          published_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          cover_image_url?: string | null
          author_id?: string | null
          status?: string
          published_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          category: string | null
          order_index: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          category?: string | null
          order_index?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          category?: string | null
          order_index?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      site_config: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          updated_at?: string
        }
      }
      feature_flags: {
        Row: {
          id: string
          name: string
          enabled: boolean
          description: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          enabled?: boolean
          description?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          enabled?: boolean
          description?: string | null
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
        }
      }
      page_views: {
        Row: {
          id: string
          page_path: string
          referrer: string | null
          user_id: string | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          page_path: string
          referrer?: string | null
          user_id?: string | null
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          page_path?: string
          referrer?: string | null
          user_id?: string | null
          session_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_download_link: {
        Args: {
          p_order_id: string
          p_product_id: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
