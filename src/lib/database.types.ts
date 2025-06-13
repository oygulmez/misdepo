export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_id: string | null
          image_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug?: string
          description: string | null
          price: number
          campaign_price: number | null
          category_id: string
          image_urls: string[]
          stock_quantity: number
          min_stock_level: number
          sku: string | null
          variants: Json | null
          is_active: boolean
          is_featured: boolean
          is_campaign: boolean
          campaign_start_date: string | null
          campaign_end_date: string | null
          weight: number | null
          dimensions: Json | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string
          description?: string | null
          price: number
          campaign_price?: number | null
          category_id: string
          image_urls?: string[]
          stock_quantity?: number
          min_stock_level?: number
          sku?: string | null
          variants?: Json | null
          is_active?: boolean
          is_featured?: boolean
          is_campaign?: boolean
          campaign_start_date?: string | null
          campaign_end_date?: string | null
          weight?: number | null
          dimensions?: Json | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          price?: number
          campaign_price?: number | null
          category_id?: string
          image_urls?: string[]
          stock_quantity?: number
          min_stock_level?: number
          sku?: string | null
          variants?: Json | null
          is_active?: boolean
          is_featured?: boolean
          is_campaign?: boolean
          campaign_start_date?: string | null
          campaign_end_date?: string | null
          weight?: number | null
          dimensions?: Json | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          address: string
          notes: string | null
          total_orders: number
          total_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          address: string
          notes?: string | null
          total_orders?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string | null
          address?: string
          notes?: string | null
          total_orders?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          customer_name: string
          customer_phone: string
          customer_address: string
          payment_method: 'cash_on_delivery' | 'bank_transfer' | 'credit_card'
          status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          shipping_cost: number
          tax_amount: number
          total_amount: number
          notes: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          customer_id?: string
          customer_name: string
          customer_phone: string
          customer_address: string
          payment_method: 'cash_on_delivery' | 'bank_transfer' | 'credit_card'
          status?: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          shipping_cost?: number
          tax_amount?: number
          total_amount: number
          notes?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string
          customer_name?: string
          customer_phone?: string
          customer_address?: string
          payment_method?: 'cash_on_delivery' | 'bank_transfer' | 'credit_card'
          status?: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal?: number
          shipping_cost?: number
          tax_amount?: number
          total_amount?: number
          notes?: string | null
          admin_notes?: string | null
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
          product_price: number
          quantity: number
          total_price: number
          product_variant: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_price: number
          quantity: number
          total_price: number
          product_variant?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_price?: number
          quantity?: number
          total_price?: number
          product_variant?: Json | null
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      order_status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
      payment_method: 'cash_on_delivery' | 'bank_transfer' | 'credit_card'
    }
  }
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Helper types
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Setting = Database['public']['Tables']['settings']['Row']

export type InsertCategory = Database['public']['Tables']['categories']['Insert']
export type InsertProduct = Database['public']['Tables']['products']['Insert']
export type InsertCustomer = Database['public']['Tables']['customers']['Insert']
export type InsertOrder = Database['public']['Tables']['orders']['Insert']
export type InsertOrderItem = Database['public']['Tables']['order_items']['Insert']
export type InsertSetting = Database['public']['Tables']['settings']['Insert']

export type UpdateCategory = Database['public']['Tables']['categories']['Update']
export type UpdateProduct = Database['public']['Tables']['products']['Update']
export type UpdateCustomer = Database['public']['Tables']['customers']['Update']
export type UpdateOrder = Database['public']['Tables']['orders']['Update']
export type UpdateOrderItem = Database['public']['Tables']['order_items']['Update']
export type UpdateSetting = Database['public']['Tables']['settings']['Update'] 