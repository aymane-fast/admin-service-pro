'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { partnersApi } from '../api/partnersAPI'

export default function EnterprisesTable({ searchQuery }) {
  const [enterprises, setEnterprises] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadEnterprises = async () => {
      try {
        const data = await partnersApi.fetchPartners()
        setEnterprises(data)
      } catch (error) {
        console.error('Failed to fetch enterprises:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadEnterprises()
  }, [])

  const filteredEnterprises = searchQuery
    ? enterprises.filter(enterprise => 
        Object.values(enterprise).some(value => 
          value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : enterprises

  if (loading) {
    return <div className="text-center py-4">Loading...</div>
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status) => {
    switch (status) {
      case 'approved':
        return 'Approuvé'
      case 'pending':
        return 'En Cours'
      default:
        return status || 'Non spécifié'
    }
  }

  return (
    <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identifiant</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise partenaire</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code postal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro de téléphone</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre des OS</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEnterprises.map((enterprise, index) => (
                  <tr 
                    key={enterprise.id} 
                    className={`
                      hover:bg-gray-50 
                      ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}
                    `}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{String(enterprise.id).padStart(5, '0')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{enterprise.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{enterprise.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{enterprise.zip_code || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{enterprise.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(enterprise.status)}`}>
                        {formatStatus(enterprise.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Link href={`/partners/${enterprise.id}/details`}>
                          <button className="p-1 text-gray-500 hover:text-[#205D9E] transition-colors" title="Voir les détails">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </Link>
                        <Link href={`/partners/${enterprise.id}`}>
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
        </div>
      </div>
    </div>
  )
}
