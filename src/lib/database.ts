import { supabase } from './supabase'
import { 
  Category, Product, Customer, Order, OrderItem, Setting,
  InsertCategory, InsertProduct, InsertCustomer, InsertOrder, InsertOrderItem,
  UpdateCategory, UpdateProduct, UpdateCustomer, UpdateOrder
} from './database.types'

// Helper function to create SEO-friendly slug
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u') 
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .slice(0, 100) // Limit length
}

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

  // Get product by slug (SEO-friendly) with fallback to ID and name search
  async getBySlug(slug: string) {
    console.log('🔍 getBySlug çağrıldı:', slug)
    
    try {
      // First try to get by slug
      console.log('🔍 1. Slug ile arama yapılıyor...')
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single()
      
      console.log('📊 Slug sorgu sonucu:', { data, error })
      
      if (data && !error) {
        console.log('✅ Slug ile ürün bulundu!')
        return data as Product & { categories: { id: string, name: string } }
      }
    } catch (slugError) {
      console.log('⚠️ Slug arama hatası (normal, slug kolonu olmayabilir):', slugError)
    }

    try {
      // If slug fails, try to get by ID as fallback
      console.log('🔍 2. ID ile arama yapılıyor...')
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('id', slug)
        .eq('is_active', true)
        .single()
      
      console.log('📊 ID sorgu sonucu:', { data, error })
      
      if (data && !error) {
        console.log('✅ ID ile ürün bulundu!')
        return data as Product & { categories: { id: string, name: string } }
      }
    } catch (idError) {
      console.log('⚠️ ID arama hatası:', idError)
    }

    try {
      // Try to find by name (convert slug back to name and search)
      console.log('🔍 3. Tüm ürünleri getirip isim karşılaştırması yapılıyor...')
      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('is_active', true)
      
      console.log('📊 Tüm ürünler sorgu sonucu:', { count: allProducts?.length, error: allError })
      
      if (allProducts && !allError) {
        console.log('🔍 İsim bazlı slug eşleştirmesi yapılıyor...')
        const matchingProduct = allProducts.find(product => {
          const generatedSlug = createSlug(product.name)
          console.log(`🔗 ${product.name} -> ${generatedSlug} (aranan: ${slug})`)
          return generatedSlug === slug
        })
        
        if (matchingProduct) {
          console.log('✅ İsim bazlı eşleştirme ile ürün bulundu!', matchingProduct.name)
          return matchingProduct as Product & { categories: { id: string, name: string } }
        } else {
          console.log('❌ Hiçbir ürün slug ile eşleşmedi')
        }
      }
    } catch (nameError) {
      console.log('⚠️ İsim bazlı arama hatası:', nameError)
    }
    
    console.log('❌ Tüm arama yöntemleri başarısız oldu')
    throw new Error('Product not found')
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
    try {
      // Auto-generate slug if not provided and if slug column exists
      const productData = {
        ...product,
      }
      
      // Try to add slug, but don't fail if column doesn't exist yet
      try {
        productData.slug = product.slug || createSlug(product.name)
      } catch (slugError) {
        // Slug column might not exist yet, continue without it
        console.log('Slug column not available yet, creating product without slug')
      }

      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single()
      
      if (error) throw error
      return data as Product
    } catch (createError) {
      // If slug causes issue, try without slug
      const productWithoutSlug = {
        name: product.name,
        description: product.description,
        price: product.price,
        campaign_price: product.campaign_price,
        category_id: product.category_id,
        image_urls: product.image_urls,
        stock_quantity: product.stock_quantity,
        is_active: product.is_active,
        is_featured: product.is_featured,
        is_campaign: product.is_campaign,
      }

      const { data, error } = await supabase
        .from('products')
        .insert(productWithoutSlug)
        .select()
        .single()
      
      if (error) throw error
      return data as Product
    }
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

  // Update or create setting
  async updateByKey(key: string, value: any) {
    console.log(`🔧 updateByKey çağrıldı: ${key} = ${JSON.stringify(value)}`)
    
    // Önce mevcut kaydı kontrol et
    const { data: existing } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .single()
    
    // Value'yu JSONB için hazırla - Supabase otomatik olarak handle eder
    const jsonValue = value // Direkt değeri kullan, JSON.stringify yapmaya gerek yok
    
    console.log(`💾 JSONB için hazırlanan value: ${JSON.stringify(jsonValue)}`)
    
    if (existing) {
      // Güncelle
      const { data, error } = await supabase
        .from('settings')
        .update({ value: jsonValue, updated_at: new Date().toISOString() })
        .eq('key', key)
        .select()
        .single()
      
      console.log(`✅ Güncellendi: ${key}`, data)
      if (error) {
        console.error(`❌ Güncelleme hatası ${key}:`, error)
        throw error
      }
      return data as Setting
    } else {
      // Yeni oluştur
      const { data, error } = await supabase
        .from('settings')
        .insert({ 
          key, 
          value: jsonValue, 
          description: `Auto-created setting for ${key}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      console.log(`🆕 Oluşturuldu: ${key}`, data)
      if (error) {
        console.error(`❌ Oluşturma hatası ${key}:`, error)
        throw error
      }
      return data as Setting
    }
  },

  // Initialize default settings - SADECE YOK OLAN KAYITLARI OLUŞTUR
  async initializeDefaults() {
    console.log('🔄 Default settings initialize ediliyor...')
    
    const defaultSettings = [
      { key: 'siteName', value: 'Temizlik & Ambalaj', description: 'Site adı' },
      { key: 'siteDescription', value: 'Kaliteli temizlik ürünleri ve ambalaj çözümleri', description: 'Site açıklaması' },
      { key: 'contactEmail', value: 'info@temizlikambalaj.com', description: 'İletişim e-postası' },
      { key: 'contactPhone', value: '+90 (212) 123 45 67', description: 'İletişim telefonu' },
      { key: 'address', value: 'İstanbul, Türkiye', description: 'Şirket adresi' },
      { key: 'website', value: 'https://temizlikambalaj.com', description: 'Website URL' },
      { key: 'currency', value: 'TRY', description: 'Para birimi' },
      { key: 'minOrderAmount', value: 100, description: 'Minimum sipariş tutarı' },
      { key: 'freeShippingLimit', value: 500, description: 'Ücretsiz kargo limiti' },
      { key: 'taxRate', value: 18, description: 'KDV oranı' },
      { key: 'emailNotifications', value: true, description: 'E-posta bildirimleri' },
      { key: 'smsNotifications', value: false, description: 'SMS bildirimleri' },
      { key: 'orderNotifications', value: true, description: 'Sipariş bildirimleri' },
      { key: 'stockAlerts', value: true, description: 'Stok uyarıları' },
      { key: 'twoFactorAuth', value: false, description: 'İki faktörlü doğrulama' },
      { key: 'sessionTimeout', value: 60, description: 'Oturum zaman aşımı (dakika)' }
    ]

    // Sadece yok olan ayarları oluştur - mevcut olanları değiştirme!
    for (const setting of defaultSettings) {
      try {
        // Önce kontrol et, sadece yoksa oluştur
        console.log(`🔍 Kontrol ediliyor: ${setting.key}`)
        const { data: existing } = await supabase
          .from('settings')
          .select('*')
          .eq('key', setting.key)
          .single()
        
        if (!existing) {
          // Yok ise oluştur
          console.log(`🆕 Oluşturuluyor: ${setting.key}`)
          const { data, error } = await supabase
            .from('settings')
            .insert({ 
              key: setting.key, 
              value: setting.value, 
              description: setting.description,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single()
            
          if (error) {
            console.error(`❌ Oluşturma hatası ${setting.key}:`, error)
          } else {
            console.log(`✅ Oluşturuldu: ${setting.key}`)
          }
        } else {
          // Var ise DOKUNMA!
          console.log(`⏭️ Zaten var, atlanıyor: ${setting.key}`)
        }
      } catch (error) {
        // Kayıt bulunamadı hatası normal, yeni oluştur
        if ((error as any)?.code === 'PGRST116') {
          console.log(`🆕 Bulunamadı, oluşturuluyor: ${setting.key}`)
          try {
            const { data, error: insertError } = await supabase
              .from('settings')
              .insert({ 
                key: setting.key, 
                value: setting.value, 
                description: setting.description,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single()
              
            if (insertError) {
              console.error(`❌ Oluşturma hatası ${setting.key}:`, insertError)
            } else {
              console.log(`✅ Oluşturuldu: ${setting.key}`)
            }
          } catch (insertError) {
            console.error(`❌ Insert hatası ${setting.key}:`, insertError)
          }
        } else {
          console.error(`❌ Beklenmeyen hata ${setting.key}:`, error)
        }
      }
    }
    
    console.log('✅ Default settings initialize tamamlandı!')
  },

  // Clear all settings (debug için)
  async clearAll() {
    const { error } = await supabase
      .from('settings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Tümünü sil
    
    if (error) throw error
    console.log('🧹 Tüm ayarlar temizlendi!')
  }
} 