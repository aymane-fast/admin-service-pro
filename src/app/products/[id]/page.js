'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { productsApi } from '@/api/productsAPI'

export default function EditProduct() {
  const params = useParams()
  const id = params.id
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await productsApi.getProduct(id)
        setProduct(data)
      } catch (err) {
        console.error('Failed to fetch product:', err)
        setError(err.response?.data?.message || err.message || 'Une erreur est survenue lors du chargement du produit')
        if (err.response?.status === 404) {
          router.push('/products')
        }
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await productsApi.updateProduct(id, product)
      router.push('/products')
    } catch (err) {
      console.error('Failed to update product:', err)
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue lors de la mise à jour du produit')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return
    }
    setDeleting(true)
    try {
      await productsApi.deleteProduct(id)
      router.push('/products')
    } catch (err) {
      console.error('Failed to delete product:', err)
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue lors de la suppression du produit')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <Sidebar />
        <div className="flex-1">
          <div className="p-6 space-y-6">
            <Header />
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-900 rounded-full">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <Sidebar />
        <div className="flex-1">
          <div className="p-6 space-y-6">
            <Header />
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      <Sidebar />
      <div className="flex-1">
        <div className="p-6 space-y-6">
          <Header />
          
          <div className="bg-white rounded-xl shadow-sm">
            <div className="bg-blue-900 p-6 rounded-t-xl">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Modifier le produit
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du produit
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={product?.name || ''}
                    onChange={(e) => setProduct({ ...product, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Prix
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={product?.price || ''}
                    onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={product?.description || ''}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    required
                  />
                </div>

                <div className="flex justify-between">
                  <div className="flex gap-4">
                    <Link
                      href="/products"
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </Link>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-6 py-2.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
