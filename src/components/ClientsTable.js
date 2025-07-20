'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { fetchClients } from '../api/clientsApi'

export default function ClientsTable({ searchQuery }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 10

  useEffect(() => {
    const getClients = async () => {
      try {
        const data = await fetchClients()
        setClients(data)
      } catch (error) {
        console.error('Failed to fetch clients:', error)
      } finally {
        setLoading(false)
      }
    }

    getClients()
  }, [])

  // Filter clients based on search query
  const filteredClients = clients.filter((client) => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      client.first_name.toLowerCase().includes(searchLower) ||
      client.last_name.toLowerCase().includes(searchLower) ||
      client.phone_number.includes(searchQuery) ||
      client.zip_code.includes(searchQuery) ||
      (client.address && client.address.toLowerCase().includes(searchLower))
    )
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentClients = filteredClients.slice(startIndex, endIndex)

  if (loading) {
    return <div className="text-center py-4">Loading...</div>
  }

  return (
    <div className="mt-4 bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="pl-6 pr-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identifiant</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code postal</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro de téléphone</th>
              <th className="pl-3 pr-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentClients.map((client, index) => (
              <tr 
                key={client.id} 
                className={`
                  hover:bg-gray-50 
                  ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}
                `}
              >
                <td className="pl-6 pr-3 py-4 text-sm text-gray-600">{client.id.toString().padStart(5, '0')}</td>
                <td className="px-3 py-4 text-sm text-gray-600">{client.last_name}</td>
                <td className="px-3 py-4 text-sm text-gray-600">{client.first_name}</td>
                <td className="px-3 py-4 text-sm text-gray-600">{client.type}</td>
                <td className="px-3 py-4 text-sm text-gray-600">{client.address}</td>
                <td className="px-3 py-4 text-sm text-gray-600">{client.zip_code}</td>
                <td className="px-3 py-4 text-sm text-gray-600">{client.city}</td>
                <td className="px-3 py-4 text-sm text-gray-600">{client.phone_number}</td>
                <td className="pl-3 pr-6 py-4 flex items-center gap-2">
                  <Link href={`/clients/${client.id}/details`}>
                    <button className="p-1 text-gray-500 hover:text-[#205D9E] transition-colors" title="Voir les détails">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </Link>
                  <Link href={`/clients/${client.id}`}>
                    <button className="p-1 text-gray-500 hover:text-[#205D9E] transition-colors" title="Modifier">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
