'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function AgentDetails() {
  const params = useParams()
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://127.0.0.1:8000/api/users/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch agent details')
        }

        const result = await response.json()
        if (result.status === 'success') {
          setAgent(result.data)
        } else {
          throw new Error('Failed to load agent data')
        }
      } catch (err) {
        console.error('Error fetching agent:', err)
        setError('Failed to load agent details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchAgentDetails()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <Sidebar />
        <div className="flex-1">
          <div className="p-6">
            <Header />
            <div className="max-w-7xl mx-auto text-center py-12">
              Chargement...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <Sidebar />
        <div className="flex-1">
          <div className="p-6">
            <Header />
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-100 p-4 rounded-lg text-red-700">
                {error || "Impossible de charger les détails de l'agent"}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      <Sidebar />
      <div className="flex-1">
        <div className="p-6">
          <Header />
        </div>
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Détails de l&apos;agent
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Informations détaillées sur {agent.first_name} {agent.last_name}
                </p>
              </div>
            </div>

            {/* Agent Information Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-900 to-blue-800">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Informations personnelles
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Prénom</label>
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">{agent.first_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Nom</label>
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">{agent.last_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Email</label>
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">{agent.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Rôle</label>
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg capitalize">{agent.role}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-900 to-blue-800">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Coordonnées
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Téléphone</label>
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {agent.phone_number ? (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          +33 {agent.phone_number}
                        </span>
                      ) : 'Non renseigné'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Ville</label>
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">{agent.city || 'Non renseignée'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Date de création</label>
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {new Date(agent.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
