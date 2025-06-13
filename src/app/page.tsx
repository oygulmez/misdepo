'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { productsApi, categoriesApi } from '@/lib/database'
import { Product, Category } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShoppingCart, Search, Star, Package, Truck, Shield, Clock } from 'lucide-react'

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100)
}

function getProductUrl(product: Product): string {
  const slug = createSlug(product.name)
  return `/urun/${slug}`
}

export default function HomePage() {
  const { addToCart, formatPrice } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    Promise.all([
      productsApi.getAll({ is_active: true }),
      categoriesApi.getAll()
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData)
      setCategories(categoriesData.filter(cat => cat.is_active))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredProducts = products.filter(p => p.is_featured)
  const campaignProducts = products.filter(p => p.is_campaign)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              Temizlik & Ambalaj
            </Link>
            
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/cart">
                <Button variant="outline" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Sepet
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Kaliteli Temizlik &<br />
            <span className="text-primary">Ambalaj Ürünleri</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            En uygun fiyatlarla kaliteli ürünler. Hızlı teslimat, güvenli ödeme seçenekleri.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="#products">Ürünleri İncele</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">İletişim</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Hızlı Teslimat</h3>
              <p className="text-sm text-muted-foreground">Aynı gün kargo</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Güvenli Ödeme</h3>
              <p className="text-sm text-muted-foreground">SSL korumalı</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Kaliteli Ürünler</h3>
              <p className="text-sm text-muted-foreground">Orijinal markalar</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">7/24 Destek</h3>
              <p className="text-sm text-muted-foreground">Müşteri hizmetleri</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Ürünlerimiz</h2>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-8">
              <TabsTrigger 
                value="all" 
                onClick={() => setSelectedCategory('all')}
              >
                Tümü
              </TabsTrigger>
              {categories.slice(0, 3).map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name.length > 8 ? category.name.substring(0, 8) + '...' : category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {/* Featured Products */}
              {featuredProducts.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    Öne Çıkan Ürünler
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProducts.slice(0, 4).map(product => (
                      <ProductCard key={product.id} product={product} addToCart={addToCart} formatPrice={formatPrice} />
                    ))}
                  </div>
                </div>
              )}

              {/* Campaign Products */}
              {campaignProducts.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-red-600">🔥 Kampanyalı Ürünler</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {campaignProducts.slice(0, 4).map(product => (
                      <ProductCard key={product.id} product={product} addToCart={addToCart} formatPrice={formatPrice} />
                    ))}
                  </div>
                </div>
              )}

              {/* All Products */}
              <div>
                <h3 className="text-2xl font-semibold mb-6">Tüm Ürünler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} addToCart={addToCart} formatPrice={formatPrice} />
                  ))}
                </div>
              </div>
            </TabsContent>

            {categories.map(category => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.filter(p => p.category_id === category.id).map(product => (
                    <ProductCard key={product.id} product={product} addToCart={addToCart} formatPrice={formatPrice} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Temizlik & Ambalaj</h3>
              <p className="text-muted-foreground text-sm">
                Kaliteli temizlik ürünleri ve ambalaj malzemeleri için güvenilir adresiniz.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hızlı Linkler</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-muted-foreground hover:text-foreground">Ana Sayfa</Link></li>
                <li><Link href="/products" className="text-muted-foreground hover:text-foreground">Ürünler</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground">Hakkımızda</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">İletişim</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kategoriler</h4>
              <ul className="space-y-2 text-sm">
                {categories.slice(0, 4).map(category => (
                  <li key={category.id}>
                    <Link href={`/category/${category.id}`} className="text-muted-foreground hover:text-foreground">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">İletişim</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>📞 0555 123 45 67</li>
                <li>✉️ info@temizlikambalaj.com</li>
                <li>📍 İstanbul, Türkiye</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 Temizlik & Ambalaj. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  )
}

function ProductCard({ 
  product, 
  addToCart, 
  formatPrice 
}: { 
  product: Product
  addToCart: (product: Product) => void
  formatPrice: (amount: number) => string
}) {
  const currentPrice = product.is_campaign && product.campaign_price 
    ? product.campaign_price 
    : product.price

  const originalPrice = product.is_campaign && product.campaign_price 
    ? product.price 
    : null

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-4">
        <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
          {product.image_urls && product.image_urls.length > 0 ? (
            <img 
              src={product.image_urls[0]} 
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Package className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
        
        <div className="space-y-2">
          {product.is_campaign && (
            <Badge variant="destructive" className="text-xs">
              Kampanya
            </Badge>
          )}
          {product.is_featured && (
            <Badge variant="secondary" className="text-xs">
              Öne Çıkan
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
          <Link href={getProductUrl(product)}>
            {product.name}
          </Link>
        </CardTitle>
        
        {product.description && (
          <CardDescription className="text-sm mb-4">
            {product.description.length > 100 
              ? product.description.substring(0, 100) + '...' 
              : product.description}
          </CardDescription>
        )}
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(currentPrice)}
            </div>
            {originalPrice && (
              <div className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </div>
            )}
          </div>
          
          <Badge variant="outline" className="text-xs">
            Stok: {product.stock_quantity}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={() => addToCart(product)}
          disabled={product.stock_quantity === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock_quantity === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
        </Button>
      </CardFooter>
    </Card>
  )
} 