'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ServiceOrdersTable({ searchQuery, orders = [], loading = false, error = null }) {
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 10

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
      minute: '2-digit',
      timeZone: 'UTC'  // Force UTC timezone to match database time
    })
  }

  // Filter orders based on search query but preserve the original order (latest first)
  const filteredOrders = searchQuery && orders
    ? orders.filter(order => {
        const searchLower = searchQuery.toLowerCase()
        return (
          `${order.client?.first_name} ${order.client?.last_name}`.toLowerCase().includes(searchLower) ||
          order.partner?.name?.toLowerCase().includes(searchLower)
        )
      })
    : orders || []

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
  const startIndex = (currentPage - 1) * ordersPerPage
  const endIndex = startIndex + ordersPerPage
  const currentPageOrders = filteredOrders.slice(startIndex, endIndex)

  if (loading) {
    return <div className="text-center py-4">Loading service orders...</div>
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

  if (!orders.length) {
    return <div className="text-center py-4 text-gray-500">No service orders found</div>
  }

  return (
    <div className="mt-4 bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Id</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partenaire</th>
              <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
              <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prestataire</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentPageOrders.map((order, index) => (
              <tr 
                key={order.id} 
                className={`
                  hover:bg-gray-50 
                  ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}
                `}
              >
                <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                  {String(order.id).padStart(5, '0')}
                </td>
                <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                  {order.client ? `${order.client.first_name} ${order.client.last_name}` : 'N/A'}
                </td>
                <td className="hidden sm:table-cell px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                  {order.partner?.name || 'N/A'}
                </td>
                <td className="hidden md:table-cell px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                  {formatDate(order.date_intervention)}
                </td>
                <td className="hidden md:table-cell px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                  {formatTime(order.heure_intervention)}
                </td>
                <td className="hidden lg:table-cell px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                  {order.description || 'N/A'}
                </td>
                <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                    order.status === 'Terminé'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'Desactivé'
                      ? 'bg-red-100 text-red-800'
                      : order.status === 'En Cours'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status === 'Terminé'
                      ? 'Terminé'
                      : order.status === 'Desactivé'
                      ? 'Annulé'
                      : order.status === 'En Cours'
                      ? 'En cours'
                      : 'En attente'}
                  </span>
                </td>
                <td className="hidden sm:table-cell px-3 sm:px-6 py-4 text-xs sm:text-sm">
                  {order.prestataire ? (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                      order.prestataire_status === 'accepted' 
                        ? 'bg-green-100 text-green-800'
                        : order.prestataire_status === 'refused'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {`${order.prestataire.first_name} ${order.prestataire.last_name}`}
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 whitespace-nowrap">
                      Non assigné
                    </span>
                  )}
                </td>
                <td className="px-3 sm:px-6 py-4">
                  <Link 
                    href={`/service-orders/${order.id}`}
                    className="px-3 sm:px-4 py-1 text-xs sm:text-sm text-white bg-[#205D9E] rounded hover:bg-[#1a4d84] transition-colors inline-block whitespace-nowrap"
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Add pagination controls */}
      {totalPages > 1 && (
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
      )}
    </div>
  )
}
