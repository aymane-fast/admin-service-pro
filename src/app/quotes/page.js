'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { quotesApi } from '@/api/quotesAPI'

export default function Quotes() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    try {
      setLoading(true)
      const response = await quotesApi.getQuotes()
      console.log('Quotes response:', response) // Debug log
      
      // Handle the response data structure correctly
      let quotesData = []
      if (response && Array.isArray(response)) {
        quotesData = response
      } else if (response && Array.isArray(response.data)) {
        quotesData = response.data
      }
      
      // Sort by ID in descending order
      const sortedQuotes = [...quotesData].sort((a, b) => b.id - a.id)
      
      setQuotes(sortedQuotes)
      setError(null)
    } catch (err) {
      console.error('Error loading quotes:', err)
      setError(err.message || 'Erreur lors du chargement des devis')
      setQuotes([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date)
    } catch (error) {
      return '-'
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1">
        <div className="p-6 space-y-6">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          <div className="bg-[#205D9E] rounded-t-xl p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-white">Devis</h1>
              <Link 
                href="/quotes/create"
                className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Créer un devis
              </Link>
            </div>
          </div>

          <div className="bg-white shadow-sm">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#205D9E]"></div>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {quotes.map((quote) => (
                      <tr 
                        key={quote.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => window.location.href = `/quotes/${quote.id}`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {quote.client?.first_name} {quote.client?.last_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(quote.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-[200px]">
                          <div className="truncate" title={quote.service_name}>
                            {quote.service_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {parseFloat(quote.total).toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            quote.status === 'refused' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {quote.status === 'accepted' ? 'Accepté' :
                             quote.status === 'refused' ? 'Refusé' :
                             'En attente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {quotes.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          Aucun devis trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
