'use client'

import { useEffect, useState } from 'react'
import { ordersApi } from '@/lib/database'
import { useToast } from '@/context/ToastContext'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_address: string
  payment_method: string
  status: string
  total_amount: number
  subtotal: number
  notes?: string
  admin_notes?: string
  created_at: string
  updated_at: string
  order_items?: any[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusUpdate, setStatusUpdate] = useState<{orderId: string, status: string, notes: string}>({
    orderId: '',
    status: '',
    notes: ''
  })
  const [showStatusModal, setShowStatusModal] = useState(false)
  const { success, error: showError } = useToast()

  useEffect(() => {
    loadOrders()
  }, [filter])

  const loadOrders = async () => {
    try {
      const data = await ordersApi.getAll(
        filter !== 'all' ? { status: filter } : {}
      )
      setOrders(data)
    } catch (error) {
      console.error('Orders loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!statusUpdate.orderId || !statusUpdate.status) return

    try {
      setLoading(true)
      await ordersApi.updateStatus(
        statusUpdate.orderId,
        statusUpdate.status,
        statusUpdate.notes || undefined
      )
      
      // Reload orders
      await loadOrders()
      
      // Close modal
      setShowStatusModal(false)
      setStatusUpdate({ orderId: '', status: '', notes: '' })
      
      success('Başarılı!', 'Sipariş durumu başarıyla güncellendi')
    } catch (error) {
      console.error('Status update error:', error)
      showError('Hata!', 'Durum güncellenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (amount: number) => `₺${amount.toFixed(2)}`
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-orange-100 text-orange-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash_on_delivery': return 'Kapıda Ödeme'
      case 'bank_transfer': return 'Havale/EFT'
      case 'credit_card': return 'Kredi Kartı'
      default: return method
    }
  }

  const statusOptions = [
    { value: 'pending', label: 'Beklemede' },
    { value: 'confirmed', label: 'Onaylandı' },
    { value: 'preparing', label: 'Hazırlanıyor' },
    { value: 'shipped', label: 'Kargoya Verildi' },
    { value: 'delivered', label: 'Teslim Edildi' },
    { value: 'cancelled', label: 'İptal Edildi' }
  ]

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Siparişler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Siparişler</h1>
          <p className="text-gray-600 mt-2">
            Toplam {orders.length} sipariş
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tümü ({orders.length})
          </button>
          {statusOptions.map((status) => {
            const count = orders.filter(order => order.status === status.value).length
            return (
              <button
                key={status.value}
                onClick={() => setFilter(status.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sipariş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ödeme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.order_number}
                      </div>
                      {order.notes && (
                        <div className="text-xs text-gray-500 mt-1">
                          📝 Not var
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.customer_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customer_phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(order.total_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getPaymentMethodText(order.payment_method)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-primary-600 hover:text-primary-800 font-medium"
                        >
                          Detay
                        </button>
                        <button
                          onClick={() => {
                            setStatusUpdate({
                              orderId: order.id,
                              status: order.status,
                              notes: order.admin_notes || ''
                            })
                            setShowStatusModal(true)
                          }}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Durum
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            {filter === 'all' ? 'Henüz sipariş bulunmuyor.' : `Bu durumda sipariş bulunmuyor.`}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedOrder(null)}></div>
            
            <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Sipariş Detayı - {selectedOrder.order_number}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Müşteri Bilgileri</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Ad Soyad:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>Telefon:</strong> {selectedOrder.customer_phone}</p>
                    <p><strong>Adres:</strong> {selectedOrder.customer_address}</p>
                  </div>
                </div>

                {/* Order Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Sipariş Bilgileri</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Sipariş No:</strong> {selectedOrder.order_number}</p>
                    <p><strong>Durum:</strong> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </p>
                    <p><strong>Ödeme:</strong> {getPaymentMethodText(selectedOrder.payment_method)}</p>
                    <p><strong>Tarih:</strong> {formatDate(selectedOrder.created_at)}</p>
                    <p><strong>Toplam:</strong> {formatPrice(selectedOrder.total_amount)}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {(selectedOrder.notes || selectedOrder.admin_notes) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Notlar</h3>
                  {selectedOrder.notes && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-3">
                      <p className="text-sm font-medium text-blue-800 mb-1">Müşteri Notu:</p>
                      <p className="text-blue-700">{selectedOrder.notes}</p>
                    </div>
                  )}
                  {selectedOrder.admin_notes && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-1">Admin Notu:</p>
                      <p className="text-green-700">{selectedOrder.admin_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Order Items */}
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Sipariş Ürünleri</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fiyat</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Adet</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.order_items.map((item: any) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.product_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(item.product_price)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(item.total_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowStatusModal(false)}></div>
            
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Sipariş Durumu Güncelle</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Durum
                  </label>
                  <select
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notu (Opsiyonel)
                  </label>
                  <textarea
                    value={statusUpdate.notes}
                    onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Durum değişikliği hakkında not..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleStatusUpdate}
                    disabled={loading}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Güncelleniyor...' : 'Güncelle'}
                  </button>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 