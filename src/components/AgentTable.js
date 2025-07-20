'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { agentApi } from '../api/agentApi'

export default function AgentTable() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await agentApi.fetchAgents()
        setAgents(data)
      } catch (error) {
        setError(error.message || 'Error fetching agents')
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  const totalPages = Math.ceil(agents.length / itemsPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAgents = agents.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center">Chargement...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center text-red-500">Erreur: {error}</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="font-medium text-left py-3 px-4 text-gray-900">Nom</th>
              <th className="font-medium text-left py-3 px-4 text-gray-900">Prénom</th>
              <th className="font-medium text-left py-3 px-4 text-gray-900">Email</th>
              <th className="font-medium text-left py-3 px-4 text-gray-900">Nbr OS annuler</th>
              <th className="font-medium text-left py-3 px-4 text-gray-900">Nbr des appel reçu</th>
              <th className="font-medium text-left py-3 px-4 text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentAgents.map((agent) => (
              <tr key={agent.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {agent.last_name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {agent.first_name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {agent.email}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {agent.cancelled_orders || 0}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {agent.received_calls || 0}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <Link 
                    href={`/agents/${agent.id}`} 
                    className="text-blue-600 hover:text-blue-900"
                    title="Voir détails"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </Link>
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
  )
}
