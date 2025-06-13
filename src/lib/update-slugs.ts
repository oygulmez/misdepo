import { supabase } from './supabase'
import { createSlug } from './database'

export async function updateProductSlugs() {
  try {
    console.log('🔄 Ürün slug\'ları güncelleniyor...')
    
    // Get all products without slugs
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .or('slug.is.null,slug.eq.')
    
    if (fetchError) {
      console.error('❌ Ürünler getirilemedi:', fetchError)
      return
    }

    if (!products || products.length === 0) {
      console.log('✅ Tüm ürünlerin slug\'ı mevcut')
      return
    }

    console.log(`📝 ${products.length} ürün için slug oluşturuluyor...`)

    // Update each product with a slug
    for (const product of products) {
      const slug = createSlug(product.name)
      
      try {
        const { error: updateError } = await supabase
          .from('products')
          .update({ slug })
          .eq('id', product.id)

        if (updateError) {
          console.error(`❌ "${product.name}" için slug güncellenemedi:`, updateError)
        } else {
          console.log(`✅ "${product.name}" -> "${slug}"`)
        }
      } catch (error) {
        console.log(`⚠️ "${product.name}" için slug kolonu henüz mevcut değil, atlanıyor...`)
      }
    }

    console.log('🎉 Slug güncelleme işlemi tamamlandı!')
    
  } catch (error) {
    console.error('❌ Slug güncelleme hatası:', error)
  }
} 