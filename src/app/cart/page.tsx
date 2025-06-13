'use client'

import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Package } from 'lucide-react'

export default function CartPage() {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    formatPrice 
  } = useCart()

  if (cart.totalItems === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <CardTitle className="text-2xl">Sepetiniz Boş</CardTitle>
            <CardDescription>
              Henüz sepetinize ürün eklememişsiniz. Alışverişe başlamak için ürünlerimizi inceleyin.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Alışverişe Başla
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-primary">
              Temizlik & Ambalaj
            </Link>
            <h1 className="text-lg font-semibold">Sepetim</h1>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Alışverişe Devam
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Sepetinizdeki Ürünler ({cart.totalItems})
                  </CardTitle>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={clearCart}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sepeti Temizle
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {cart.items.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.product.image_urls && item.product.image_urls.length > 0 ? (
                          <img 
                            src={item.product.image_urls[0]} 
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">
                          {item.product.name}
                        </h3>
                        {item.product.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {item.product.description}
                          </p>
                        )}
                        
                        {/* Price */}
                        <div className="flex items-center space-x-2 mb-3">
                          {item.product.is_campaign && item.product.campaign_price ? (
                            <>
                              <span className="text-lg font-bold text-primary">
                                {formatPrice(item.product.campaign_price)}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(item.product.price)}
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                Kampanya
                              </Badge>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(item.product.price)}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Kaldır
                          </Button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          {formatPrice(
                            (item.product.is_campaign && item.product.campaign_price 
                              ? item.product.campaign_price 
                              : item.product.price) * item.quantity
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.product.is_campaign && item.product.campaign_price 
                            ? item.product.campaign_price 
                            : item.product.price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    
                    {index < cart.items.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Sipariş Özeti
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ara Toplam</span>
                    <span>{formatPrice(cart.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kargo</span>
                    <span className="text-green-600">Ücretsiz</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>KDV</span>
                    <span>Dahil</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Toplam</span>
                    <span>{formatPrice(cart.totalAmount)}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Badge variant="secondary" className="w-full justify-center mb-4">
                    {cart.totalItems} ürün sepetinizde
                  </Badge>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-3">
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Sipariş Ver
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Alışverişe Devam Et
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Security Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Güvenli Alışveriş</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>🔒 SSL korumalı güvenli ödeme</p>
                <p>🚚 Ücretsiz kargo</p>
                <p>↩️ Kolay iade</p>
                <p>📞 7/24 müşteri desteği</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 