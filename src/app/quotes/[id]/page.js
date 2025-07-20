'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { quotesApi } from '@/api/quotesAPI'
import SendQuoteEmailModal from '@/components/SendQuoteEmailModal'
import Image from 'next/image'
import html2pdf from 'html2pdf.js'




export default function QuoteDetails() {
  const { id } = useParams()
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const checkAuthAndFetchQuote = async () => {
    let token = localStorage.getItem('token')
    if (!token) {
      console.log('Waiting for authentication...')
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }
    }

    try {
      if (!id) {
        throw new Error('Quote ID is required')
      }

      const response = await quotesApi.getQuoteById(id)
      console.log('Raw API response:', response)
      
      // Check if response exists and has the expected structure
      if (!response || (!response.quote && !response.data)) {
        throw new Error('Invalid response format')
      }

      // Get quote data from either response.quote or response.data
      const quoteData = response.quote || response.data
      console.log('Quote data to process:', quoteData)

      if (!quoteData) {
        throw new Error('No quote data received')
      }

      // Parse the quote data
      const parsedQuote = {
        ...quoteData,
        service_price: parseFloat(quoteData.service_price || 0),
        tva_percentage: parseFloat(quoteData.tva_percentage || 0),
        products_total: parseFloat(quoteData.products_total || 0),
        service_total: parseFloat(quoteData.service_total || 0),
        subtotal: parseFloat(quoteData.subtotal || 0),
        tva_amount: parseFloat(quoteData.tva_amount || 0),
        total: parseFloat(quoteData.total || 0),
        products: Array.isArray(quoteData.products) ? quoteData.products.map(product => ({
          ...product,
          price: parseFloat(product.price || 0),
          name: product.name || '',
          quantity: parseInt(product.quantity || 1)
        })) : []
      }

      console.log('Parsed quote:', parsedQuote)
      setQuote(parsedQuote)
    } catch (err) {
      console.error('Error fetching quote:', err)
      setError(err.message || 'Erreur lors du chargement du devis')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuthAndFetchQuote()
  }, [id])

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    } catch (error) {
      console.error('Error formatting date:', error)
      return '-'
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const element = document.querySelector('.print\\:shadow-none').cloneNode(true)
    
    // Create a temporary container with white background
    const container = document.createElement('div')
    container.style.background = 'white'
    container.style.padding = '0'
    container.style.height = 'auto'
    container.appendChild(element)

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `devis-${quote.id}.pdf`,
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

    html2pdf().set(opt).from(container).save()
  }

  const handleSendEmail = () => {
    setIsEmailModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
          <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        <div className="flex-1">
          <div className="p-6 space-y-6">
            <Header toggleSidebar={toggleSidebar} />
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
          <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        <div className="flex-1">
          <div className="p-6 space-y-6">
            <Header toggleSidebar={toggleSidebar} />
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3 text-red-700">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error || 'Devis non trouvé'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

      <SendQuoteEmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
        quoteId={id}
        clientEmail={quote.client?.email}
      />

      <div className="flex-1">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 w-full print:p-0 print:space-y-0">
          <div className="print:hidden">
          <Header toggleSidebar={toggleSidebar} />
          </div>
          
          {/* Action Buttons - Aligned to right */}
          <div className="flex flex-wrap gap-3 mb-6 print:hidden justify-end">
            <button
              onClick={handlePrint}
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
            
            <button
              onClick={handleSendEmail}
              className="inline-flex items-center px-3 py-2 bg-[#205D9E] text-white rounded-lg hover:bg-[#184b82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Envoyer au client
            </button>
          </div>

          {/* Quote Content */}
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 w-full max-w-4xl mx-auto print:shadow-none print:p-0">
            <style jsx global>{`
              @page {
                margin-bottom: 25mm; /* Reduced from 40mm to 25mm */
                margin-top: 10mm;
                margin-left: 10mm;
                margin-right: 10mm;
              }
              @media print {
                .page-footer {
                  position: fixed;
                  bottom: 15mm; /* Increased from 10mm to 15mm to move footer higher */
                  left: 0;
                  right: 0;
                  width: 100%;
                  border-top: 1px solid #e5e7eb;
                  padding-top: 4px; /* Reduced padding */
                  background: white;
                }
                .content-wrapper {
                  margin-bottom: 15mm; /* Reduced from 20mm to 15mm */
                }
              }
            `}</style>
            
            {/* Main Content Wrapper */}
            <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '10pt', color: '#333' }}>
      {/* Header Wave Image */}
      <div style={{ textAlign: 'center' }}>
        <img
          src="/wave-header.png"
          alt="Wave Header"
          style={{ width: '100%', height: 'auto', maxWidth: '100%' }}
        />
      </div>

      {/* Company Info */}
      <div style={{ height: '150px', backgroundSize: 'cover', padding: '20px 40px' }}>
        <div style={{ textAlign: 'right', fontSize: '9pt', lineHeight: 1.5 }}>
          10 rue de la fontaine St germain Soisy-sous-Montmorency 95230<br />
          electriciensservicespro@gmail.com<br />
          https://electricien-servicespro.com<br />
          09707075723<br />
          <strong style={{ display: 'block', fontWeight: 'bold', marginTop: 5 }}>SIRET : 92167724100017</strong>
        </div>
      </div>

      {/* Client + Invoice Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20 }}>
        {/* Left - Client Info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '31px', fontWeight: 'bold' }}>SERVICE PRO:</div>
          <div style={{ fontWeight: 'bold' }}> </div>
          {quote.client?.first_name} {quote.client?.last_name}<br />
          {quote.client?.email}<br />
          {quote.client?.address}, {quote.client?.city} , {quote.client?.zip_code}<br />
          {quote.client?.phone_number}
        </div>

        {/* Right - Invoice Info */}
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ color: 'rgb(25, 158, 235)', fontSize: '20px', fontWeight: 'bold' }}>Devis</h2>
          <p style={{ fontSize: '14px', color: '#333', lineHeight: 1.5 }}>
            Devis N° : <span style={{ fontWeight: 'bold' }}>{quote.id}</span><br />
            Date : <span style={{ fontWeight: 'bold' }}>{formatDate(quote.created_at)}</span><br />
          </p>
        </div>
      </div>

      {/* Developer Image */}
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <img
          src="/logoZ.png"
          alt="Developer"
          style={{ width: 400, height: 400, borderRadius: '50%', marginBottom: 20 }}
        />
      </div>

      {/* Page 2 - Invoice Table */}
      <div
  style={{
    position: 'absolute',
   width: '700px',
    margin: '-481px auto 30px 0',
    padding: 20,
    backgroundColor: '',
    borderRadius: 8,
  }}
>
  <header style={{ textAlign: 'center', marginBottom: 20 }}>
    <h1 style={{ fontSize: '24px', color: '#333' }}>
     
    </h1>
  </header>

  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
    <thead>
      <tr style={{ backgroundColor: '#f1f1f1', fontWeight: 'bold' }}>
        <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #ddd' }}>Désignation</th>
        <th style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #ddd' }}>PU</th>
        <th style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #ddd' }}>TVA</th>
        <th style={{ padding: 10, textAlign: 'right', borderBottom: '1px solid #ddd' }}>Montant</th>
      </tr>
    </thead>
    <tbody>
    {quote.products?.map((product, index) => (
      <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
        <td style={{
          padding: '10px',
          color: '#333',
          wordBreak: 'break-word',
          whiteSpace: 'normal',
          overflowWrap: 'break-word'
        }}>
          {product.name}
        </td>
        <td style={{ padding: '10px', textAlign: 'right', color: '#333' }}>
          {(product.price || 0).toFixed(2)} €
        </td>
        <td style={{ padding: '10px', textAlign: 'right', color: '#333' }}>
          {((product.price || 0) * (quote.tva_percentage || 0) / 100).toFixed(2)} €
        </td>
        <td style={{ padding: '10px', textAlign: 'right', color: '#333' }}>
          {((product.price || 0) * (1 + (quote.tva_percentage || 0) / 100)).toFixed(2)} €
        </td>
      </tr>
    ))}

      {/* Show service_name if no products */}
      {(!quote.products || quote.products.length === 0) && quote.service_name && (
        <tr style={{ borderBottom: '1px solid #ddd' }}>
          <td style={{ padding: 10, color: '#333' }}>{quote.service_name}</td>
          <td style={{ padding: 10, textAlign: 'right', color: '#333' }}>
            {(quote.service_price || 0).toFixed(2)} €
          </td>
          <td style={{ padding: 10, textAlign: 'right', color: '#333' }}>
            {((quote.service_price || 0) * (quote.tva_percentage || 0) / 100).toFixed(2)} €
          </td>
          <td style={{ padding: 10, textAlign: 'right', color: '#333' }}>
            {((quote.service_price || 0) * (1 + (quote.tva_percentage || 0) / 100)).toFixed(2)} €
          </td>
        </tr>
      )}

      {/* Show fallback message if no data at all */}
      {(!quote.products || quote.products.length === 0) && !quote.service_name && (
        <tr>
          <td colSpan="4" style={{ padding: 20, textAlign: 'center', color: '#888' }}>
            Aucun produit ou service
          </td>
        </tr>
      )}


    </tbody>
  </table>
      <div className="flex justify-end mb-3">
                  <div className="w-full max-w-xs" style={{maxWidth:"16rem"}}>
                    <div className="space-y-0.5 text-sm" >
                      <div className="flex justify-between py-1">
                        <span className="text-gray-700">Montant total</span>
                        <span className="text-gray-700">{quote.subtotal?.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-700">TVA ({quote.tva_percentage}%)</span>
                        <span className="text-gray-700">{quote.tva_amount?.toFixed(2)} €</span>
                  </div>
                      <div className="flex justify-between py-1 font-semibold">
                        <span className="text-gray-700">Prix total</span>
                        <span className="text-gray-700">{quote.total?.toFixed(2)} €</span>
                </div>
                    </div>
                  </div>
                </div>
</div>
    </div>

            {/* Footer */}
            <div className="border-t pt-2 text-gray-700 text-center text-xs leading-3 page-footer">
              {/* 10 rue de la fontaine St germain Soisy-sous-Montmorency 95230<br />
              electricienservicespro@gmail.com<br />
              https://electricien-servicespro.com<br />
              0970705723<br />
              N° de SIRET : 92167724100017 */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
