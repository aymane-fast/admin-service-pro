'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { quotesApi } from '@/api/quotesAPI'

export default function QuoteTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await quotesApi.getQuotes()
        setQuotes(data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching quotes:', err)
        setError(err.message || 'Error fetching quotes')
        setLoading(false)
      }
    }

    fetchQuotes()
  }, [])

  const itemsPerPage = 10
  const totalPages = Math.ceil(quotes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentQuotes = quotes.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4">
          {error}
        </div>
      </div>
    )
  }

  if (!quotes.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <div className="text-center text-gray-500">
          Aucun devis disponible
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-sm text-gray-500 border-b">
                <th className="font-medium text-left py-3 px-4">IDENTIFIANT</th>
                <th className="font-medium text-left py-3 px-4">NOM D'ENTREPRISE</th>
                <th className="font-medium text-left py-3 px-4">NOM D'AGENT</th>
                <th className="font-medium text-left py-3 px-4">CLIENT</th>
                <th className="font-medium text-left py-3 px-4">PRIX</th>
                <th className="font-medium text-left py-3 px-4">CODE POSTAL CLIENT</th>
                <th className="font-medium text-left py-3 px-4">NUMÉRO DE TÉLÉPHONE</th>
                <th className="font-medium text-left py-3 px-4">STATUS</th>
                <th className="font-medium text-center py-3 px-4">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {currentQuotes.map((quote, index) => (
                <tr 
                  key={quote.id} 
                  className={`
                    border-b 
                    last:border-b-0 
                    hover:bg-gray-50 
                    ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}
                  `}
                >
                  <td className="py-3 px-4 text-gray-900">
                    <span className="font-medium">#{String(quote.id).padStart(5, '0')}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{quote.client?.first_name} {quote.client?.last_name}</td>
                  <td className="py-3 px-4 text-gray-900">{quote.service_name}</td>
                  <td className="py-3 px-4 text-gray-900">{quote.client?.first_name} {quote.client?.last_name}</td>
                  <td className="py-3 px-4 text-gray-900">{parseFloat(quote.total || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                  <td className="py-3 px-4 text-gray-900">{quote.client?.zip_code}</td>
                  <td className="py-3 px-4 text-gray-900">{quote.client?.phone_number}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        quote.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {quote.status === 'pending' ? 'En-Cours' : quote.status === 'accepted' ? 'Accepté' : quote.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center">
                      <Link
                        href={`/quotes/details/${quote.id}`}
                        className="p-2 text-gray-500 hover:text-[#205D9E] transition-colors"
                        title="Voir les détails"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                  currentPage === index + 1
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
