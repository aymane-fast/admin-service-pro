'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

export default function CallDetails() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [callData, setCallData] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [recordingPlaying, setRecordingPlaying] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  useEffect(() => {
    const fetchCallData = async () => {
      setLoading(true)
      setError('')
      try {
        // This would be replaced with an actual API call
        setTimeout(() => {
          // Simulate call data
          setCallData({
            id: params.id,
            caller: {
              number: '+33 6 12 34 56 78',
              name: 'John Doe',
              email: 'john.doe@example.com'
            },
            recipient: {
              number: '+33 1 23 45 67 89',
              name: 'Service Client',
              agent: 'Marie Dupont'
            },
            duration: 325, // in seconds
            status: 'completed',
            date: '2023-06-15T14:30:00',
            direction: 'inbound',
            recording_url: 'https://example.com/recordings/call_1234.mp3',
            notes: 'Client appelant pour un problème de plomberie. Rendez-vous pris pour le 20 juin à 10h.',
            tags: ['urgent', 'plomberie', 'client-premium'],
            related_order: {
              id: '12345',
              service_type: 'Plumbing',
              status: 'scheduled'
            }
          })
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching call details:', error)
        setError('Une erreur est survenue lors du chargement des détails de l\'appel')
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCallData()
    }
  }, [params.id])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds) => {
    if (seconds === 0) return '-'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const togglePlayRecording = () => {
    setRecordingPlaying(!recordingPlaying)
    // This would be replaced with actual audio playback logic
    alert('Cette fonctionnalité serait connectée à l\'API Ringover pour lire l\'enregistrement')
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar 
          isOpen={isSidebarOpen} 
          closeSidebar={() => setIsSidebarOpen(false)} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full lg:w-auto">
        <div className="p-4 sm:p-6">
          <Header toggleSidebar={toggleSidebar} />
        </div>

        <main className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Back button and title */}
            <div className="mb-6">
              <button 
                onClick={() => router.back()} 
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour aux appels
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Détails de l'appel</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Informations détaillées sur l'appel {params.id}
              </p>
            </div>

            {loading ? (
              <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : callData && (
              <div className="space-y-6">
                {/* Call Status Card */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium text-gray-900">Statut de l'appel</h2>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          callData.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {callData.status === 'completed' ? 'Réussi' : 'Manqué'}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          callData.direction === 'inbound' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {callData.direction === 'inbound' ? 'Entrant' : 'Sortant'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Durée</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">{formatDuration(callData.duration)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date et heure</p>
                        <p className="mt-1 text-gray-900">{formatDate(callData.date)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID d'appel</p>
                        <p className="mt-1 text-gray-900 font-mono text-sm">{callData.id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Caller Information */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Informations sur l'appelant</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Numéro</p>
                        <p className="mt-1 text-gray-900">{callData.caller.number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nom</p>
                        <p className="mt-1 text-gray-900">{callData.caller.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="mt-1 text-gray-900">{callData.caller.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipient Information */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Informations sur le destinataire</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Numéro</p>
                        <p className="mt-1 text-gray-900">{callData.recipient.number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Service</p>
                        <p className="mt-1 text-gray-900">{callData.recipient.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Agent</p>
                        <p className="mt-1 text-gray-900">{callData.recipient.agent}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call Recording */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Enregistrement de l'appel</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <button
                          onClick={togglePlayRecording}
                          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {recordingPlaying ? (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">Enregistrement {callData.id}</p>
                          <p className="text-sm text-gray-500">Durée: {formatDuration(callData.duration)}</p>
                        </div>
                      </div>
                      <a
                        href={callData.recording_url}
                        download
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Télécharger
                      </a>
                    </div>
                  </div>
                </div>

                {/* Call Notes */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Notes d'appel</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-900 whitespace-pre-wrap">{callData.notes}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {callData.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Related Order */}
                {callData.related_order && (
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900">Commande associée</h2>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">ID de commande</p>
                          <p className="mt-1 text-gray-900">{callData.related_order.id}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Type de service</p>
                          <p className="mt-1 text-gray-900">{callData.related_order.service_type}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Statut</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {callData.related_order.status}
                          </span>
                        </div>
                        <Link
                          href={`/orders/${callData.related_order.id}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Voir la commande
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 