'use client'

import { useEffect, useState } from 'react'
import { categoriesApi, productsApi } from '@/lib/database'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { LoadingCard } from '@/components/LoadingSpinner'

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Cart hooks
  const { cart, addToCart, formatPrice } = useCart()
  const { success } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        // Load categories
        const categoriesData = await categoriesApi.getAll()
        setCategories(categoriesData)

        // Load products
        const productsData = await productsApi.getAll({
          is_active: true,
          limit: 4
        })
        setFeaturedProducts(productsData)

      } catch (error) {
        console.error('Data loading error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-mobile sm:container-tablet lg:container-desktop py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">
                Temizlik & Ambalaj
              </h1>
            </div>
            
            {/* Mobile Menu & Cart */}
            <div className="flex items-center space-x-4">
              <a href="/cart" className="p-2 hover:bg-gray-100 rounded-lg relative">
                <span className="text-xl">🛒</span>
                {cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-primary-500 text-white rounded-full px-2 py-1 min-w-[20px] text-center">
                    {cart.totalItems}
                  </span>
                )}
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
          <div className="container-mobile sm:container-tablet lg:container-desktop text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Kaliteli Temizlik ve Ambalaj Ürünleri
            </h2>
            <p className="text-lg sm:text-xl mb-6 opacity-90">
              Eviniz ve işiniz için ihtiyacınız olan her şey burada!
            </p>
            <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Ürünleri İncele
            </button>
          </div>
        </section>

        {/* Kategoriler */}
        <section className="py-12">
          <div className="container-mobile sm:container-tablet lg:container-desktop">
            <h3 className="text-2xl font-bold mb-8 text-center">Ürün Kategorileri</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => {
                const icons = ['🧽', '📦', '🏠']
                const gradients = [
                  'from-blue-100 to-blue-200',
                  'from-green-100 to-green-200', 
                  'from-purple-100 to-purple-200'
                ]
                
                return (
                  <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className={`h-48 bg-gradient-to-br ${gradients[index]} flex items-center justify-center`}>
                      <span className="text-4xl">{icons[index]}</span>
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-semibold mb-2">{category.name}</h4>
                      <p className="text-gray-600 mb-4">{category.description}</p>
                      <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors">
                        İncele
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Öne Çıkan Ürünler */}
        <section className="py-12 bg-gray-100">
          <div className="container-mobile sm:container-tablet lg:container-desktop">
            <h3 className="text-2xl font-bold mb-8 text-center">
              {featuredProducts.length > 0 ? 'Öne Çıkan Ürünler' : 'Ürünlerimiz'}
            </h3>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <a href={`/product/${product.id}`} className="block">
                      <div className="h-40 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center hover:scale-105 transition-transform">
                        <span className="text-3xl">🧴</span>
                      </div>
                    </a>
                    <div className="p-4">
                      <a href={`/product/${product.id}`}>
                        <h5 className="font-semibold mb-2 hover:text-primary-600 transition-colors">{product.name}</h5>
                      </a>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center space-x-2 mb-3">
                        {product.campaign_price ? (
                          <>
                            <span className="text-lg font-bold text-primary-600">₺{product.campaign_price}</span>
                            <span className="text-sm text-gray-500 line-through">₺{product.price}</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-primary-600">₺{product.price}</span>
                        )}
                      </div>
                      <button 
                        onClick={(event) => {
                          addToCart(product)
                          success('Sepete Eklendi!', `${product.name} sepetinize eklendi`)
                          
                          // Simple animation feedback
                          const button = event?.target as HTMLButtonElement
                          if (button) {
                            button.textContent = '✓ Eklendi!'
                            button.classList.add('bg-green-600', 'hover:bg-green-700')
                            button.classList.remove('bg-secondary-600', 'hover:bg-secondary-700')
                            setTimeout(() => {
                              button.textContent = 'Sepete Ekle'
                              button.classList.remove('bg-green-600', 'hover:bg-green-700')
                              button.classList.add('bg-secondary-600', 'hover:bg-secondary-700')
                            }, 1500)
                          }
                        }}
                        className="w-full bg-secondary-600 text-white py-2 rounded-lg hover:bg-secondary-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
                      >
                        Sepete Ekle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Henüz ürün eklenmemiş.</p>
                <a 
                  href="/test-db" 
                  className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Database Test Et
                </a>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container-mobile sm:container-tablet lg:container-desktop">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-4">İletişim</h4>
              <p className="text-gray-300">📞 0555 123 45 67</p>
              <p className="text-gray-300">📧 info@temizlikambalaj.com</p>
              <p className="text-gray-300">📍 İstanbul, Türkiye</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Hızlı Menü</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Ana Sayfa</a></li>
                <li><a href="#" className="hover:text-white">Ürünler</a></li>
                <li><a href="/test-db" className="hover:text-white">Test</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Ödeme Yöntemleri</h4>
              <p className="text-gray-300">• Kapıda Ödeme</p>
              <p className="text-gray-300">• Havale/EFT</p>
              <p className="text-gray-300">• Kredi Kartı</p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; 2024 Temizlik & Ambalaj E-Ticaret. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 