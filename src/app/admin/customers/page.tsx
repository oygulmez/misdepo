'use client'

import { useEffect, useState } from 'react'
import { customersApi, ordersApi } from '@/lib/database'
import { useToast } from '@/context/ToastContext'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  address: string
  notes: string | null
  total_orders: number
  total_spent: number
  created_at: string
  updated_at: string
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerOrders, setCustomerOrders] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const { success, error: showError } = useToast()

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll()
      setCustomers(data)
    } catch (error) {
      console.error('Customers loading error:', error)
      showError('Hata!', 'Müşteriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadCustomerOrders = async (customerId: string) => {
    try {
      // Get all orders and filter by customer_id
      const allOrders = await ordersApi.getAll()
      const customerOrders = allOrders.filter(order => order.customer_id === customerId)
      setCustomerOrders(customerOrders)
    } catch (error) {
      console.error('Customer orders loading error:', error)
      showError('Hata!', 'Müşteri siparişleri yüklenirken hata oluştu')
    }
  }

  const handleCustomerClick = async (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowModal(true)
    await loadCustomerOrders(customer.id)
  }

  const formatPrice = (amount: number) => `₺${amount.toFixed(2)}`
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Müşteriler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Müşteriler</h1>
          <p className="text-gray-600 mt-2">
            Toplam {customers.length} müşteri
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Toplam Müşteri
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">🛒</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Aktif Müşteri
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => c.total_orders > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                Ortalama Harcama
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(
                  customers.length > 0 
                    ? customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.length
                    : 0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İletişim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sipariş Sayısı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Harcama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Sipariş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {customer.address}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.total_orders} sipariş
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(customer.total_spent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.total_orders > 0 
                          ? 'Sipariş var'
                          : 'Henüz sipariş yok'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(customer.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleCustomerClick(customer)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Detay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz müşteri yok
            </h3>
            <p className="text-gray-500">
              İlk sipariş verildiğinde müşteriler burada görünecek.
            </p>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Müşteri Detayları
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Müşteri Bilgileri
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Ad Soyad:</span>
                      <p className="text-gray-900">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Telefon:</span>
                      <p className="text-gray-900">{selectedCustomer.phone}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Adres:</span>
                      <p className="text-gray-900">{selectedCustomer.address}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Kayıt Tarihi:</span>
                      <p className="text-gray-900">{formatDate(selectedCustomer.created_at)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    İstatistikler
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Toplam Sipariş:</span>
                      <p className="text-gray-900">{selectedCustomer.total_orders} adet</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Toplam Harcama:</span>
                      <p className="text-gray-900">{formatPrice(selectedCustomer.total_spent)}</p>
                    </div>
                                         <div>
                       <span className="text-sm font-medium text-gray-500">Son Sipariş:</span>
                       <p className="text-gray-900">
                         {selectedCustomer.total_orders > 0 
                           ? 'Sipariş geçmişi var'
                           : 'Henüz sipariş yok'
                         }
                       </p>
                     </div>
                  </div>
                </div>
              </div>

              {/* Customer Orders */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Siparişler ({customerOrders.length})
                </h3>
                
                {customerOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Sipariş No
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Tutar
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Durum
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Tarih
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {customerOrders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              #{order.order_number}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {formatPrice(order.total_amount)}
                            </td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {formatDate(order.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Bu müşterinin henüz siparişi bulunmuyor.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 