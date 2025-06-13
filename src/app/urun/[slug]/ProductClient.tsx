'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { Product } from '@/lib/database.types'

interface ProductClientProps {
  product: Product & { categories?: { id: string, name: string } }
}

export default function ProductClient({ product }: ProductClientProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  
  const { addToCart, formatPrice, getItemQuantity } = useCart()
  const { success, error: showError } = useToast()

  const handleAddToCart = async () => {
    if (!product) return
    
    setAddingToCart(true)
    try {
      addToCart(product, quantity)
      
      // Show success feedback
      success('Sepete Eklendi!', `${product.name} sepetinize eklendi`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      showError('Hata!', 'Sepete eklenirken bir hata oluştu')
    } finally {
      setAddingToCart(false)
    }
  }

  const currentPrice = product.is_campaign && product.campaign_price 
    ? product.campaign_price 
    : product.price
  
  const inCartQuantity = getItemQuantity(product.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-mobile sm:container-tablet lg:container-desktop py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-primary-600">
              Temizlik & Ambalaj
            </Link>
            <button 
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Geri Dön
            </button>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="container-mobile sm:container-tablet lg:container-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Product Image */}
            <div>
              <div className="aspect-square bg-gradient-to-br from-yellow-100 via-yellow-200 to-orange-200 rounded-2xl shadow-lg flex items-center justify-center">
                <span className="text-8xl">🧴</span>
              </div>
              
              {/* Additional Images - Placeholder */}
              <div className="flex space-x-4 mt-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                    <span className="text-2xl">🧴</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title & Campaign Badge */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                    {product.name}
                  </h1>
                  {product.is_campaign && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Kampanya
                    </span>
                  )}
                </div>
                
                {/* Category */}
                <p className="text-gray-600">
                  Kategori: <span className="font-medium">
                    {product.categories?.name || 'Genel'}
                  </span>
                </p>
              </div>

              {/* Price */}
              <div className="border-t border-b border-gray-200 py-6">
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl font-bold text-primary-600">
                    {formatPrice(currentPrice)}
                  </span>
                  {product.is_campaign && product.campaign_price && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                
                {product.is_campaign && product.campaign_price && (
                  <div className="mt-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      %{Math.round(((product.price - product.campaign_price) / product.price) * 100)} İndirim
                    </span>
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-medium">Stokta Mevcut</span>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Ürün Açıklaması</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Miktar</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="px-4 py-2 font-medium">
                      {quantity}
                    </span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      +
                    </button>
                  </div>
                  
                  {inCartQuantity > 0 && (
                    <span className="text-sm text-gray-600">
                      Sepetinizde {inCartQuantity} adet
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart */}
              <div className="pt-6">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full bg-primary-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sepete Ekleniyor...
                    </span>
                  ) : (
                    `Sepete Ekle - ${formatPrice(currentPrice * quantity)}`
                  )}
                </button>
              </div>

              {/* Product Features */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold">Ürün Özellikleri</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700">Yüksek Kalite</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700">Hızlı Teslimat</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700">Güvenli Ödeme</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700">Müşteri Desteği</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 