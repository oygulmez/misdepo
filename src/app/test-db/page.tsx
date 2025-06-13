'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { updateProductSlugs } from '@/lib/update-slugs'
import { productsApi } from '@/lib/database'

export default function TestDatabase() {
  const [status, setStatus] = useState('Testing...')
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [error, setError] = useState('')
  const [slugUpdateStatus, setSlugUpdateStatus] = useState('')

  useEffect(() => {
    async function testConnection() {
      try {
        // Test 1: Basic connection
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .limit(5)
        
        if (catError) {
          throw catError
        }
        
        setCategories(catData || [])
        
        // Test 2: Products connection
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .limit(5)
        
        if (prodError) {
          console.warn('Products test failed:', prodError)
          setProducts([])
        } else {
          setProducts(prodData || [])
        }
        
        setStatus('✅ Database connection successful!')
        
      } catch (err: any) {
        setError(err.message)
        setStatus('❌ Database connection failed')
      }
    }

    testConnection()
  }, [])

  const handleSlugUpdate = async () => {
    setSlugUpdateStatus('🔄 Slug\'lar güncelleniyor...')
    try {
      await updateProductSlugs()
      setSlugUpdateStatus('✅ Slug güncelleme başarılı!')
      
      // Refresh products
      window.location.reload()
    } catch (error) {
      setSlugUpdateStatus('❌ Slug güncelleme başarısız')
    }
  }

  const testProductAccess = async () => {
    try {
      const allProducts = await productsApi.getAll()
      alert(`✅ ${allProducts.length} ürün başarıyla yüklendi!`)
    } catch (error) {
      alert('❌ Ürünler yüklenemedi: ' + error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🧪 System Stability Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <p className="text-lg">{status}</p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800 font-semibold">Error:</p>
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleSlugUpdate}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Slug&apos;ları Güncelle
            </button>
            <button
              onClick={testProductAccess}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              🧴 Ürünleri Test Et
            </button>
          </div>
          
          {slugUpdateStatus && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">{slugUpdateStatus}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Categories ({categories.length})
          </h2>
          
          {categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((category: any) => (
                <div 
                  key={category.id} 
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                  <p className="text-xs text-gray-400">
                    Created: {new Date(category.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              {error ? 'Could not load categories' : 'Loading categories...'}
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Products ({products.length})
          </h2>
          
          {products.length > 0 ? (
            <div className="space-y-2">
              {products.map((product: any) => (
                <div 
                  key={product.id} 
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-600">₺{product.price}</p>
                  {product.slug && (
                    <p className="text-xs text-green-600">Slug: {product.slug}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Created: {new Date(product.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No products found</p>
          )}
        </div>

        <div className="mt-6 text-center space-x-4">
          <a 
            href="/" 
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            ← Ana Sayfaya Dön
          </a>
          <a 
            href="/admin" 
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            🔧 Admin Panel
          </a>
        </div>
      </div>
    </div>
  )
} 