'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import prestatairesApi from '@/api/prestatairesAPI' // Fix: import the entire API object

export default function PrestatairesTable({ searchQuery = '' }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [prestataires, setPrestataires] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const itemsPerPage = 10

  useEffect(() => {
    const loadPrestataires = async () => {
      try {
        setLoading(true)
        const data = await prestatairesApi.fetchPrestataires() // Fix: use the method from the API object
        setPrestataires(data || [])
      } catch (error) {
        console.error('Failed to fetch prestataires:', error)
        setError(error.response?.data?.message || 'Erreur lors du chargement des prestataires')
      } finally {
        setLoading(false)
      }
    }

    loadPrestataires()
  }, [])

  // Filter prestataires based on search query
  const filteredPrestataires = prestataires.filter((prestataire) => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      prestataire.first_name?.toLowerCase().includes(searchLower) ||
      prestataire.last_name?.toLowerCase().includes(searchLower) ||
      prestataire.email?.toLowerCase().includes(searchLower) ||
      prestataire.phone_number?.includes(searchQuery) ||
      prestataire.zip_code?.includes(searchQuery)
    )
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredPrestataires.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPrestataires = filteredPrestataires.slice(startIndex, endIndex)

  if (loading) {
    return <div className="text-center py-4">Loading...</div>
  }

  const getAvailabilityColor = (status) => {
    switch(status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'unavailable':
        return 'bg-red-100 text-red-800'
      case 'busy':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatAvailability = (status) => {
    switch(status) {
      case 'available':
        return 'Disponible'
      case 'unavailable':
        return 'Non disponible'
      case 'busy':
        return 'Occupé'
      default:
        return status || 'Non spécifié'
    }
  }

  return (
    <div className="mt-4 bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code postal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom de l'entreprise</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibilité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPrestataires.map((prestataire, index) => (
              <tr 
                key={prestataire.id} 
                className={`
                  hover:bg-gray-50 
                  ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}
                `}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prestataire.last_name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prestataire.first_name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prestataire.email || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prestataire.zip_code || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {prestataire.phone_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prestataire.companyName || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAvailabilityColor(prestataire.availability_status)}`}>
                    {formatAvailability(prestataire.availability_status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <Link href={`/providers/${prestataire.id}/details`}>
                      <button className="p-1 text-gray-500 hover:text-[#205D9E] transition-colors" title="Voir les détails">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </Link>
                    <Link href={`/providers/${prestataire.id}`}>
                      <button className="p-1 text-gray-500 hover:text-[#205D9E] transition-colors" title="Modifier">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 py-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  )
}
