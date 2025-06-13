'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { productsApi, categoriesApi } from '@/lib/database'
import { Product, Category } from '@/lib/database.types'
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
import { Switch } from '@/components/ui/switch'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { 
  Package,
  Plus,
  Edit,
  Trash2,
  Star,
  Eye,
  EyeOff,
  ArrowLeft,
  Search,
  Filter,
  Tag,
  ShoppingCart
} from 'lucide-react'

interface ProductForm {
  name: string
  description: string
  price: number
  campaign_price: number | null
  category_id: string
  is_active: boolean
  is_featured: boolean
  is_campaign: boolean
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const { success, error: showError } = useToast()
  
  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    price: 0,
    campaign_price: null,
    category_id: '',
    is_active: true,
    is_featured: false,
    is_campaign: false
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productsApi.getAll({ limit: 100 }),
        categoriesApi.getAll()
      ])
      
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Data loading error:', error)
      showError('Hata', 'Veriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: 0,
      campaign_price: null,
      category_id: '',
      is_active: true,
      is_featured: false,
      is_campaign: false
    })
    setErrors({})
    setEditingProduct(null)
  }

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      campaign_price: product.campaign_price,
      category_id: product.category_id,
      is_active: product.is_active,
      is_featured: product.is_featured,
      is_campaign: product.is_campaign
    })
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!form.name.trim()) {
      newErrors.name = 'Ürün adı zorunludur'
    }
    if (!form.description.trim()) {
      newErrors.description = 'Açıklama zorunludur'
    }
    if (form.price <= 0) {
      newErrors.price = 'Fiyat 0\'dan büyük olmalıdır'
    }
    if (!form.category_id) {
      newErrors.category_id = 'Kategori seçimi zorunludur'
    }
    if (form.is_campaign && (!form.campaign_price || form.campaign_price <= 0)) {
      newErrors.campaign_price = 'Kampanya fiyatı gereklidir'
    }
    if (form.is_campaign && form.campaign_price && form.campaign_price >= form.price) {
      newErrors.campaign_price = 'Kampanya fiyatı normal fiyattan düşük olmalıdır'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setLoading(true)
    
    try {
      const productData = {
        ...form,
        campaign_price: form.is_campaign ? form.campaign_price : null
      }
      
      if (editingProduct) {
        await productsApi.update(editingProduct.id, productData)
        success('Başarılı!', 'Ürün başarıyla güncellendi!')
      } else {
        await productsApi.create(productData)
        success('Başarılı!', 'Ürün başarıyla eklendi!')
      }
      
      await loadData()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('Product save error:', error)
      showError('Hata!', 'Ürün kaydedilirken hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    
    try {
      setLoading(true)
      await productsApi.delete(deleteConfirm)
      await loadData()
      success('Başarılı!', 'Ürün başarıyla silindi!')
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Product delete error:', error)
      showError('Hata!', 'Ürün silinirken hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const toggleFeatured = async (product: Product) => {
    try {
      await productsApi.update(product.id, { is_featured: !product.is_featured })
      await loadData()
      success('Başarılı!', 'Ürün durumu güncellendi!')
    } catch (error) {
      console.error('Toggle featured error:', error)
      showError('Hata!', 'Ürün durumu güncellenirken hata oluştu.')
    }
  }

  const toggleActive = async (product: Product) => {
    try {
      await productsApi.update(product.id, { is_active: !product.is_active })
      await loadData()
      success('Başarılı!', 'Ürün durumu güncellendi!')
    } catch (error) {
      console.error('Toggle active error:', error)
      showError('Hata!', 'Ürün durumu güncellenirken hata oluştu.')
    }
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : 'Kategori bulunamadı'
  }

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getProductStats = () => {
    return {
      total: products.length,
      active: products.filter(p => p.is_active).length,
      featured: products.filter(p => p.is_featured).length,
      campaign: products.filter(p => p.is_campaign).length
    }
  }

  const stats = getProductStats()

  if (loading && products.length === 0) {
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
                <h3 className="text-lg font-semibold">Ürün Yönetimi</h3>
                <p className="text-sm text-muted-foreground">Toplam {products.length} ürün</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="flex gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Ürün ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="w-48">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Kategoriler</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Ürün
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Toplam Ürün</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Aktif</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Öne Çıkan</p>
                  <p className="text-2xl font-bold">{stats.featured}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Tag className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Kampanyalı</p>
                  <p className="text-2xl font-bold">{stats.campaign}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtreler</CardTitle>
            <CardDescription>Ürünleri arayın ve filtreleyin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Ürün ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="w-48">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Ürün Listesi
            </CardTitle>
            <CardDescription>
              {filteredProducts.length} ürün listeleniyor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Fiyat</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Özellikler</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.description?.substring(0, 60)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryName(product.category_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatPrice(product.price)}</div>
                          {product.is_campaign && product.campaign_price && (
                            <div className="text-sm text-green-600">
                              Kampanya: {formatPrice(product.campaign_price)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={product.is_active}
                            onCheckedChange={(checked: boolean) => toggleActive(product)}
                          />
                          <span className="text-sm">
                            {product.is_active ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {product.is_featured && (
                            <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Öne Çıkan
                            </Badge>
                          )}
                          {product.is_campaign && (
                            <Badge variant="destructive">
                              <Tag className="h-3 w-3 mr-1" />
                              Kampanya
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleFeatured(product)}
                            className={product.is_featured ? 'bg-yellow-50' : ''}
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteConfirm(product.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || categoryFilter !== 'all' ? 'Filtrelere uygun ürün bulunamadı' : 'Henüz ürün eklenmemiş'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Form Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
            </DialogTitle>
            <DialogDescription>
              Ürün bilgilerini doldurun ve kaydedin.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Ürün Adı *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ürün adı"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              
              <div>
                <Label htmlFor="category">Kategori *</Label>
                <Select value={form.category_id} onValueChange={(value) => 
                  setForm(prev => ({ ...prev, category_id: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && <p className="text-sm text-destructive">{errors.category_id}</p>}
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Açıklama *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ürün açıklaması"
                rows={3}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Normal Fiyat (₺) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
                {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
              </div>
              
              <div>
                <Label htmlFor="campaign_price">Kampanya Fiyatı (₺)</Label>
                <Input
                  id="campaign_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.campaign_price || ''}
                  onChange={(e) => setForm(prev => ({ 
                    ...prev, 
                    campaign_price: e.target.value ? parseFloat(e.target.value) : null 
                  }))}
                  placeholder="0.00"
                  disabled={!form.is_campaign}
                />
                {errors.campaign_price && <p className="text-sm text-destructive">{errors.campaign_price}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                                 <Switch
                   id="is_active"
                   checked={form.is_active}
                   onCheckedChange={(checked: boolean) => setForm(prev => ({ ...prev, is_active: checked }))}
                 />
                <Label htmlFor="is_active">Aktif</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                                 <Switch
                   id="is_featured"
                   checked={form.is_featured}
                   onCheckedChange={(checked: boolean) => setForm(prev => ({ ...prev, is_featured: checked }))}
                 />
                <Label htmlFor="is_featured">Öne Çıkan</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                                 <Switch
                   id="is_campaign"
                   checked={form.is_campaign}
                   onCheckedChange={(checked: boolean) => setForm(prev => ({ ...prev, is_campaign: checked }))}
                 />
                <Label htmlFor="is_campaign">Kampanyalı</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Kaydediliyor...' : (editingProduct ? 'Güncelle' : 'Ekle')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ürünü Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 