'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import paymentsApi from '@/api/paymentsApi'

export default function PaymentDetails({ params }) {
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPaymentDetails = async () => {
      try {
        setLoading(true)
        const data = await paymentsApi.fetchPaymentDetails(params.type, params.id)
        setPayment(data.data)
        setError('')
      } catch (error) {
        console.error('Failed to fetch payment details:', error)
        setError('Erreur lors du chargement des détails du paiement')
      } finally {
        setLoading(false)
      }
    }

    loadPaymentDetails()
  }, [params.type, params.id])

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Complété'
      case 'pending':
        return 'En attente'
      default:
        return 'Échoué'
    }
  }

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'card':
        return 'Carte'
      case 'cash':
        return 'Espèces'
      case 'transfer':
        return 'Virement'
      case 'check':
        return 'Chèque'
      default:
        return method || '-'
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <Sidebar />
        <div className="flex-1">
          <div className="p-6 space-y-6">
            <Header />
            <div className="text-center py-4">Chargement...</div>
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
            <div className="text-center py-4 text-red-600">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <Sidebar />
        <div className="flex-1">
          <div className="p-6 space-y-6">
            <Header />
            <div className="text-center py-4">Paiement non trouvé</div>
          </div>
        </div>
      </div>
    )
  }

  const entityType = payment.type === 'client' ? 'Client' : 
                    payment.type === 'prestataire' ? 'Prestataire' : 
                    'Partenaire'

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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Détails du paiement - {entityType}
                  </h2>
                </div>
                <Link
                  href="/payments"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  <span>Retour</span>
                </Link>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Identifiant</h3>
                    <p className="mt-1 text-base text-gray-900">{String(payment.id).padStart(5, '0')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{entityType}</h3>
                    <p className="mt-1 text-base text-gray-900">{payment[`${payment.type}_name`]}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date de paiement</h3>
                    <p className="mt-1 text-base text-gray-900">
                      {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date de création</h3>
                    <p className="mt-1 text-base text-gray-900">
                      {new Date(payment.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Transaction ID</h3>
                    <p className="mt-1 text-base text-gray-900">{payment.transaction_id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">N° Commande</h3>
                    <p className="mt-1 text-base text-gray-900">{payment.order_id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Montant</h3>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {payment.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Méthode de paiement</h3>
                    <p className="mt-1 text-base text-gray-900">
                      {getPaymentMethodText(payment.payment_method)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                    <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                  </div>
                </div>
              </div>

              {payment.notes && (
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p className="mt-1 text-base text-gray-900">{payment.notes}</p>
                </div>
              )}

              {payment.order && (
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-500 mb-4">Détails de la commande</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {/* Add order details here based on the available data */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
