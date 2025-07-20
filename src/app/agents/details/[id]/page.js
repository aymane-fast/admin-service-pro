'use client'
import Link from 'next/link'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

export default function AgentDetail({ params }) {
  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      <Sidebar />
      <div className="flex-1">
        <div className="p-6 space-y-6">
          <Header />
          
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-blue-500 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Page en Construction</h2>
              <p className="text-gray-500 mb-6">Cette page est actuellement en cours de développement. Nous travaillons pour vous offrir une meilleure expérience.</p>
              <Link href="/agents" className="inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à la liste des agents
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Original code commented out for future reference
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { agentApi } from '@/api/agentApi'

export default function AgentDetail({ params }) {
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        const data = await agentApi.fetchAgentById(params.id)
        setAgent(data)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchAgentDetails()
  }, [params.id])

  const stats = [
    {
      id: 1,
      title: 'chiffre d\'affaire',
      value: agent?.chiffreAffaires || '0 euro',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 2,
      title: 'nombre de OS',
      value: agent?.nbOS || '0',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 3,
      title: 'Plage de dates',
      value: agent?.plageDate || 'N/A',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <Sidebar />
        <div className="flex-1">
          <div className="p-6 space-y-6">
            <Header />
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">Chargement...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <Sidebar />
        <div className="flex-1">
          <div className="p-6 space-y-6">
            <Header />
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center text-red-500">Erreur: {error}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <Sidebar />
        <div className="flex-1">
          <div className="p-6 space-y-6">
            <Header />
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center">Agent non trouvé</div>
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
        <div className="p-6 space-y-6">
          <Header />

          <div className="bg-white rounded-xl shadow-sm">
            <div className="bg-blue-900 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Detail agent
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat) => (
                  <div
                    key={stat.id}
                    className="bg-white p-6 rounded-xl border border-gray-100 flex items-center gap-4"
                  >
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-blue-500">
                        {stat.icon}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Informations de l'agent</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nom</p>
                      <p className="font-medium">{agent.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium">{agent.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Adresse</p>
                      <p className="font-medium">{agent.address || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Code Postal</p>
                      <p className="font-medium">{agent.codePostal || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                      <p className="font-medium">{agent.telephone || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nombre d'OS annulés</p>
                      <p className="font-medium">{agent.nbOSAnnuler || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nombre d'appels reçus</p>
                      <p className="font-medium">{agent.nbAppelRecu || '0'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
*/
