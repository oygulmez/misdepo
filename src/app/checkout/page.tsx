'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import Link from 'next/link'
import { customersApi, ordersApi } from '@/lib/database'
import LoadingSpinner from '@/components/LoadingSpinner'

interface OrderForm {
  customerName: string
  customerPhone: string
  customerAddress: string
  paymentMethod: 'cash_on_delivery' | 'bank_transfer' | 'credit_card'
  notes: string
}

export default function CheckoutPage() {
  const { cart, clearCart, formatPrice } = useCart()
  const router = useRouter()
  const { success, error: showError } = useToast()
  
  const [form, setForm] = useState<OrderForm>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'cash_on_delivery',
    notes: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Redirect if cart is empty
  if (cart.totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-mobile sm:container-tablet lg:container-desktop">
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📦</div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">
              Sepetiniz Boş
            </h1>
            <p className="text-gray-600 mb-8">
              Sipariş verebilmek için önce sepetinize ürün eklemelisiniz.
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!form.customerName.trim()) {
      newErrors.customerName = 'Ad Soyad zorunludur'
    }
    if (!form.customerPhone.trim()) {
      newErrors.customerPhone = 'Telefon numarası zorunludur'
    }
    if (!form.customerAddress.trim()) {
      newErrors.customerAddress = 'Adres zorunludur'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setLoading(true)
    
    try {
      // Create or get customer
      let customer = await customersApi.getByPhone(form.customerPhone)
      
      if (!customer) {
        customer = await customersApi.create({
          name: form.customerName,
          phone: form.customerPhone,
          address: form.customerAddress
        })
      }
      
      // Create order
      const order = await ordersApi.create(
        {
          customer_id: customer.id,
          customer_name: form.customerName,
          customer_phone: form.customerPhone,
          customer_address: form.customerAddress,
          payment_method: form.paymentMethod,
          total_amount: cart.totalAmount,
          subtotal: cart.totalAmount,
          notes: form.notes || null
        },
        cart.items.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_price: item.product.is_campaign && item.product.campaign_price
            ? item.product.campaign_price
            : item.product.price,
          quantity: item.quantity,
          total_price: (item.product.is_campaign && item.product.campaign_price
            ? item.product.campaign_price
            : item.product.price) * item.quantity
        }))
      )
      
      // Clear cart and redirect
      clearCart()
      router.push(`/order-success?id=${order.id}`)
      
    } catch (error) {
      console.error('Order creation error:', error)
      showError('Sipariş Hatası', 'Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof OrderForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
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
            <h1 className="text-lg font-semibold">Sipariş Ver</h1>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="container-mobile sm:container-tablet lg:container-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Order Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Sipariş Bilgileri</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      value={form.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.customerName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Adınızı ve soyadınızı girin"
                    />
                    {errors.customerName && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                    )}
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon Numarası *
                    </label>
                    <input
                      type="tel"
                      value={form.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.customerPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0555 123 45 67"
                    />
                    {errors.customerPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
                    )}
                  </div>

                  {/* Customer Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teslimat Adresi *
                    </label>
                    <textarea
                      value={form.customerAddress}
                      onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.customerAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Mahalle, Sokak, Kapı No, İlçe, İl..."
                    />
                    {errors.customerAddress && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerAddress}</p>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Ödeme Yöntemi *
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash_on_delivery"
                          checked={form.paymentMethod === 'cash_on_delivery'}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value as any)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-3">💵 Kapıda Ödeme</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank_transfer"
                          checked={form.paymentMethod === 'bank_transfer'}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value as any)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-3">🏦 Havale/EFT</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit_card"
                          checked={form.paymentMethod === 'credit_card'}
                          onChange={(e) => handleInputChange('paymentMethod', e.target.value as any)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-3">💳 Kredi Kartı</span>
                      </label>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sipariş Notu (Opsiyonel)
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Özel istekleriniz varsa belirtebilirsiniz..."
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-xl font-semibold mb-4">Sipariş Özeti</h3>
                
                {/* Cart Items */}
                <div className="space-y-3 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">🧴</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} adet × {formatPrice(
                            item.product.is_campaign && item.product.campaign_price
                              ? item.product.campaign_price
                              : item.product.price
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
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

                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sipariş Veriliyor...' : 'Sipariş Onayla'}
                </button>

                <Link
                  href="/cart"
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center block mt-3"
                >
                  ← Sepete Dön
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 