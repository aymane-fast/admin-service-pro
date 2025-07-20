'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { stripeApi } from '@/api/stripeAPI'
import PaymentModal from '@/components/PaymentModal'

export default function StripePaymentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState([])
  const [pagination, setPagination] = useState(null)
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    order_by: 'created_at',
    order_direction: 'desc'
  })
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [prestataires, setPrestataires] = useState([])
  const [partners, setPartners] = useState([])

  useEffect(() => {
    fetchPayments()
  }, [filters])

  useEffect(() => {
    const loadRecipients = async () => {
      try {
        const [prestatairesData, partnersData] = await Promise.all([
          stripeApi.getPrestataires(),
          stripeApi.getPartners()
        ])
        
        if (prestatairesData.success) {
          setPrestataires(prestatairesData.data)
        }
        
        if (partnersData.success) {
          setPartners(partnersData.data)
        }
      } catch (error) {
        console.error('Error loading recipients:', error)
      }
    }

    loadRecipients()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await stripeApi.getPayments(filters)
      if (response.success) {
        setPayments(response.data.data)
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total,
          per_page: response.data.per_page
        })
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      setSyncMessage(null)
      const response = await stripeApi.syncPayments()
      if (response.success) {
        setSyncMessage(`${response.message}`)
        // Refresh payments list
        fetchPayments()
      }
    } catch (error) {
      console.error('Error syncing payments:', error)
      setSyncMessage('Failed to sync payments')
    } finally {
      setSyncing(false)
    }
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  // Calculate statistics from real data
  const totalPayments = payments.length
  const successfulPayments = payments.filter(payment => payment.status === 'succeeded').length
  const totalRevenue = payments.reduce((sum, payment) => 
    payment.status === 'succeeded' ? sum + parseFloat(payment.amount) : sum, 0)
  const averagePayment = successfulPayments > 0 ? totalRevenue / successfulPayments : 0

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
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>

        <main className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 sm:mb-8 flex justify-between items-center">
              <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Paiements Stripe</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">Gérez et suivez tous les paiements Stripe</p>
              </div>
              <div className="flex gap-3">
                {/* <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nouveau paiement
                </button> */}
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {syncing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Synchronisation...
                    </>
                  ) : 'Synchroniser les paiements'}
                </button>
              </div>
            </div>

            {syncMessage && (
              <div className={`mb-4 p-4 rounded-lg ${syncMessage.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {syncMessage}
              </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total des paiements</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{pagination?.total || totalPayments}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Paiements réussis</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{successfulPayments}</p>
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
                    <p className="text-sm font-medium text-gray-500">Revenu total</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{totalRevenue.toFixed(2)} €</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-full">
                    <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Paiement moyen</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{averagePayment.toFixed(2)} €</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Historique des paiements</h2>
                {pagination && (
                  <div className="text-sm text-gray-500">
                    Affichage {(pagination.current_page - 1) * pagination.per_page + 1} à {Math.min(pagination.current_page * pagination.per_page, pagination.total)} sur {pagination.total} paiements
                  </div>
                )}
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
                          Client
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.payment_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {payment.payment_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.customer_email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {parseFloat(payment.amount).toFixed(2)} {payment.currency.toUpperCase()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payment.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status === 'succeeded' ? 'Réussi' :
                               payment.status === 'pending' ? 'En cours' :
                               'Échoué'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link href={`/stripe/${payment.payment_id}`}>
                              <button className="text-blue-600 hover:text-blue-900">Détails</button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <div className="flex-1 flex justify-center">
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{pagination.current_page}</span> sur <span className="font-medium">{pagination.last_page}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </div>

            {/* Payment Modal */}
            <PaymentModal
              isOpen={isPaymentModalOpen}
              onClose={() => setIsPaymentModalOpen(false)}
              prestataires={prestataires}
              partners={partners}
              onPaymentCreated={fetchPayments}
            />
          </div>
        </main>
      </div>
    </div>
  )
} 