'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ordersApi, productsApi } from '@/lib/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { 
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderOpen,
  Users,
  Settings,
  Home,
  Menu,
  Bell,
  User,
  LogOut,
  Calendar
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const [stats, setStats] = useState({
    todayOrders: 0,
    weekRevenue: 0,
    totalProducts: 0
  })

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin', 
      icon: LayoutDashboard,
      description: 'Genel bakış ve istatistikler'
    },
    { 
      name: 'Siparişler', 
      href: '/admin/orders', 
      icon: Package,
      description: 'Sipariş yönetimi ve takibi'
    },
    { 
      name: 'Ürünler', 
      href: '/admin/products', 
      icon: ShoppingCart,
      description: 'Ürün kataloğu yönetimi'
    },
    { 
      name: 'Kategoriler', 
      href: '/admin/categories', 
      icon: FolderOpen,
      description: 'Kategori düzenleme'
    },
    { 
      name: 'Müşteriler', 
      href: '/admin/customers', 
      icon: Users,
      description: 'Müşteri bilgileri ve analizi'
    },
    { 
      name: 'Ayarlar', 
      href: '/admin/settings', 
      icon: Settings,
      description: 'Sistem ayarları'
    },
  ]

  // İstatistikleri yükle
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [dashboardStats, products] = await Promise.all([
          ordersApi.getDashboardStats(),
          productsApi.getAll({ is_active: true })
        ])
        
        setStats({
          todayOrders: dashboardStats.todayOrders,
          weekRevenue: dashboardStats.weekRevenue,
          totalProducts: products.length
        })
      } catch (error) {
        console.error('Stats yükleme hatası:', error)
      }
    }

    loadStats()
  }, [])

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const SidebarContent = () => (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      {/* Sidebar Header */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Temizlik & Ambalaj</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-1 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground group-hover:text-accent-foreground/70">
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        <Separator className="my-4 mx-4" />

        {/* Quick Stats */}
        <div className="px-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Hızlı Bakış
          </h4>
          <div className="space-y-2">
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Bugün</p>
                  <p className="text-sm font-medium">{stats.todayOrders} Sipariş</p>
                </div>
                <Badge variant="secondary">Canlı</Badge>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Bu Hafta</p>
                  <p className="text-sm font-medium">{formatPrice(stats.weekRevenue)}</p>
                </div>
                <Badge variant="default">Gelir</Badge>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Toplam</p>
                  <p className="text-sm font-medium">{stats.totalProducts} Ürün</p>
                </div>
                <Badge variant="outline">Aktif</Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@example.com</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          asChild
        >
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Ana Siteye Dön
          </Link>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
            {/* Mobile menu button - moved to header */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl font-semibold">
                    {navigation.find(item => item.href === pathname)?.name || 'Yönetim Paneli'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {navigation.find(item => item.href === pathname)?.description || 'Admin paneli ana sayfası'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString('tr-TR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  3
                </Badge>
              </Button>
              
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Ana Site
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
} 