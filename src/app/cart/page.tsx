'use client'

import { useCart } from '@/context/CartContext'
import Link from 'next/link'

export default function CartPage() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    formatPrice 
  } = useCart()

  if (cart.totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-mobile sm:container-tablet lg:container-desktop">
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">
              Sepetiniz Boş
            </h1>
            <p className="text-gray-600 mb-8">
              Henüz sepetinize ürün eklememişsiniz. Alışverişe başlamak için ürünlerimizi inceleyin.
            </p>
            <Link 
              href="/"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-mobile sm:container-tablet lg:container-desktop py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-primary-600">
              Temizlik & Ambalaj
            </Link>
            <h1 className="text-lg font-semibold">Sepetim</h1>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="container-mobile sm:container-tablet lg:container-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      Sepetinizdeki Ürünler ({cart.totalItems})
                    </h2>
                    <button
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Sepeti Temizle
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">🧴</span>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {item.product.description}
                          </p>
                          
                          {/* Price */}
                          <div className="flex items-center space-x-2 mb-3">
                            {item.product.is_campaign && item.product.campaign_price ? (
                              <>
                                <span className="text-lg font-bold text-primary-600">
                                  {formatPrice(item.product.campaign_price)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(item.product.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-primary-600">
                                {formatPrice(item.product.price)}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-3 py-1 hover:bg-gray-100 text-gray-600"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="px-4 py-1 border-l border-r border-gray-300">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-1 hover:bg-gray-100 text-gray-600"
                              >
                                +
                              </button>
                            </div>
                            
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Kaldır
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(
                              (item.product.is_campaign && item.product.campaign_price 
                                ? item.product.campaign_price 
                                : item.product.price) * item.quantity
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-xl font-semibold mb-4">Sipariş Özeti</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ürün Toplamı:</span>
                    <span className="font-medium">{formatPrice(cart.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kargo:</span>
                    <span className="font-medium text-green-600">Ücretsiz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">KDV:</span>
                    <span className="font-medium">Dahil</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Toplam:</span>
                      <span className="text-xl font-bold text-primary-600">
                        {formatPrice(cart.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center block"
                >
                  Sipariş Ver
                </Link>

                <Link
                  href="/"
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center block mt-3"
                >
                  Alışverişe Devam Et
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 