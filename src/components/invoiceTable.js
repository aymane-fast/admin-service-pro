'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import invoicesApi from '@/api/invoicesAPI'

export default function InvoiceTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      setError(null)
      setRefreshing(true)
      
      console.log('Fetching invoices...')
      // Use our improved invoicesApi to get invoices (accepted quotes)
      const acceptedQuotes = await invoicesApi.getInvoices()
      console.log(`Received ${acceptedQuotes.length} invoices`)
      
      // Transform quotes to invoice format
      const transformedInvoices = acceptedQuotes.map(quote => {
        const client = quote.client || {}
        const calculations = quote.calculations || {}
        
        return {
          id: quote.id,
          nomClient: client ? `${client.first_name || ''} ${client.last_name || ''}`.trim() : 'N/A',
          nomEntreprise: client?.type === 'business' ? (client.company_name || 'Business') : 'Individual',
          prestataire: quote.service_name || 'N/A',
          codePostal: client?.zip_code || 'N/A',
          statut: quote.status || 'N/A',
          montant: parseFloat(calculations.total || quote.total || 0),
          tva: parseFloat(quote.tva_percentage || 0),
          date: quote.created_at ? new Date(quote.created_at).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'N/A',
          products: (quote.products || []).map(product => ({
            id: product.id || Math.random().toString(36).substr(2, 9),
            name: product.name || 'Produit sans nom',
            price: parseFloat(product.price || 0)
          }))
        }
      })
      
      console.log('Transformed invoices:', transformedInvoices)
      setInvoices(transformedInvoices)
    } catch (err) {
      console.error('Error fetching invoices:', err)
      setError('Erreur lors du chargement des factures: ' + (err.message || 'Erreur inconnue'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  if (loading && !refreshing) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4 mb-4">
          {error}
        </div>
        <div className="flex justify-center">
          <button
            onClick={fetchInvoices}
            className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!invoices.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <div className="text-center text-gray-500 mb-4">
          Aucune facture disponible
        </div>
        <div className="flex justify-center">
          <button
            onClick={fetchInvoices}
            className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
          >
            Actualiser
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="p-4 flex justify-end">
        <button
          onClick={fetchInvoices}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-sm text-gray-500 border-b">
              <th className="font-medium text-left py-3 px-4">IDENTIFIANT</th>
              <th className="font-medium text-left py-3 px-4">NOM DE Client</th>
              <th className="font-medium text-left py-3 px-4">Type</th>
              <th className="font-medium text-left py-3 px-4">Service</th>
              <th className="font-medium text-left py-3 px-4">Produits</th>
              <th className="font-medium text-left py-3 px-4">Code postal</th>
              <th className="font-medium text-left py-3 px-4">TVA</th>
              <th className="font-medium text-left py-3 px-4">Total TTC</th>
              <th className="font-medium text-left py-3 px-4">Date</th>
              <th className="font-medium text-center py-3 px-4">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr 
                key={invoice.id} 
                className={`
                  border-b 
                  last:border-b-0 
                  hover:bg-gray-50
                  ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}
                `}
              >
                <td className="py-3 px-4 text-gray-900">
                  <span className="font-medium">#{String(invoice.id).padStart(5, '0')}</span>
                </td>
                <td className="py-3 px-4 text-gray-900">{invoice.nomClient}</td>
                <td className="py-3 px-4 text-gray-900">{invoice.nomEntreprise}</td>
                <td className="py-3 px-4 text-gray-900">{invoice.prestataire}</td>
                <td className="py-3 px-4 text-gray-900">
                  <div className="text-sm">
                    {invoice.products.length > 0 ? (
                      invoice.products.map(product => (
                        <div key={product.id} className="mb-1">
                          {product.name} - {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500">Aucun produit</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-900">{invoice.codePostal}</td>
                <td className="py-3 px-4 text-gray-900">{invoice.tva}%</td>
                <td className="py-3 px-4 text-gray-900 font-medium">{invoice.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                <td className="py-3 px-4 text-gray-900">{invoice.date}</td>
                <td className="py-3 px-4">
                  <div className="flex justify-center">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="p-2 text-blue-500 hover:text-blue-600 transition-colors"
                      title="Voir les détails"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}