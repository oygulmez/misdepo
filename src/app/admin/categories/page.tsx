'use client'

import { useEffect, useState } from 'react'
import { categoriesApi } from '@/lib/database'
import { Category } from '@/lib/database.types'

interface CategoryForm {
  name: string
  description: string
  parent_id: string | null
  is_active: boolean
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  
  const [form, setForm] = useState<CategoryForm>({
    name: '',
    description: '',
    parent_id: null,
    is_active: true
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll()
      setCategories(data)
    } catch (error) {
      console.error('Categories loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      parent_id: null,
      is_active: true
    })
    setErrors({})
    setEditingCategory(null)
  }

  const handleEdit = (category: Category) => {
    setForm({
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id,
      is_active: category.is_active
    })
    setEditingCategory(category)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!form.name.trim()) {
      newErrors.name = 'Kategori adı zorunludur'
    }
    if (!form.description.trim()) {
      newErrors.description = 'Açıklama zorunludur'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setLoading(true)
    
    try {
      const categoryData = {
        ...form,
        parent_id: form.parent_id || null
      }
      
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, categoryData)
      } else {
        await categoriesApi.create(categoryData)
      }
      
      await loadCategories()
      setShowModal(false)
      resetForm()
      
      alert(editingCategory ? 'Kategori başarıyla güncellendi!' : 'Kategori başarıyla eklendi!')
    } catch (error) {
      console.error('Category save error:', error)
      alert('Kategori kaydedilirken hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    // Check if category has subcategories or products
    const hasSubcategories = categories.some(cat => cat.parent_id === id)
    
    if (hasSubcategories) {
      alert('Bu kategorinin alt kategorileri var. Önce alt kategorileri silin.')
      return
    }
    
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      setLoading(true)
      await categoriesApi.delete(id)
      await loadCategories()
      alert('Kategori başarıyla silindi!')
    } catch (error) {
      console.error('Category delete error:', error)
      alert('Kategori silinirken hata oluştu. Önce bu kategoriye ait ürünleri silin.')
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (category: Category) => {
    try {
      await categoriesApi.update(category.id, { is_active: !category.is_active })
      await loadCategories()
    } catch (error) {
      console.error('Toggle active error:', error)
      alert('Kategori durumu güncellenirken hata oluştu.')
    }
  }

  // Get parent category name
  const getParentName = (parentId: string | null) => {
    if (!parentId) return 'Ana Kategori'
    const parent = categories.find(cat => cat.id === parentId)
    return parent ? parent.name : 'Bilinmeyen'
  }

  // Get root categories (for parent selection)
  const getRootCategories = () => {
    return categories.filter(cat => !cat.parent_id)
  }

  // Get category hierarchy level
  const getCategoryLevel = (category: Category) => {
    return category.parent_id ? 1 : 0
  }

  // Sort categories: root first, then children
  const sortedCategories = [...categories].sort((a, b) => {
    const aLevel = getCategoryLevel(a)
    const bLevel = getCategoryLevel(b)
    
    if (aLevel !== bLevel) {
      return aLevel - bLevel
    }
    
    if (aLevel === 0) {
      return a.name.localeCompare(b.name, 'tr')
    }
    
    // For subcategories, group by parent
    const aParent = getParentName(a.parent_id)
    const bParent = getParentName(b.parent_id)
    
    if (aParent !== bParent) {
      return aParent.localeCompare(bParent, 'tr')
    }
    
    return a.name.localeCompare(b.name, 'tr')
  })

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Kategoriler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategori Yönetimi</h1>
          <p className="text-gray-600 mt-2">
            Toplam {categories.length} kategori
          </p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Yeni Kategori
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Açıklama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Üst Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mr-3 ${
                          category.parent_id 
                            ? 'bg-gray-100 text-gray-600 ml-6' 
                            : 'bg-primary-100 text-primary-600'
                        }`}>
                          <span className="text-sm">
                            {category.parent_id ? '📁' : '🗂️'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {category.parent_id && '↳ '}{category.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {category.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {category.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getParentName(category.parent_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-primary-600 hover:text-primary-800 font-medium"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => toggleActive(category)}
                          className="text-gray-600 hover:text-gray-800 font-medium"
                        >
                          {category.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Henüz kategori eklenmemiş.
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)}></div>
            
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori Adı *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Kategori adını girin"
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
                    placeholder="Kategori açıklamasını girin"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Parent Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Üst Kategori
                  </label>
                  <select
                    value={form.parent_id || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, parent_id: e.target.value || null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Ana Kategori</option>
                    {getRootCategories()
                      .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Boş bırakırsanız ana kategori olarak oluşturulur
                  </p>
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={form.is_active}
                    onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    Aktif kategori
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Kaydediliyor...' : (editingCategory ? 'Güncelle' : 'Ekle')}
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