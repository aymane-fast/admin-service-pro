'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import invoicesApi from '@/api/invoicesAPI'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import html2pdf from 'html2pdf.js'

export default function InvoiceDetails() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [invoiceData, setInvoiceData] = useState(null)
  const [calculations, setCalculations] = useState({})
  const [payments, setPayments] = useState([])
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const tabs = [
    { id: 'details', label: 'Détails' },
    { id: 'documents', label: 'Documents' }
  ];

  const [newPayment, setNewPayment] = useState({
    amount: '',
    payment_method: 'cash',
    payment_date: new Date().toISOString().split('T')[0],
    client_id: null
  })

  useEffect(() => {
    loadInvoice()
  }, [params.id])

  useEffect(() => {
    // Update client_id when invoice data is loaded
    if (invoiceData?.quote?.client?.id) {
      setNewPayment(prev => ({
        ...prev,
        client_id: invoiceData.quote.client.id
      }))
      // Load payments when invoice is loaded
      loadPayments()
    }
  }, [invoiceData])

  const loadInvoice = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log(`Loading invoice with ID: ${params.id}`)
      const data = await invoicesApi.getInvoice(params.id)
      console.log('Invoice Data received:', data)
      
      if (!data) {
        throw new Error('Aucune donnée de facture reçue')
      }
      
      // Parse numeric values
      if (data.quote) {
        data.quote.service_price = parseFloat(data.quote.service_price || 0)
        data.quote.tva_percentage = parseFloat(data.quote.tva_percentage || 0)
        data.quote.products = (data.quote.products || []).map(product => ({
          ...product,
          price: parseFloat(product.price || 0)
        }))
      }
      
      setInvoiceData(data)
      
      // Extract calculations from the data
      if (data.quote) {
        const calculationsData = {
          products_total: parseFloat(data.quote.products_total || 0),
          service_total: parseFloat(data.quote.service_total || 0),
          subtotal: parseFloat(data.quote.subtotal || 0),
          tva_percentage: parseFloat(data.quote.tva_percentage || 0),
          tva_amount: parseFloat(data.quote.tva_amount || 0),
          total: parseFloat(data.quote.total || 0)
        }
        console.log('Extracted calculations:', calculationsData)
        setCalculations(calculationsData)
      }
    } catch (err) {
      console.error('Error loading invoice:', err)
      setError(`Erreur lors du chargement de la facture: ${err.message || 'Erreur inconnue'}`)
    } finally {
      setLoading(false)
    }
  }

  const loadPayments = async () => {
    try {
      if (!invoiceData?.quote?.id) {
        console.warn('Cannot load payments: No quote ID available')
        return
      }
      
      // Get order_id directly from the quote
      const orderId = invoiceData.quote.id // The quote ID is the order ID
      console.log(`Loading payments for order ID: ${orderId}`)
      
      const paymentsData = await invoicesApi.getPayments(orderId)
      console.log(`Received ${paymentsData.length} payments:`, paymentsData)
      
      // Format payment amounts as numbers
      const formattedPayments = paymentsData.map(payment => ({
        ...payment,
        amount: parseFloat(payment.amount || 0)
      }))
      
      setPayments(formattedPayments)
    } catch (err) {
      console.error('Error loading payments:', err)
      // We don't set the main error state here to avoid blocking the entire page
      // Instead, we could add a payments-specific error state if needed
    }
  }

  const handleAddPayment = async (e) => {
    e.preventDefault()
    
    try {
      const orderId = invoiceData?.quote?.id
      if (!orderId) {
        throw new Error('ID de commande non trouvé')
      }
      
      if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) {
        throw new Error('Veuillez entrer un montant valide')
      }
      
      if (!newPayment.client_id) {
        throw new Error('ID client non trouvé')
      }
      
      console.log(`Adding payment for order ID ${orderId}:`, newPayment)
      
      // Format the payment data
      const paymentData = {
        ...newPayment,
        amount: parseFloat(newPayment.amount)
      }
      
      await invoicesApi.addPayment(orderId, paymentData)
      console.log('Payment added successfully')
      
      // Reload data
      await loadPayments()
      await loadInvoice() // Reload invoice to get updated payment status
      
      // Reset form and close modal
      setShowAddPayment(false)
      setNewPayment({
        amount: '',
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        client_id: invoiceData.quote.client.id
      })
    } catch (err) {
      console.error('Error adding payment:', err)
      alert('Erreur lors de l\'ajout du paiement: ' + (err.message || 'Erreur inconnue'))
    }
  }

  const calculatePaymentStatus = () => {
    if (!calculations.total || !payments) return { text: 'En attente', className: 'bg-gray-100 text-gray-600' }

    const totalAmount = Number(calculations.total)
    const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)

    if (totalPaid >= totalAmount) {
      return { text: 'Payée', className: 'bg-green-100 text-green-600' }
    } else if (totalPaid > 0) {
      return { text: 'Partiellement payée', className: 'bg-yellow-100 text-yellow-600' }
    }
    return { text: 'En attente', className: 'bg-gray-100 text-gray-600' }
  }

  const handleDownload = async () => {
    try {
      if (!invoiceData?.quote) {
        throw new Error('Données de facture non disponibles')
      }

      setLoading(true)
      console.log(`Generating PDF for invoice ID: ${params.id}`)
      
      // Get the invoice content element
      const element = document.querySelector('.print\\:shadow-none').cloneNode(true)
      
      // Create a temporary container with white background
      const container = document.createElement('div')
      container.style.background = 'white'
      container.style.padding = '0'
      container.style.height = 'auto'
      container.appendChild(element)

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `facture-${params.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollY: -window.scrollY,
          windowHeight: document.documentElement.offsetHeight
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      }

      await html2pdf().set(opt).from(container).save()
      console.log('Invoice PDF generated successfully')
    } catch (err) {
      console.error('Error generating invoice PDF:', err)
      alert(`Erreur lors de la génération du PDF: ${err.message || 'Erreur inconnue'}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const renderContent = () => {
    const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0)
    const remainingAmount = parseFloat(calculations.total || 0) - totalPaid

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4">
            {error}
          </div>
        </div>
      )
    }

    if (!invoiceData) {
      return (
        <div className="p-4">
          <div className="text-center text-gray-500">
            Facture non trouvée
          </div>
        </div>
      )
    }

    const client = invoiceData.quote.client || {}
    const paymentStatus = calculatePaymentStatus()

    return (
      <div className="flex min-h-screen bg-[#F8F9FF] print:bg-white">
        {/* Sidebar with overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        </div>

        <div className="flex-1">
          <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full print:p-0 print:space-y-0">
            <div className="print:hidden">
              <Header toggleSidebar={toggleSidebar} />
            </div>
            
            {/* Action Buttons - Aligned to right */}
            <div className="flex flex-wrap gap-3 mb-6 print:hidden justify-end">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-1.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimer
              </button>
              
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-1.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Télécharger
              </button>
            </div>

            {/* Invoice Content */}
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 w-full max-w-4xl mx-auto print:shadow-none">
              <style jsx global>{`
                @page {
                  margin-bottom: 25mm;
                  margin-top: 10mm;
                  margin-left: 10mm;
                  margin-right: 10mm;
                }
                @media print {
                  .page-footer {
                    position: fixed;
                    bottom: 15mm;
                    left: 0;
                    right: 0;
                    width: 100%;
                    border-top: 1px solid #e5e7eb;
                    padding-top: 4px;
                    background: white;
                  }
                  .content-wrapper {
                    margin-bottom: 15mm;
                  }
                }
              `}</style>
              
              {/* Main Content Wrapper */}
              <div className="flex flex-col min-h-[23cm] content-wrapper">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <img
                      src="/logo.svg" 
                      alt="ServicePro Logo"
                      className="h-8"
                    />
                  </div>
                  <div className="text-right">
                    <h1 className="text-lg font-semibold text-gray-900">Facture {invoiceData.quote.id}</h1>
                    <p className="text-sm text-gray-600">créé le : {new Date(invoiceData.quote.created_at).toLocaleDateString('fr-FR')} à paris</p>
                  </div>
                </div>

                {/* Client Info and Service Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h2 className="font-semibold text-gray-900 mb-0.5">{client.first_name} {client.last_name}</h2>
                    <p className="text-gray-700 text-sm">{client.address}</p>
                    <p className="text-gray-700 text-sm">{client.zip_code} {client.city}</p>
                    <p className="text-gray-700 text-sm">{client.phone_number}</p>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 mb-0.5">Description de l'intervention</h2>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{invoiceData.quote.service_name}</p>
                    <p className="text-gray-700 text-sm">Date: {new Date(invoiceData.quote.created_at).toLocaleDateString('fr-FR')}</p>
                    <p className="text-gray-700 text-sm">{' '}</p>
                  </div>
                </div>

                {/* Products Table */}
                <div className="mb-12 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-gray-900 font-semibold w-[60%]">Description</th>
                        <th className="text-right py-2 text-gray-900 font-semibold w-[13%]">Prix H.T</th>
                        <th className="text-right py-2 text-gray-900 font-semibold w-[13%]">TVA</th>
                        <th className="text-right py-2 text-gray-900 font-semibold w-[14%]">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.quote.service_name && (
                        <tr className="border-b">
                          <td className="py-2 text-gray-700">{invoiceData.quote.service_name}</td>
                          <td className="text-right py-2 text-gray-700">
                            {parseFloat(invoiceData.quote.service_price || 0).toFixed(2)} €
                          </td>
                          <td className="text-right py-2 text-gray-700">
                            {(parseFloat(invoiceData.quote.service_price || 0) * parseFloat(invoiceData.quote.tva_percentage || 0) / 100).toFixed(2)} €
                          </td>
                          <td className="text-right py-2 text-gray-700">
                            {(parseFloat(invoiceData.quote.service_price || 0) * (1 + parseFloat(invoiceData.quote.tva_percentage || 0) / 100)).toFixed(2)} €
                          </td>
                        </tr>
                      )}
                      {invoiceData.quote.products?.map((product, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 text-gray-700">{product.name}</td>
                          <td className="text-right py-2 text-gray-700">
                            {parseFloat(product.price || 0).toFixed(2)} €
                          </td>
                          <td className="text-right py-2 text-gray-700">
                            {(parseFloat(product.price || 0) * parseFloat(invoiceData.quote.tva_percentage || 0) / 100).toFixed(2)} €
                          </td>
                          <td className="text-right py-2 text-gray-700">
                            {(parseFloat(product.price || 0) * (1 + parseFloat(invoiceData.quote.tva_percentage || 0) / 100)).toFixed(2)} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="w-full flex justify-end mt-auto mb-12">
                  <div className="w-64">
                    <div className="text-right">
                      <div className="mb-2 flex justify-between text-gray-700">
                        <span className="text-gray-700">Montant total</span>
                        <span className="text-gray-700">{parseFloat(calculations.subtotal || 0).toFixed(2)} €</span>
                      </div>
                      <div className="mb-2 flex justify-between text-gray-700">
                        <span className="text-gray-700">TVA ({invoiceData.quote.tva_percentage || 0}%)</span>
                        <span className="text-gray-700">{parseFloat(calculations.tva_amount || 0).toFixed(2)} €</span>
                      </div>
                      <div className="pt-2 border-t border-gray-300 flex justify-between font-bold text-gray-700">
                        <span className="text-gray-700">Prix total</span>
                        <span className="text-gray-700">{parseFloat(calculations.total || 0).toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-2">
                  <div className="w-full bg-gray-100 border border-gray-300 rounded-sm p-1 print:bg-gray-100">
                    <div className="text-[4px] text-gray-600 text-center leading-[6px]">
                      <p>Société FRANCE CONTRE COURANT - SAS au capital de 1 000,00 € (fixe) € - 10 RUE FONTAINE ST GERMAIN 95230</p>
                      <p>SOISY SS MONTMORENCY - Siren 921677241 - RCS PONTOISE - Numéro de tva INTRACOMMUNAUTAIRE FR78921677241 -</p>
                      <p>Assurance AXA France IARD Code ASSCO13 - 95, avenue de paris 94300 VINCENNES - Contrat Numéro</p>
                      <p>0000X2000201904</p>
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

  return (
    renderContent()
  )
}
