'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { stripeApi } from '@/api/stripeAPI'

export default function StripePaymentDetails() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentData, setPaymentData] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('requested_by_customer')
  const [isRefunding, setIsRefunding] = useState(false)
  const [refundError, setRefundError] = useState('')
  const [refundSuccess, setRefundSuccess] = useState('')

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  useEffect(() => {
    const fetchPaymentData = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await stripeApi.getPaymentDetails(params.id)
        if (response.success) {
          setPaymentData(response.data)
        } else {
          setError('Failed to load payment details')
        }
      } catch (error) {
        console.error('Error fetching payment details:', error)
        setError('Une erreur est survenue lors du chargement des détails du paiement')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPaymentData()
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

  const formatAmount = (amount, currency) => {
    return `${parseFloat(amount).toFixed(2)} ${currency.toUpperCase()}`
  }

  const handleRefund = async () => {
    setIsRefunding(true)
    setRefundError('')
    setRefundSuccess('')

    try {
      const amount = refundAmount ? parseFloat(refundAmount) : undefined
      const response = await stripeApi.refundPayment(params.id, {
        amount,
        reason: refundReason
      })

      if (response.success) {
        setRefundSuccess('Remboursement effectué avec succès')
        setPaymentData(response.data.payment)
        setIsRefundModalOpen(false)
      } else {
        setRefundError('Échec du remboursement')
      }
    } catch (error) {
      console.error('Error processing refund:', error)
      setRefundError('Une erreur est survenue lors du remboursement')
    } finally {
      setIsRefunding(false)
    }
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
                Retour aux paiements
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Détails du paiement</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Informations détaillées sur le paiement {params.id}
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
            ) : paymentData && (
              <div className="space-y-6">
                {/* Payment Status Card */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium text-gray-900">Statut du paiement</h2>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        paymentData.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                        paymentData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {paymentData.status === 'succeeded' ? 'Réussi' :
                         paymentData.status === 'pending' ? 'En cours' :
                         'Échoué'}
                      </span>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Montant</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {formatAmount(paymentData.amount, paymentData.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date</p>
                        <p className="mt-1 text-gray-900">{formatDate(paymentData.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID de paiement</p>
                        <p className="mt-1 text-gray-900 font-mono text-sm">{paymentData.payment_id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Informations client</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="mt-1 text-gray-900">{paymentData.customer_email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID Client</p>
                        <p className="mt-1 text-gray-900">{paymentData.customer_id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Méthode de paiement</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Type</p>
                        <p className="mt-1 text-gray-900 capitalize">{paymentData.payment_method_type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID Méthode de paiement</p>
                        <p className="mt-1 text-gray-900">{paymentData.payment_method_id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details with Refund Button */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Détails du paiement</h2>
                      {!paymentData.refunded && paymentData.status === 'succeeded' && (
                        <button
                          onClick={() => setIsRefundModalOpen(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Rembourser
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {paymentData.metadata && Object.keys(paymentData.metadata).length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Métadonnées</p>
                        <div className="mt-2 bg-gray-50 rounded-lg p-4">
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                            {Object.entries(paymentData.metadata).map(([key, value]) => (
                              <div key={key} className="flex">
                                <dt className="text-sm font-medium text-gray-500 mr-2">{key.replace('_', ' ')}:</dt>
                                <dd className="text-sm text-gray-900">{value}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>
                      )}

                      {/* Refund Information */}
                      <div>
                        <p className="text-sm font-medium text-gray-500">Statut de remboursement</p>
                        <div className="mt-2">
                          {paymentData.refunded ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm text-yellow-700">
                                    Remboursé ({formatAmount(paymentData.refunded_amount, paymentData.currency)})
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Non remboursé
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Refund Modal */}
            {isRefundModalOpen && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsRefundModalOpen(false)} />

                  <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div>
                      <div className="mt-3 text-center sm:mt-5">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Rembourser le paiement
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Montant total du paiement: {formatAmount(paymentData.amount, paymentData.currency)}
                          </p>
                        </div>
                      </div>

                      {refundError && (
                        <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                          {refundError}
                        </div>
                      )}

                      {refundSuccess && (
                        <div className="mt-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                          {refundSuccess}
                  </div>
                      )}

                      <div className="mt-5 space-y-4">
                        <div>
                          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                            Montant à rembourser
                          </label>
                          <div className="mt-1">
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              max={paymentData.amount}
                              name="amount"
                              id="amount"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              placeholder={`Maximum: ${formatAmount(paymentData.amount, paymentData.currency)}`}
                              value={refundAmount}
                              onChange={(e) => setRefundAmount(e.target.value)}
                            />
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Laissez vide pour un remboursement total
                            </p>
                          </div>

                        <div>
                          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                            Raison du remboursement
                          </label>
                          <select
                            id="reason"
                            name="reason"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                          >
                            <option value="requested_by_customer">Demandé par le client</option>
                            <option value="duplicate">Paiement en double</option>
                            <option value="fraudulent">Paiement frauduleux</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                          onClick={handleRefund}
                        disabled={isRefunding}
                      >
                        {isRefunding ? 'Remboursement en cours...' : 'Confirmer le remboursement'}
                      </button>
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                        onClick={() => setIsRefundModalOpen(false)}
                        disabled={isRefunding}
                      >
                        Annuler
                        </button>
                      </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 