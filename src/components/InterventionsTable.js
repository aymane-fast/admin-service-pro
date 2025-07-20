'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchServiceOrders } from '../api/serviceOrdersApi'

export default function InterventionsTable({ searchQuery }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [interventions, setInterventions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchServiceOrders()
        console.log(`Fetched ${data?.length || 0} interventions for dashboard table`)
        // No need to sort here as fetchServiceOrders now returns data sorted by date (latest first)
        setInterventions(data || [])
      } catch (error) {
        console.error('Failed to fetch interventions:', error)
        setError('Failed to load interventions. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchInterventions()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price) => {
    return `${price}€`
  }

  const filteredInterventions = searchQuery && Array.isArray(interventions)
    ? interventions.filter(intervention => {
        const searchLower = searchQuery.toLowerCase()
        return (
          `${intervention.client?.first_name} ${intervention.client?.last_name}`.toLowerCase().includes(searchLower) ||
          intervention.partner?.name?.toLowerCase().includes(searchLower)
        )
      })
    : Array.isArray(interventions) ? interventions : []

  const totalPages = Math.ceil(filteredInterventions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentInterventions = filteredInterventions.slice(startIndex, endIndex)

  if (!Array.isArray(currentInterventions)) {
    return <div className="text-center py-4">No data available</div>
  }

  if (loading) {
    return <div className="text-center py-4">Loading interventions...</div>
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  if (currentInterventions.length === 0) {
    return <div className="text-center py-4 text-gray-500">No interventions found</div>
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 border-b">
            <tr className="text-left text-gray-600">
              <th className="px-6 py-3 text-xs font-medium uppercase">IDENTIFIANT</th>
              <th className="px-6 py-3 text-xs font-medium uppercase">NOM DU CLIENT</th>
              <th className="px-6 py-3 text-xs font-medium uppercase">DESCRIPTION</th>
              <th className="px-6 py-3 text-xs font-medium uppercase">NOM DU PRESTATAIRE</th>
              <th className="px-6 py-3 text-xs font-medium uppercase">NOM DE L'ENTREPRISE</th>
              <th className="px-6 py-3 text-xs font-medium uppercase">PRIX</th>
              <th className="px-6 py-3 text-xs font-medium uppercase">DATE</th>
              <th className="px-6 py-3 text-xs font-medium uppercase">HEURE</th>
              <th className="px-6 py-3 text-xs font-medium uppercase">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentInterventions.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                  No interventions found
                </td>
              </tr>
            ) : (
              currentInterventions.map((intervention, index) => (
                <tr 
                  key={intervention.id} 
                  className={`
                    hover:bg-gray-50 
                    ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}
                  `}
                >
                  <td className="px-6 py-4 text-sm text-gray-800">{String(intervention.id).padStart(5, '0')}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {intervention.client ? `${intervention.client.first_name} ${intervention.client.last_name}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{intervention.description || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{intervention.prestataire?.first_name} {intervention.prestataire?.last_name || 'N/A'} </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{intervention.partner?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{formatPrice(intervention.price)}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{formatDate(intervention.date_intervention)}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{formatTime(intervention.heure_intervention)}</td>
                  <td className="px-6 py-4">
                    <Link 
                      href={`/service-orders/${intervention.id}`}
                      className="px-4 py-1 text-sm text-white bg-[#205D9E] rounded hover:bg-[#1a4d84] transition-colors inline-block"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
        <button 
          className="px-4 py-2 text-sm text-gray-600 hover:text-[#205D9E] disabled:text-gray-400"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Précédent
        </button>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-full text-sm ${
                currentPage === page
                  ? 'bg-[#205D9E] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button 
          className="px-4 py-2 text-sm text-gray-600 hover:text-[#205D9E] disabled:text-gray-400"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Suivant
        </button>
      </div>
    </div>
  )
}