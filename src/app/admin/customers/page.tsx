'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ordersApi } from '@/lib/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Users,
  Search,
  Eye,
  ArrowLeft,
  ShoppingCart,
  Phone,
  MapPin,
  Calendar,
  Package
} from 'lucide-react'

interface Customer {
  customer_name: string
  customer_phone: string
  customer_address: string
  total_orders: number
  total_spent: number
  last_order_date: string
  first_order_date: string
  orders: any[]
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      // Get all orders
      const orders = await ordersApi.getAll()
      
      // Group orders by customer
      const customerMap = new Map<string, Customer>()
      
      orders.forEach(order => {
        const key = `${order.customer_name}-${order.customer_phone}`
        
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            customer_address: order.customer_address,
            total_orders: 0,
            total_spent: 0,
            last_order_date: order.created_at,
            first_order_date: order.created_at,
            orders: []
          })
        }
        
        const customer = customerMap.get(key)!
        customer.total_orders += 1
        customer.total_spent += order.total_amount
        customer.orders.push(order)
        
        // Update dates
        if (new Date(order.created_at) > new Date(customer.last_order_date)) {
          customer.last_order_date = order.created_at
        }
        if (new Date(order.created_at) < new Date(customer.first_order_date)) {
          customer.first_order_date = order.created_at
        }
      })
      
      // Convert to array and sort by total spent
      const customersArray = Array.from(customerMap.values())
        .sort((a, b) => b.total_spent - a.total_spent)
      
      setCustomers(customersArray)
    } catch (error) {
      console.error('Customers loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.customer_phone.includes(searchQuery) ||
    customer.customer_address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCustomerStats = () => {
    const totalSpent = customers.reduce((sum, customer) => sum + customer.total_spent, 0)
    const totalOrders = customers.reduce((sum, customer) => sum + customer.total_orders, 0)
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
    
    return {
      totalCustomers: customers.length,
      totalSpent,
      totalOrders,
      avgOrderValue
    }
  }

  const stats = getCustomerStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        
        {/* Toolbar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold">Müşteri Yönetimi</h3>
                <p className="text-sm text-muted-foreground">Toplam {customers.length} müşteri</p>
              </div>
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Müşteri ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Toplam Müşteri</p>
                  <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Toplam Sipariş</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Toplam Satış</p>
                  <p className="text-2xl font-bold">{formatPrice(stats.totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Ortalama Sipariş</p>
                  <p className="text-2xl font-bold">{formatPrice(stats.avgOrderValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Müşteri Listesi
            </CardTitle>
            <CardDescription>
              {filteredCustomers.length} müşteri listeleniyor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>İletişim</TableHead>
                    <TableHead>Sipariş Sayısı</TableHead>
                    <TableHead>Toplam Harcama</TableHead>
                    <TableHead>Son Sipariş</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer, index) => (
                    <TableRow key={`${customer.customer_name}-${customer.customer_phone}`}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{customer.customer_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {customer.total_orders > 5 && <Badge variant="default" className="bg-gold text-gold-foreground">VIP</Badge>}
                              {customer.total_orders <= 1 && <Badge variant="outline">Yeni</Badge>}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {customer.customer_phone}
                          </div>
                          <div className="flex items-start text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{customer.customer_address}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-bold text-lg">{customer.total_orders}</div>
                          <div className="text-xs text-muted-foreground">sipariş</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-primary">
                          {formatPrice(customer.total_spent)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Ort: {formatPrice(customer.total_spent / customer.total_orders)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(customer.last_order_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setShowDetailModal(true)
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'Arama kriterlerine uygun müşteri bulunamadı' : 'Henüz müşteri bulunmuyor'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Müşteri Detayı - {selectedCustomer?.customer_name}
            </DialogTitle>
            <DialogDescription>
              Müşteri bilgileri ve sipariş geçmişi
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">İletişim Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Ad Soyad</div>
                      <div className="font-medium">{selectedCustomer.customer_name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Telefon</div>
                      <div className="font-medium">{selectedCustomer.customer_phone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Adres</div>
                      <div className="font-medium">{selectedCustomer.customer_address}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sipariş İstatistikleri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Toplam Sipariş</div>
                      <div className="font-bold text-2xl">{selectedCustomer.total_orders}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Toplam Harcama</div>
                      <div className="font-bold text-2xl text-primary">
                        {formatPrice(selectedCustomer.total_spent)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Ortalama Sipariş Tutarı</div>
                      <div className="font-medium">
                        {formatPrice(selectedCustomer.total_spent / selectedCustomer.total_orders)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">İlk Sipariş</div>
                        <div className="font-medium">{formatDate(selectedCustomer.first_order_date)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Son Sipariş</div>
                        <div className="font-medium">{formatDate(selectedCustomer.last_order_date)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Orders History */}
              <Card>
                <CardHeader>
                  <CardTitle>Sipariş Geçmişi</CardTitle>
                  <CardDescription>
                    Son {selectedCustomer.orders.length} sipariş
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sipariş No</TableHead>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Tutar</TableHead>
                        <TableHead>Durum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCustomer.orders
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, 10)
                        .map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.order_number}</TableCell>
                          <TableCell>{formatDate(order.created_at)}</TableCell>
                          <TableCell>{formatPrice(order.total_amount)}</TableCell>
                          <TableCell>
                            <Badge variant={order.status === 'delivered' ? 'default' : 'outline'}>
                              {order.status === 'pending' && 'Beklemede'}
                              {order.status === 'confirmed' && 'Onaylandı'}
                              {order.status === 'preparing' && 'Hazırlanıyor'}
                              {order.status === 'shipped' && 'Kargoda'}
                              {order.status === 'delivered' && 'Teslim Edildi'}
                              {order.status === 'cancelled' && 'İptal'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 