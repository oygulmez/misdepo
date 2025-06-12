'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDatabase() {
  const [status, setStatus] = useState('Testing...')
  const [categories, setCategories] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function testConnection() {
      try {
        // Test 1: Basic connection
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .limit(5)
        
        if (error) {
          throw error
        }
        
        setCategories(data || [])
        setStatus('✅ Database connection successful!')
        
      } catch (err: any) {
        setError(err.message)
        setStatus('❌ Database connection failed')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🧪 Supabase Database Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <p className="text-lg">{status}</p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800 font-semibold">Error:</p>
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Categories ({categories.length})
          </h2>
          
          {categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((category: any) => (
                <div 
                  key={category.id} 
                  className="p-3 border border-gray-200 rounded-lg"
                >
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                  <p className="text-xs text-gray-400">
                    Created: {new Date(category.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              {error ? 'Could not load categories' : 'Loading categories...'}
            </p>
          )}
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            ← Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  )
} 