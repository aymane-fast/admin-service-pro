'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import StatsCards from '@/components/StatsCards'
import { productsApi } from '@/api/productsAPI'

function ProductsTable({ products = [], searchQuery = '', loading = false }) {
  const safeProducts = Array.isArray(products) ? products : []
  
  const filteredProducts = safeProducts.filter(product =>
    Object.values(product).some(value =>
      value && value.toString().toLowerCase().includes((searchQuery || '').toLowerCase())
    )
  )

  if (loading) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-900 rounded-full" role="status" aria-label="loading">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }

  if (!filteredProducts.length) {
    return (
      <div className="p-4 sm:p-6 text-center text-gray-500">
        No products found
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-gray-200">
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-medium text-gray-500">ID</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-medium text-gray-500">NOM</th>
            <th className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs font-medium text-gray-500">DESCRIPTION</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-medium text-gray-500">PRIX</th>
            <th className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-xs font-medium text-gray-500">DATE</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-xs font-medium text-gray-500">ACTION</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50/50">
              <td className="px-3 sm:px-6 py-3 sm:py-4">
                <span className="text-xs sm:text-sm font-medium text-gray-900">#{String(product.id).padStart(5, '0')}</span>
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4">
                <span className="text-xs sm:text-sm text-gray-900">{product.name}</span>
              </td>
              <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4">
                <span className="text-xs sm:text-sm text-gray-500 line-clamp-2">{product.description}</span>
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4">
                <span className="text-xs sm:text-sm text-gray-900">{product.price} €</span>
              </td>
              <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4">
                <span className="text-xs sm:text-sm text-gray-500">
                  {new Date(product.created_at).toLocaleDateString('fr-FR')}
                </span>
              </td>
              <td className="px-3 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link href={`/products/${product.id}/details`}>
                    <button 
                      className="p-1 text-gray-500 hover:text-[#205D9E] transition-colors" 
                      title="Voir les détails"
                    >
                      <svg className="w-4 sm:w-5 h-4 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </Link>
                  <Link href={`/products/${product.id}`}>
                    <button 
                      className="p-1 text-gray-500 hover:text-[#205D9E] transition-colors" 
                      title="Modifier"
                    >
                      <svg className="w-4 sm:w-5 h-4 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Check authentication
        const token = localStorage.getItem('token')
        if (!token) {
          console.warn('No auth token found')
          router.push('/login')
          return
        }
        
        console.log('Fetching products...')
        const data = await productsApi.fetchProducts()
        console.log('Products received:', data)
        
        if (!data) {
          throw new Error('No data received from API')
        }
        
        setProducts(Array.isArray(data) ? data : [])
        
        // Only calculate stats if we have data
        if (Array.isArray(data) && data.length > 0) {
          const activeProducts = data.filter(product => !product.is_disabled).length
          const lastUpdatedProduct = data.reduce((latest, product) => {
            if (!latest || !latest.updated_at) return product
            if (!product.updated_at) return latest
            return new Date(product.updated_at) > new Date(latest.updated_at) 
              ? product 
              : latest
          }, null)

          setStats([
            {
              title: 'Total Products',
              value: data.length.toString(),
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="#205D9E" fill="none" strokeWidth="1.5">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              )
            },
            {
              title: 'Active Products',
              value: activeProducts.toString(),
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="#205D9E" fill="none" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              title: 'Last Updated',
              value: lastUpdatedProduct?.updated_at 
                ? new Date(lastUpdatedProduct.updated_at).toLocaleDateString('fr-FR') 
                : '-',
              icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="#205D9E" fill="none" strokeWidth="1.5">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )
            }
          ])
        } else {
          setStats([])
        }
      } catch (error) {
        console.error('Products page error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        
        if (error.response?.status === 401) {
          console.log('Unauthorized, redirecting to login')
          router.push('/login')
          return
        }
        
        setError(
          error.response?.data?.message || 
          error.message || 
          'Failed to load products'
        )
        setProducts([])
        setStats([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [router])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full lg:w-auto">
        <div className="p-4 sm:p-6 space-y-6">
          <Header 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            toggleSidebar={toggleSidebar}
          />
          
          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="bg-blue-900 p-4 sm:p-6 rounded-t-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Liste produit</h2>
                  <p className="text-sm text-blue-100">Gérez vos produits</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                  <Link
                    href="/products/create"
                    className="inline-flex items-center justify-center gap-2 bg-green-500/25 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green-500/30 transition-colors text-sm sm:text-base"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="hidden sm:inline">Nouveau produit</span>
                    <span className="sm:hidden">Ajouter</span>
                  </Link>
                </div>
              </div>
            </div>

            {error ? (
              <div className="p-4 sm:p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              </div>
            ) : (
              <ProductsTable 
                products={products} 
                searchQuery={searchQuery}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
