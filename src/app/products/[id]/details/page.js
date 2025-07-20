'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { productsApi } from '@/api/productsAPI'

export default function ProductDetails() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await productsApi.getProduct(params.id)
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
  }, [params.id, router])

  if (loading) {
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
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
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
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
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
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 sm:p-8 relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                    <svg className="w-6 sm:w-7 h-6 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Détails du produit
                  </h2>
                  <p className="text-sm sm:text-base text-blue-100 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    ID: #{String(params.id).padStart(5, '0')}
                  </p>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <Link
                    href={`/products/${params.id}`}
                    className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-white/20 transition-all duration-200 font-medium text-sm sm:text-base"
                  >
                    <svg className="w-4 sm:w-5 h-4 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span className="hidden sm:inline">Modifier</span>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-8">
              <div className="max-w-4xl mx-auto">
                <div className="bg-gray-50/50 backdrop-blur-sm p-4 sm:p-8 rounded-2xl border border-gray-100 space-y-6 sm:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                      <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Nom du produit
                      </h3>
                      <p className="text-lg sm:text-xl text-gray-900 font-medium">{product.name}</p>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                      <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Prix
                      </h3>
                      <p className="text-lg sm:text-xl text-gray-900 font-medium">{product.price} €</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Description
                    </h3>
                    <p className="text-base sm:text-lg text-gray-700 whitespace-pre-wrap leading-relaxed">{product.description}</p>
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Date de création
                    </h3>
                    <p className="text-base sm:text-lg text-gray-700">
                      {new Date(product.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-6 sm:mt-8">
                  <Link
                    href="/products"
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium flex items-center gap-2 text-sm sm:text-base"
                  >
                    <svg className="w-4 sm:w-5 h-4 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="hidden sm:inline">Retour à la liste</span>
                    <span className="sm:hidden">Retour</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
