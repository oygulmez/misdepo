'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import Link from 'next/link'
import { customersApi, ordersApi } from '@/lib/database'
import { InsertOrderItem } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, CreditCard, Truck, ShoppingCart, Package } from 'lucide-react'

// Order item without order_id (will be added by ordersApi.create)
type OrderItemWithoutOrderId = Omit<InsertOrderItem, 'order_id'>

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">📦</div>
            <CardTitle className="text-2xl">Sepetiniz Boş</CardTitle>
            <CardDescription>
              Sipariş verebilmek için önce sepetinize ürün eklemelisiniz.
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
        } as any)
      }
      
      // Create order
      const orderItems: OrderItemWithoutOrderId[] = cart.items.map(item => ({
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

      // Mevcut schema ile uyumlu order objesi
      const orderData = {
        customer_name: form.customerName,
        customer_phone: form.customerPhone,
        customer_address: form.customerAddress,
        payment_method: form.paymentMethod,
        total_amount: cart.totalAmount,
        notes: form.notes || null
      }

      const order = await ordersApi.create(
        orderData as any,
        orderItems as any
      )
      
      // Clear cart and redirect
      clearCart()
      router.push(`/order-success?id=${order.id}`)
      
    } catch (error: any) {
      console.error('Order creation error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Get detailed error message
      let errorMessage = 'Sipariş oluşturulurken bir hata oluştu.'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.details) {
        errorMessage = error.details
      } else if (error?.hint) {
        errorMessage = error.hint
      }
      
      showError('Sipariş Hatası', errorMessage)
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-primary">
              Temizlik & Ambalaj
            </Link>
            <h1 className="text-lg font-semibold">Sipariş Ver</h1>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cart">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Sepete Dön
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Order Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Sipariş Bilgileri
                </CardTitle>
                <CardDescription>
                  Siparişinizi tamamlamak için aşağıdaki bilgileri doldurun.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Name */}
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Ad Soyad *</Label>
                    <Input
                      id="customerName"
                      type="text"
                      value={form.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      placeholder="Adınızı ve soyadınızı girin"
                      className={errors.customerName ? 'border-destructive' : ''}
                    />
                    {errors.customerName && (
                      <p className="text-sm text-destructive">{errors.customerName}</p>
                    )}
                  </div>

                  {/* Customer Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Telefon Numarası *</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={form.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      placeholder="0555 123 45 67"
                      className={errors.customerPhone ? 'border-destructive' : ''}
                    />
                    {errors.customerPhone && (
                      <p className="text-sm text-destructive">{errors.customerPhone}</p>
                    )}
                  </div>

                  {/* Customer Address */}
                  <div className="space-y-2">
                    <Label htmlFor="customerAddress">Teslimat Adresi *</Label>
                    <Textarea
                      id="customerAddress"
                      value={form.customerAddress}
                      onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                      placeholder="Tam adresinizi yazın..."
                      rows={3}
                      className={errors.customerAddress ? 'border-destructive' : ''}
                    />
                    {errors.customerAddress && (
                      <p className="text-sm text-destructive">{errors.customerAddress}</p>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label>Ödeme Yöntemi</Label>
                    <Select 
                      value={form.paymentMethod} 
                      onValueChange={(value: 'cash_on_delivery' | 'bank_transfer' | 'credit_card') => 
                        handleInputChange('paymentMethod', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ödeme yöntemini seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash_on_delivery">
                          <div className="flex items-center">
                            <Truck className="h-4 w-4 mr-2" />
                            Kapıda Ödeme
                          </div>
                        </SelectItem>
                        <SelectItem value="bank_transfer">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Havale/EFT
                          </div>
                        </SelectItem>
                        <SelectItem value="credit_card">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Kredi Kartı
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Order Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Sipariş Notları (Opsiyonel)</Label>
                    <Textarea
                      id="notes"
                      value={form.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Varsa özel isteklerinizi yazın..."
                      rows={2}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sipariş Veriliyor...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Siparişi Tamamla
                      </>
                    )}
                  </Button>
                </form>
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
                {cart.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.product.is_campaign && item.product.campaign_price 
                          ? item.product.campaign_price 
                          : item.product.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      {formatPrice((item.product.is_campaign && item.product.campaign_price 
                        ? item.product.campaign_price 
                        : item.product.price) * item.quantity)}
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ara Toplam</span>
                    <span>{formatPrice(cart.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kargo</span>
                    <span className="text-green-600">Ücretsiz</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Toplam</span>
                    <span>{formatPrice(cart.totalAmount)}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Badge variant="secondary" className="w-full justify-center">
                    {cart.totalItems} ürün
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Ödeme Güvencesi</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>✅ SSL korumalı güvenli ödeme</p>
                <p>✅ Kapıda ödeme seçeneği</p>
                <p>✅ Havale/EFT ile ödeme</p>
                <p>✅ Hızlı teslimat garantisi</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 