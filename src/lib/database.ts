import { supabase } from './supabase'
import { 
  Category, Product, Customer, Order, OrderItem, Setting,
  InsertCategory, InsertProduct, InsertCustomer, InsertOrder, InsertOrderItem,
  UpdateCategory, UpdateProduct, UpdateCustomer, UpdateOrder
} from './database.types'

// Categories CRUD
export const categoriesApi = {
  // Get all categories
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data as Category[]
  },

  // Get categories with hierarchy
  async getWithHierarchy() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    
    // Organize categories into hierarchical structure
    const categories = data as Category[]
    const topLevel = categories.filter(cat => !cat.parent_id)
    const withChildren = topLevel.map(parent => ({
      ...parent,
      children: categories.filter(cat => cat.parent_id === parent.id)
    }))
    
    return withChildren
  },

  // Get category by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Category
  },

  // Create category
  async create(category: InsertCategory) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()
    
    if (error) throw error
    return data as Category
  },

  // Update category
  async update(id: string, updates: UpdateCategory) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Category
  },

  // Delete category
  async delete(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Products CRUD
export const productsApi = {
  // Get all products
  async getAll(filters?: {
    category_id?: string
    is_active?: boolean
    is_featured?: boolean
    is_campaign?: boolean
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
    
    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters?.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured)
    }
    if (filters?.is_campaign !== undefined) {
      query = query.eq('is_campaign', filters.is_campaign)
    }
    
    query = query.order('created_at', { ascending: false })
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data as (Product & { categories: { id: string, name: string } })[]
  },

  // Get product by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Product & { categories: { id: string, name: string } }
  },

  // Search products
  async search(query: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
      .eq('is_active', true)
    
    if (error) throw error
    return data as (Product & { categories: { id: string, name: string } })[]
  },

  // Create product
  async create(product: InsertProduct) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()
    
    if (error) throw error
    return data as Product
  },

  // Update product
  async update(id: string, updates: UpdateProduct) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Product
  },

  // Delete product
  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Customers CRUD
export const customersApi = {
  // Get all customers
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Customer[]
  },

  // Get customer by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Customer
  },

  // Get customer by phone
  async getByPhone(phone: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .maybeSingle()
    
    if (error) throw error
    return data as Customer | null
  },

  // Create customer
  async create(customer: InsertCustomer) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single()
    
    if (error) throw error
    return data as Customer
  },

  // Update customer
  async update(id: string, updates: UpdateCustomer) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Customer
  }
}

// Orders CRUD
export const ordersApi = {
  // Get all orders
  async getAll(filters?: {
    status?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        customers (
          id,
          name,
          phone
        ),
        order_items (
          *,
          products (
            id,
            name
          )
        )
      `)
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    query = query.order('created_at', { ascending: false })
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  // Get order by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (
          id,
          name,
          phone
        ),
        order_items (
          *,
          products (
            id,
            name
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create order with items
  async create(order: InsertOrder, items: InsertOrderItem[]) {
    // Start transaction
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()
    
    if (orderError) throw orderError
    
    // Insert order items
    const orderItems = items.map(item => ({
      ...item,
      order_id: orderData.id
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) throw itemsError
    
    return orderData as Order
  },

  // Update order status
  async updateStatus(id: string, status: string, adminNotes?: string) {
    const updates: UpdateOrder = { status: status as any }
    if (adminNotes) {
      updates.admin_notes = adminNotes
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Order
  },

  // Get dashboard stats
  async getDashboardStats() {
    const { data: todayOrders, error: todayError } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', new Date().toISOString().split('T')[0])
    
    const { data: weekOrders, error: weekError } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    
    const { data: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (todayError || weekError || pendingError) {
      throw todayError || weekError || pendingError
    }
    
    const todayRevenue = todayOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    const weekRevenue = weekOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    
    return {
      todayOrders: todayOrders?.length || 0,
      weekOrders: weekOrders?.length || 0,
      todayRevenue,
      weekRevenue,
      pendingOrders: pendingOrders || []
    }
  }
}

// Settings CRUD
export const settingsApi = {
  // Get all settings
  async getAll() {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('key')
    
    if (error) throw error
    return data as Setting[]
  },

  // Get setting by key
  async getByKey(key: string) {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .single()
    
    if (error) throw error
    return data as Setting
  },

  // Update setting
  async updateByKey(key: string, value: any) {
    const { data, error } = await supabase
      .from('settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single()
    
    if (error) throw error
    return data as Setting
  }
} 