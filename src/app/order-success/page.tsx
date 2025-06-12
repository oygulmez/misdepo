'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ordersApi } from '@/lib/database'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false)
        return
      }

      try {
        const orderData = await ordersApi.getById(orderId)
        setOrder(orderData)
      } catch (error) {
        console.error('Error loading order:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sipariş bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-mobile sm:container-tablet lg:container-desktop">
          <div className="text-center py-16">
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">
              Sipariş Bulunamadı
            </h1>
            <p className="text-gray-600 mb-8">
              Aradığınız sipariş bulunamadı veya silinmiş olabilir.
            </p>
            <Link 
              href="/"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatPrice = (amount: number) => `₺${amount.toFixed(2)}`
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash_on_delivery': return '💵 Kapıda Ödeme'
      case 'bank_transfer': return '🏦 Havale/EFT'
      case 'credit_card': return '💳 Kredi Kartı'
      default: return method
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Beklemede'
      case 'confirmed': return 'Onaylandı'
      case 'preparing': return 'Hazırlanıyor'
      case 'shipped': return 'Kargoya Verildi'
      case 'delivered': return 'Teslim Edildi'
      case 'cancelled': return 'İptal Edildi'
      default: return status
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
            <h1 className="text-lg font-semibold">Sipariş Onayı</h1>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="container-mobile sm:container-tablet lg:container-desktop">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="text-4xl mr-4">✅</div>
              <div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">
                  Siparişiniz Başarıyla Alındı!
                </h2>
                <p className="text-green-700">
                  Sipariş numaranız: <strong>{order.order_number}</strong>
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Siparişiniz {formatDate(order.created_at)} tarihinde oluşturuldu.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Sipariş Detayları</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Sipariş Numarası</label>
                  <p className="text-lg font-semibold">{order.order_number}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Durum</label>
                  <p className="text-lg">
                    <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      {getStatusText(order.status)}
                    </span>
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Ödeme Yöntemi</label>
                  <p className="text-lg">{getPaymentMethodText(order.payment_method)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Toplam Tutar</label>
                  <p className="text-2xl font-bold text-primary-600">
                    {formatPrice(order.total_amount)}
                  </p>
                </div>
                
                {order.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sipariş Notu</label>
                    <p className="text-gray-700">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer & Delivery Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Müşteri ve Teslimat Bilgileri</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ad Soyad</label>
                  <p className="text-lg">{order.customer_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefon</label>
                  <p className="text-lg">{order.customer_phone}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Teslimat Adresi</label>
                  <p className="text-gray-700 whitespace-pre-wrap">{order.customer_address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md mt-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">Sipariş Edilen Ürünler</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🧴</span>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {item.product_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.quantity} adet × {formatPrice(item.product_price)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(item.total_price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Toplam:</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Sıradaki Adımlar</h3>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Siparişiniz en kısa sürede hazırlanacak ve size ulaştırılacaktır.
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Sipariş durumu değiştiğinde size bilgi verilecektir.
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Herhangi bir sorunuz için {order.customer_phone} numarasından bize ulaşabilirsiniz.
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="text-center mt-8 space-y-4">
            <Link
              href="/"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Alışverişe Devam Et
            </Link>
            
            <div className="text-sm text-gray-500">
              Bu sayfayı kaydedebilir veya sipariş numaranızı not alabilirsiniz.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 