'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ordersApi } from '@/lib/database'
import { useToast } from '@/context/ToastContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ShoppingCart, 
  Eye, 
  Edit, 
  Clock, 
  CheckCircle, 
  XCircle,
  Package,
  Truck,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  ArrowLeft
} from 'lucide-react'

interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  products?: {
    id: string
    name: string
  }
}

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
  order_items?: OrderItem[]
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
  const [showDetailModal, setShowDetailModal] = useState(false)
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
      
      await loadOrders()
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': 
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Beklemede</Badge>
      case 'confirmed': 
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Onaylandı</Badge>
      case 'preparing': 
        return <Badge variant="outline"><Package className="h-3 w-3 mr-1" />Hazırlanıyor</Badge>
      case 'shipped': 
        return <Badge variant="default"><Truck className="h-3 w-3 mr-1" />Kargoda</Badge>
      case 'delivered': 
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Teslim Edildi</Badge>
      case 'cancelled': 
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />İptal</Badge>
      default: 
        return <Badge variant="outline">{status}</Badge>
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

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    }
  }

  const stats = getOrderStats()

  if (loading && orders.length === 0) {
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
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Sipariş Yönetimi</h3>
                <p className="text-sm text-muted-foreground">Toplam {orders.length} sipariş</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Toplam</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Beklemede</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
                <div className="text-sm text-muted-foreground">Onaylandı</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.preparing}</div>
                <div className="text-sm text-muted-foreground">Hazırlanıyor</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
                <div className="text-sm text-muted-foreground">Kargoda</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                <div className="text-sm text-muted-foreground">Teslim</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                <div className="text-sm text-muted-foreground">İptal</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtreler</CardTitle>
            <CardDescription>Siparişleri durumlarına göre filtreleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={setFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all">Tümü</TabsTrigger>
                <TabsTrigger value="pending">Beklemede</TabsTrigger>
                <TabsTrigger value="confirmed">Onaylandı</TabsTrigger>
                <TabsTrigger value="preparing">Hazırlanıyor</TabsTrigger>
                <TabsTrigger value="shipped">Kargoda</TabsTrigger>
                <TabsTrigger value="delivered">Teslim</TabsTrigger>
                <TabsTrigger value="cancelled">İptal</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Sipariş Listesi
            </CardTitle>
            <CardDescription>
              {filter === 'all' ? 'Tüm siparişler' : `${statusOptions.find(s => s.value === filter)?.label} siparişler`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sipariş No</TableHead>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Ürünler</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Ödeme</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.order_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {order.customer_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {order.order_items && order.order_items.length > 0 ? (
                            <div>
                              <div className="font-medium text-primary">
                                {order.order_items.length} ürün
                              </div>
                              <div className="text-muted-foreground">
                                                                 {order.order_items.reduce((total: number, item: OrderItem) => total + item.quantity, 0)} adet
                              </div>
                            </div>
                          ) : (
                            <div className="text-muted-foreground">-</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(order.total_amount)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {getPaymentMethodText(order.payment_method)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(order.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowDetailModal(true)
                            }}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setStatusUpdate({
                                orderId: order.id,
                                status: order.status,
                                notes: order.admin_notes || ''
                              })
                              setShowStatusModal(true)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Sipariş bulunamadı</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Sipariş Detayı #{selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription>
              Sipariş detayları ve müşteri bilgileri
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              
              {/* Müşteri ve Sipariş Bilgileri */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Sol Kolon - Müşteri Bilgileri */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">MÜŞTERİ BİLGİLERİ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {selectedOrder.customer_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{selectedOrder.customer_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {selectedOrder.customer_phone}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="text-sm">{selectedOrder.customer_address}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sağ Kolon - Sipariş Bilgileri */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">SİPARİŞ BİLGİLERİ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Durum:</span>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ödeme:</span>
                      <div className="flex items-center text-sm">
                        <CreditCard className="h-3 w-3 mr-1" />
                        {getPaymentMethodText(selectedOrder.payment_method)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tarih:</span>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(selectedOrder.created_at)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-medium">Toplam:</span>
                      <span className="font-bold text-lg text-primary">
                        {formatPrice(selectedOrder.total_amount)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notlar */}
              {(selectedOrder.notes || selectedOrder.admin_notes) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {selectedOrder.notes && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">MÜŞTERİ NOTU</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{selectedOrder.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {selectedOrder.admin_notes && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">ADMİN NOTU</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{selectedOrder.admin_notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Sipariş Ürünleri */}
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      SİPARİŞ EDİLEN ÜRÜNLER ({selectedOrder.order_items.length} ürün)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    
                    {/* Desktop Tablo */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Ürün</TableHead>
                            <TableHead className="text-center w-20">Adet</TableHead>
                            <TableHead className="text-right w-24">Birim Fiyat</TableHead>
                            <TableHead className="text-right w-24">Toplam</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedOrder.order_items.map((item: OrderItem, index: number) => {
                            const unitPrice = Number(item.unit_price) || 0
                            const quantity = Number(item.quantity) || 0
                            const total = unitPrice * quantity
                            
                            return (
                              <TableRow key={index}>
                                <TableCell>
                                  <div className="font-medium">
                                    {item.products?.name || item.product_name || 'Ürün Adı Bulunamadı'}
                                  </div>
                                  {item.product_id && (
                                    <div className="text-xs text-muted-foreground">
                                      ID: {item.product_id}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-center font-medium">
                                  {quantity}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatPrice(unitPrice)}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatPrice(total)}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Kartlar */}
                    <div className="md:hidden space-y-3 p-4">
                      {selectedOrder.order_items.map((item: OrderItem, index: number) => {
                        const unitPrice = Number(item.unit_price) || 0
                        const quantity = Number(item.quantity) || 0
                        const total = unitPrice * quantity
                        
                        return (
                          <div key={index} className="border rounded-lg p-3 space-y-2">
                            <div className="font-medium">
                              {item.products?.name || item.product_name || 'Ürün Adı Bulunamadı'}
                            </div>
                            {item.product_id && (
                              <div className="text-xs text-muted-foreground">
                                ID: {item.product_id}
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span>Adet: <span className="font-medium">{quantity}</span></span>
                              <span>Birim: <span className="font-medium">{formatPrice(unitPrice)}</span></span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t">
                              <span className="text-sm font-medium">Toplam:</span>
                              <span className="font-bold text-primary">{formatPrice(total)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Sipariş Özeti */}
                    <div className="border-t bg-muted/20 p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Ara Toplam:</span>
                        <span>{formatPrice(selectedOrder.subtotal || selectedOrder.total_amount)}</span>
                      </div>
                      {selectedOrder.subtotal && selectedOrder.subtotal !== selectedOrder.total_amount && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>KDV (%18):</span>
                            <span>{formatPrice(selectedOrder.total_amount - selectedOrder.subtotal)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-base border-t pt-2">
                            <span>Genel Toplam:</span>
                            <span className="text-primary">{formatPrice(selectedOrder.total_amount)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sipariş Durumu Güncelle</DialogTitle>
            <DialogDescription>
              Siparişin durumunu değiştirin ve isteğe bağlı not ekleyin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Yeni Durum</Label>
              <Select value={statusUpdate.status} onValueChange={(value) => 
                setStatusUpdate(prev => ({ ...prev, status: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Admin Notu (Opsiyonel)</Label>
              <Textarea
                value={statusUpdate.notes}
                onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Durum değişikliği hakkında not..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              İptal
            </Button>
            <Button onClick={handleStatusUpdate} disabled={loading}>
              {loading ? 'Güncelleniyor...' : 'Güncelle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 