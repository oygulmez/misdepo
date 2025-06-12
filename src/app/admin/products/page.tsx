'use client'

import { useEffect, useState } from 'react'
import { productsApi, categoriesApi } from '@/lib/database'
import { Product, Category } from '@/lib/database.types'

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
      } else {
        await productsApi.create(productData)
      }
      
      await loadData()
      setShowModal(false)
      resetForm()
      
      alert(editingProduct ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla eklendi!')
    } catch (error) {
      console.error('Product save error:', error)
      alert('Ürün kaydedilirken hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      setLoading(true)
      await productsApi.delete(id)
      await loadData()
      alert('Ürün başarıyla silindi!')
    } catch (error) {
      console.error('Product delete error:', error)
      alert('Ürün silinirken hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const toggleFeatured = async (product: Product) => {
    try {
      await productsApi.update(product.id, { is_featured: !product.is_featured })
      await loadData()
    } catch (error) {
      console.error('Toggle featured error:', error)
      alert('Ürün durumu güncellenirken hata oluştu.')
    }
  }

  const toggleActive = async (product: Product) => {
    try {
      await productsApi.update(product.id, { is_active: !product.is_active })
      await loadData()
    } catch (error) {
      console.error('Toggle active error:', error)
      alert('Ürün durumu güncellenirken hata oluştu.')
    }
  }

  const formatPrice = (amount: number) => `₺${amount.toFixed(2)}`

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : 'Kategori bulunamadı'
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ürünler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ürün Yönetimi</h1>
          <p className="text-gray-600 mt-2">
            Toplam {products.length} ürün
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Yeni Ürün
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fiyat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Özellikler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                          <span className="text-xl">🧴</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getCategoryName(product.category_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </div>
                      {product.is_campaign && product.campaign_price && (
                        <div className="text-sm text-red-600">
                          Kampanya: {formatPrice(product.campaign_price)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {product.is_featured && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Öne Çıkan
                          </span>
                        )}
                        {product.is_campaign && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Kampanyalı
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col space-y-1">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-primary-600 hover:text-primary-800 font-medium"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Sil
                          </button>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleActive(product)}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            {product.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                          </button>
                          <button
                            onClick={() => toggleFeatured(product)}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            {product.is_featured ? 'Öne Çıkarmayı Kaldır' : 'Öne Çıkar'}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Henüz ürün eklenmemiş.
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)}></div>
            
            <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ürün adını girin"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama *
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ürün açıklamasını girin"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm(prev => ({ ...prev, category_id: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.category_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>

                {/* Campaign */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_campaign"
                    checked={form.is_campaign}
                    onChange={(e) => setForm(prev => ({ ...prev, is_campaign: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_campaign" className="ml-2 text-sm text-gray-700">
                    Kampanyalı ürün
                  </label>
                </div>

                {/* Campaign Price */}
                {form.is_campaign && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kampanya Fiyatı (₺) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.campaign_price || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, campaign_price: parseFloat(e.target.value) || null }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.campaign_price ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.campaign_price && (
                      <p className="text-red-500 text-sm mt-1">{errors.campaign_price}</p>
                    )}
                  </div>
                )}

                {/* Checkboxes */}
                <div className="flex space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={form.is_active}
                      onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                      Aktif
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={form.is_featured}
                      onChange={(e) => setForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
                      Öne çıkan ürün
                    </label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Kaydediliyor...' : (editingProduct ? 'Güncelle' : 'Ekle')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 