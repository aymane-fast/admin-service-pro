'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import paymentsApi from '@/api/paymentsApi'
import partnersApi from '@/api/partnersAPI'
import { useReactToPrint } from 'react-to-print'
import React from 'react'

// Create a separate component for the printable content
const PrintableContent = React.forwardRef(({ payment, entityType, getPaymentMethodText, getStatusText, getStatusColor }, ref) => (
  <div ref={ref} className="print-content">
    {/* Print-only header */}
    <div className="hidden print:block text-center mb-8">
      <h1 className="text-2xl font-bold">Reçu de Paiement</h1>
      <p className="text-gray-600 mt-2">ServicePro</p>
    </div>

    <div className="max-w-4xl mx-auto">
      {/* Payment Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:p-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations de paiement</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Montant</span>
              <span className="text-lg font-semibold text-gray-900">
                {parseFloat(payment.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Méthode</span>
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                {getPaymentMethodText(payment.payment_method)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Statut</span>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                {getStatusText(payment.status)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Date</span>
              <span className="text-sm text-gray-900">
                {new Date(payment.payment_date).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:p-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails de la transaction</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Transaction ID</span>
              <span className="text-sm font-mono text-gray-900">{payment.transaction_id}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">N° Commande</span>
              <Link 
                href={`/service-orders/${payment.order_id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                #{payment.order_id}
              </Link>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Type</span>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                payment.entity_type === 'client' 
                  ? 'bg-green-100 text-green-800'
                  : payment.entity_type === 'prestataire'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {entityType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {payment.notes && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6 print:shadow-none print:p-0 print:mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{payment.notes}</p>
        </div>
      )}

      {/* Print Footer */}
      <div className="hidden print:block mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
        <p>Ce reçu a été généré le {new Date().toLocaleDateString('fr-FR')}</p>
        <p className="mt-2">Pour toute question, veuillez nous contacter</p>
      </div>
    </div>
  </div>
));

PrintableContent.displayName = 'PrintableContent';

export default function PaymentDetails() {
  const params = useParams()
  const [payment, setPayment] = useState(null)
  const [partnerName, setPartnerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const componentRef = useRef()

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Payment_${payment?.transaction_id || 'Receipt'}`,
  });

  useEffect(() => {
    const loadPaymentDetails = async () => {
      try {
        setLoading(true)
        console.log('Params:', params)
        
        if (!params?.id) {
          setError('ID de paiement manquant')
          return
        }

        const data = await paymentsApi.fetchPaymentDetails(params.id)
        setPayment(data.data)
        
        if (params.type === 'partner' && data.data.entity_type === 'partner') {
          try {
            const partnerData = await partnersApi.getPartner(data.data.entity_id)
          setPartnerName(partnerData.name)
          } catch (partnerError) {
            console.error('Error loading partner details:', partnerError)
          }
        }
        setError('')
      } catch (err) {
        console.error('Error loading payment details:', err)
        setError('Erreur lors du chargement des détails du paiement')
      } finally {
        setLoading(false)
      }
    }

    loadPaymentDetails()
  }, [params?.id, params?.type])

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Complété'
      case 'pending':
        return 'En attente'
      case 'failed':
        return 'Échoué'
      default:
        return status
    }
  }

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash':
        return 'Espèces'
      case 'credit_card':
        return 'Carte bancaire'
      case 'transfer':
        return 'Virement'
      default:
        return method
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <Sidebar />
        <div className="flex-1 p-8">
            <Header />
            <div className="text-center py-4">Chargement...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <Sidebar />
        <div className="flex-1 p-8">
            <Header />
            <div className="text-center py-4 text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <Sidebar />
        <div className="flex-1 p-8">
            <Header />
            <div className="text-center py-4">Paiement non trouvé</div>
        </div>
      </div>
    )
  }

  const entityType = payment.entity_type === 'client' ? 'Client' : 
                    payment.entity_type === 'prestataire' ? 'Prestataire' : 
                    'Partenaire'

  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      <Sidebar />
      <div className="flex-1 p-8">
          <Header />

        <div className="max-w-4xl mx-auto mt-8">
          {/* Non-printable header with actions */}
          <div className="flex items-center justify-between mb-8 print:hidden">
            <div className="flex items-center gap-4">
                <Link
                  href="/payments"
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                Retour aux paiements
                </Link>
              {/* <button
                onClick={handlePrint}
                className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimer
              </button> */}
            </div>
          </div>

          {/* Printable content */}
          <PrintableContent
            ref={componentRef}
            payment={payment}
            entityType={entityType}
            getPaymentMethodText={getPaymentMethodText}
            getStatusText={getStatusText}
            getStatusColor={getStatusColor}
          />
        </div>
      </div>
    </div>
  )
}
