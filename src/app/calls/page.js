'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

export default function RingoverCallsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [calls, setCalls] = useState([])

  useEffect(() => {
    // Simulate loading calls data
    const fetchCalls = async () => {
      try {
        setLoading(true)
        // This would be replaced with an actual API call
        setTimeout(() => {
          setCalls([
            { id: 'call_1234', caller: '+33 6 12 34 56 78', recipient: 'Service Client', duration: 325, status: 'completed', date: '2023-06-15T14:30:00' },
            { id: 'call_2345', caller: '+33 6 23 45 67 89', recipient: 'Support Technique', duration: 186, status: 'completed', date: '2023-06-15T11:15:00' },
            { id: 'call_3456', caller: '+33 6 34 56 78 90', recipient: 'Service Commercial', duration: 0, status: 'missed', date: '2023-06-14T16:45:00' },
            { id: 'call_4567', caller: '+33 6 45 67 89 01', recipient: 'Service Client', duration: 412, status: 'completed', date: '2023-06-14T10:20:00' },
            { id: 'call_5678', caller: '+33 6 56 78 90 12', recipient: 'Support Technique', duration: 0, status: 'missed', date: '2023-06-13T15:10:00' },
            { id: 'call_6789', caller: '+33 6 67 89 01 23', recipient: 'Service Commercial', duration: 278, status: 'completed', date: '2023-06-13T09:45:00' },
            { id: 'call_7890', caller: '+33 6 78 90 12 34', recipient: 'Service Client', duration: 195, status: 'completed', date: '2023-06-12T17:30:00' },
            { id: 'call_8901', caller: '+33 6 89 01 23 45', recipient: 'Support Technique', duration: 0, status: 'missed', date: '2023-06-12T14:15:00' },
            { id: 'call_9012', caller: '+33 6 90 12 34 56', recipient: 'Service Commercial', duration: 347, status: 'completed', date: '2023-06-11T11:50:00' },
            { id: 'call_0123', caller: '+33 6 01 23 45 67', recipient: 'Service Client', duration: 163, status: 'completed', date: '2023-06-11T08:25:00' },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching calls:', error)
        setLoading(false)
      }
    }

    fetchCalls()
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Calculate statistics
  const totalCalls = calls.length
  const completedCalls = calls.filter(call => call.status === 'completed').length
  const missedCalls = calls.filter(call => call.status === 'missed').length
  const totalDuration = calls.reduce((sum, call) => sum + call.duration, 0)
  const averageDuration = completedCalls > 0 ? totalDuration / completedCalls : 0

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds) => {
    if (seconds === 0) return '-'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Format date to locale string
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
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Appels Ringover</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">Suivez et analysez tous les appels téléphoniques</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total des appels</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{totalCalls}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Appels réussis</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{completedCalls}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Appels manqués</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{missedCalls}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-full">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Durée moyenne</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{formatDuration(Math.round(averageDuration))}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Calls Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Historique des appels</h2>
              </div>
              
              {loading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="h-12 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Appelant
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Destinataire
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Durée
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date et heure
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {calls.map((call) => (
                        <tr key={call.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {call.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {call.caller}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {call.recipient}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDuration(call.duration)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              call.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {call.status === 'completed' ? 'Réussi' : 'Manqué'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(call.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link href={`/calls/${call.id}`}>
                              <button className="text-blue-600 hover:text-blue-900">Détails</button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 