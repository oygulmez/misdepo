'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ordersApi, productsApi, customersApi } from '@/lib/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Settings,
  BarChart3
} from 'lucide-react'

interface DashboardStats {
  todayOrders: number
  weekOrders: number
  todayRevenue: number
  weekRevenue: number
  pendingOrders: any[]
  totalCustomers: number
  totalProducts: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [dashboardStats, products, customers] = await Promise.all([
          ordersApi.getDashboardStats(),
          productsApi.getAll({ limit: 5 }),
          customersApi.getAll()
        ])
        
        setStats({
          ...dashboardStats,
          totalCustomers: customers.length,
          totalProducts: products.length
        })
        setRecentProducts(products)
      } catch (error) {
        console.error('Dashboard loading error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount)
  }

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
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bugünkü Siparişler</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.todayOrders || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Gelir: {formatPrice(stats?.todayRevenue || 0)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Haftalık Siparişler</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.weekOrders || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Gelir: {formatPrice(stats?.weekRevenue || 0)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bekleyen Siparişler</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pendingOrders.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  İşlem bekliyor
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Aktif ürünler
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Hızlı İşlemler
              </CardTitle>
              <CardDescription>
                Sık kullanılan yönetim işlemleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button asChild className="h-20 flex-col">
                  <Link href="/admin/products">
                    <Package className="h-6 w-6 mb-2" />
                    Ürün Ekle
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/admin/orders">
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    Siparişler
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/admin/customers">
                    <Users className="h-6 w-6 mb-2" />
                    Müşteriler
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <Link href="/admin/categories">
                    <Settings className="h-6 w-6 mb-2" />
                    Kategoriler
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="orders" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders">Bekleyen Siparişler</TabsTrigger>
              <TabsTrigger value="products">Son Ürünler</TabsTrigger>
              <TabsTrigger value="analytics">İstatistikler</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Bekleyen Siparişler
                  </CardTitle>
                  <CardDescription>
                    İşlem bekleyen siparişlerin listesi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.pendingOrders && stats.pendingOrders.length > 0 ? (
                    <div className="space-y-4">
                      {stats.pendingOrders.map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <p className="font-medium">#{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-bold">{formatPrice(order.total_amount)}</p>
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Bekliyor
                            </Badge>
                          </div>
                        </div>
                      ))}
                      <Button asChild className="w-full">
                        <Link href="/admin/orders">
                          Tüm Siparişleri Görüntüle
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">Bekleyen sipariş bulunmuyor</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Son Eklenen Ürünler
                  </CardTitle>
                  <CardDescription>
                    En son eklenen ürünlerin listesi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentProducts.length > 0 ? (
                    <div className="space-y-4">
                      {recentProducts.map((product: any) => (
                        <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">Stok: {product.stock_quantity}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-bold">{formatPrice(product.price)}</p>
                            <div className="flex gap-2">
                              {product.is_featured && (
                                <Badge variant="secondary">Öne Çıkan</Badge>
                              )}
                              {product.is_campaign && (
                                <Badge variant="destructive">Kampanya</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button asChild className="w-full">
                        <Link href="/admin/products">
                          Tüm Ürünleri Yönet
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Henüz ürün eklenmemiş</p>
                      <Button asChild className="mt-4">
                        <Link href="/admin/products">
                          İlk Ürünü Ekle
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Satış Özeti
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Bugünkü Gelir</span>
                      <span className="font-bold">{formatPrice(stats?.todayRevenue || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Haftalık Gelir</span>
                      <span className="font-bold">{formatPrice(stats?.weekRevenue || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ortalama Sipariş</span>
                      <span className="font-bold">
                        {stats?.weekOrders ? formatPrice((stats.weekRevenue || 0) / stats.weekOrders) : formatPrice(0)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Sistem Durumu
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Sistem Durumu</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Çevrimiçi
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Son Güncelleme</span>
                      <span className="text-sm text-muted-foreground">Bugün</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Toplam Müşteri</span>
                      <span className="font-bold">{stats?.totalCustomers || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  } 