'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { quotesApi } from '@/api/quotesAPI'
import { productsApi } from '@/api/productsAPI'
import { fetchClients } from '@/api/clientsApi'
import { fetchOrders } from '@/api/orderDetailsApi'
import QuoteTemplate from '@/components/QuoteTemplate'
import ReactDOMServer from 'react-dom/server'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { uploadFile } from '@/api'
import Link from 'next/link'

export default function CreateQuote() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [products, setProducts] = useState([])
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [serviceOrder, setServiceOrder] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [quote, setQuote] = useState({
    client_id: '',
    products: [],
    service: {
      name: '',
      price: ''
    },
    calculations: {
      products_total: 0,
      service_total: 0,
      subtotal: 0,
      tva_percentage: '20',
      tva_amount: 0,
      total: 0
    }
  })
  
  // Fetch initial data
  useEffect(() => {
    console.log("eeeee",orderId);
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch both products and clients
        const [productsData, clientsData] = await Promise.all([
          productsApi.fetchProducts(),
          fetchClients()
        ])
        
        setProducts(productsData)
        setClients(clientsData)
        setFilteredClients(clientsData)
        
        // Only fetch order data if we have an orderId
        if (orderId) {
          try {
            
            const orderData = await fetchOrders(orderId)
            if (!orderData || !orderData.client) {
              throw new Error('Invalid order data received')
            }
            
            setServiceOrder(orderData)
            setSelectedClient(orderData.client)
            setQuote(prev => ({
              ...prev,
              client_id: orderData.client.id,
              service: {
                name: orderData.service_name || '',
                price: parseFloat(orderData.service_price) || 0
              }
            }))
          } catch (orderError) {
            console.error('Error fetching order:', orderError)
            setError('Impossible de récupérer les détails de la commande')
            return
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [orderId])

  // Filter clients based on search query
  useEffect(() => {
        if (!searchQuery) {
      setFilteredClients(clients)
          return
        }
        
          const searchLower = searchQuery.toLowerCase()
    const filtered = clients.filter(client => 
            client.first_name?.toLowerCase().includes(searchLower) ||
            client.last_name?.toLowerCase().includes(searchLower) ||
            client.phone_number?.includes(searchQuery)
          )
    
    setFilteredClients(filtered)
  }, [searchQuery, clients])

  const selectClient = (client) => {
    setSelectedClient(client)
    setQuote(prev => ({
      ...prev,
      client_id: client.id
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!selectedClient) {
      setError('Veuillez sélectionner un client')
      setSubmitting(false)
      return
    }

    try {
      // Format the quote data to match API requirements exactly
      const quoteData = {
        client_id: selectedClient.id,
        order_id: orderId ? parseInt(orderId) : null,
        service_name: quote.service.name || '',
        service_price: parseFloat(quote.service.price) || 0,
        tva_percentage: parseFloat(quote.calculations.tva_percentage) || 0,
        products: selectedProducts
          .filter(p => p.product_id && p.product_id !== '')
          .map(p => ({ 
            id: parseInt(p.product_id),
            custom_price: parseFloat(p.price) || 0,
            quantity: parseInt(p.quantity) || 1
          }))
      };
      
      // Validate required fields
      if (!quoteData.service_name) {
        setError('Le nom du service est requis')
        setSubmitting(false)
        return
      }

      if (!quoteData.service_price) {
        setError('Le prix du service est requis')
        setSubmitting(false)
        return
      }

      if (!quoteData.tva_percentage) {
        setError('Le taux de TVA est requis')
        setSubmitting(false)
        return
      }
      
      console.log('Sending quote data:', quoteData)
      
      const response = await quotesApi.createQuote(quoteData)
      console.log('API Response:', response)

      // Add a small delay before redirecting
      setTimeout(() => {
        router.push('/quotes')
      }, 1000)
    } catch (err) {
      console.error('Error creating quote:', err.response?.data || err)
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors
        const errorMessage = Object.values(validationErrors)
          .flat()
          .join('\n')
        setError(errorMessage)
      } else {
        setError('Une erreur est survenue lors de la création du devis')
      }
      setSubmitting(false)
    }
  }

  const calculateTotals = (selectedProducts, servicePrice, tvaPercentage) => {
    // Calculate products total using custom prices
    const productsTotal = selectedProducts.reduce((sum, item) => {
      if (!item.product_id || !item.price) return sum;
      const quantity = parseInt(item.quantity) || 1;
      const price = parseFloat(item.price) || 0;
      return sum + (price * quantity);
    }, 0);

    // Calculate service total
    const serviceTotal = parseFloat(servicePrice) || 0;

    // Calculate subtotal
    const subtotal = productsTotal + serviceTotal;

    // Calculate TVA
    const tvaAmount = subtotal * (parseFloat(tvaPercentage) || 0) / 100;

    // Calculate final total
    const total = subtotal + tvaAmount;

    return {
      products_total: productsTotal,
      service_total: serviceTotal,
      subtotal: subtotal,
      tva_amount: tvaAmount,
      total: total
    };
  };

  const addProduct = () => {
    const newProduct = { 
      product_id: '',
      quantity: '1',
      price: '' // Add price field
    }
    const updatedProducts = [...selectedProducts, newProduct]
    setSelectedProducts(updatedProducts)
    
    // Update calculations
    const calculations = calculateTotals(
      updatedProducts,
      quote.service.price || 0,
      quote.calculations.tva_percentage || 0
    )

    setQuote(prev => ({
      ...prev,
      products: [...prev.products, newProduct],
      calculations
    }))
  }

  const removeProduct = (index) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index)
    setSelectedProducts(updatedProducts)
    
    // Update calculations
    const calculations = calculateTotals(
      updatedProducts,
      quote.service.price || 0,
      quote.calculations.tva_percentage || 0
    )

    setQuote(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
      calculations
    }))
  }

  const updateProduct = (index, field, value) => {
    const updatedProducts = selectedProducts.map((item, i) => {
      if (i === index) {
        return { 
          ...item, 
          [field]: field === 'quantity' ? (value || '1') : (value || '') 
        }
      }
      return item
    })
    setSelectedProducts(updatedProducts)
    
    // Update calculations
    const calculations = calculateTotals(
      updatedProducts,
      quote.service.price || 0,
      quote.calculations.tva_percentage || 0
    )

    setQuote(prev => ({
      ...prev,
      products: prev.products.map((item, i) => {
        if (i === index) {
          return { 
            ...item, 
            [field]: field === 'quantity' ? (value || '1') : (value || '') 
          }
        }
        return item
      }),
      calculations
    }))
  }

  const handleServicePriceChange = (value) => {
    setQuote(prev => ({
      ...prev,
      service: { ...prev.service, price: value },
      calculations: calculateTotals(
        selectedProducts,
        value || 0,
        prev.calculations.tva_percentage || 0
      )
    }))
  }

  const handleTVAChange = (value) => {
    setQuote(prev => ({
      ...prev,
      calculations: {
        ...calculateTotals(
          selectedProducts,
          prev.service.price || 0,
          value || 0
        ),
        tva_percentage: value
      }
    }))
  }
  

  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform transition-transform duration-300 ease-in-out lg:translate-x-0">
      <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full lg:w-auto">
        <div className="p-4 sm:p-6">
          <Header />
          
          {/* Page Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Créer un devis</h1>
            <Link
              href="/quotes"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 border border-blue-900 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
              Retour aux devis
            </Link>
            </div>
            
          {/* Error Message */}
              {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 border-l-4 border-red-500">
                  <div className="flex">
                    <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
          {/* Main Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Client & Service */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client Selection Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 bg-gradient-to-r from-blue-900 to-blue-800 flex justify-between items-center">
                  <h2 className="text-base font-medium text-white">Informations client</h2>
                  {selectedClient && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClient(null)
                        setQuote(prev => ({ ...prev, client_id: '' }))
                      }}
                      className="text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-0.5 rounded-full transition-colors"
                    >
                      Changer
                    </button>
                  )}
                </div>

                <div className="p-6">
                {!selectedClient ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Rechercher un client..."
                          className="pl-10 w-full rounded-lg border border-gray-300 bg-white py-3 px-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                      />
                    </div>

                    {searchQuery && (
                        <div className="mt-4 max-h-80 overflow-y-auto rounded-lg border border-gray-200">
                          {filteredClients.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                              {filteredClients.map(client => (
                                <div 
                                  key={client.id} 
                                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => selectClient(client)}
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h3 className="font-medium text-gray-900">{client.first_name} {client.last_name}</h3>
                                      <div className="mt-1 text-sm text-gray-500 space-y-1">
                                        <p className="flex items-center">
                                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                          </svg>
                                          {client.phone_number}
                                        </p>
                                        {client.address && (
                                          <p className="flex items-center">
                                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {client.address}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Sélectionner
                                  </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                                  Aucun client trouvé
                            </div>
                            )}
                      </div>
                    )}
                  </div>
                ) : (
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xl">
                        {selectedClient.first_name.charAt(0)}{selectedClient.last_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {selectedClient.first_name} {selectedClient.last_name}
                        </h3>
                        <div className="mt-1 text-sm text-gray-500 space-y-1">
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {selectedClient.phone_number}
                        </p>
                          {selectedClient.address && (
                            <p className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {selectedClient.address}
                        </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Details Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 bg-gradient-to-r from-blue-900 to-blue-800">
                  <h2 className="text-base font-medium text-white">Détails du service</h2>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="service-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom du service
                      </label>
                      <textarea
                        id="service-name"
                        value={quote.service.name || ''}
                        onChange={(e) => setQuote(prev => ({
                          ...prev,
                          service: { ...prev.service, name: e.target.value }
                        }))}
                        className="w-full rounded-lg border border-gray-300 bg-white py-3 px-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black resize-y min-h-[80px]"
                        placeholder="Ex: Installation électrique"
                      />
                    </div>
                    <div>
                      <label htmlFor="service-price" className="block text-sm font-medium text-gray-700 mb-1">
                        Prix du service
                      </label>
                      <div className="relative rounded-lg">
                        <input
                          type="text"
                          id="service-price"
                          value={quote.service.price || ''}
                          onChange={(e) => handleServicePriceChange(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white py-3 px-4 pr-12 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                          placeholder="0.00"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <span className="text-gray-500">€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 bg-gradient-to-r from-blue-900 to-blue-800 flex justify-between items-center">
                  <h2 className="text-base font-medium text-white">Produits</h2>
                  <button
                    type="button"
                    onClick={addProduct}
                    className="inline-flex items-center px-2.5 py-1 bg-white text-blue-900 rounded-full text-xs font-medium hover:bg-blue-50"
                  >
                    <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                    </svg>
                    Ajouter
                  </button>
                </div>

                <div className="p-6">
                  {selectedProducts.length > 0 ? (
                <div className="space-y-4">
                  {selectedProducts.map((item, index) => (
                        <div key={index} className="flex gap-4 items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <select
                          value={item.product_id || ''}
                          onChange={(e) => updateProduct(index, 'product_id', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                        >
                          <option value="">Sélectionner un produit</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || '1'}
                          onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                          placeholder="Qté"
                        />
                      </div>
                      <div className="w-32 relative">
                        <input
                          type="text"
                          value={item.price || ''}
                          onChange={(e) => updateProduct(index, 'price', e.target.value)}
                          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                          placeholder="Prix"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <span className="text-gray-500">€</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                            className="p-2 text-gray-400 hover:text-red-600 focus:outline-none transition-colors"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun produit</h3>
                      <p className="mt-1 text-sm text-gray-500">Commencez par ajouter des produits à votre devis.</p>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={addProduct}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                          </svg>
                          Ajouter un produit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Summary & Submit */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              {/* TVA Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden h-auto">
                <div className="px-4 py-2.5 bg-gradient-to-r from-blue-900 to-blue-800">
                  <h2 className="text-base font-medium text-white">TVA</h2>
              </div>

                <div className="p-6">
                  <label htmlFor="tva-percentage" className="block text-sm font-medium text-gray-700 mb-1">
                    Taux de TVA (%)
                </label>
                  <div className="relative rounded-lg">
                  <input
                    type="text"
                    id="tva-percentage"
                    value={quote.calculations.tva_percentage || ''}
                    onChange={(e) => handleTVAChange(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white py-3 px-4 pr-12 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                    placeholder="20"
                  />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <span className="text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden h-auto">
                <div className="px-4 py-2.5 bg-gradient-to-r from-blue-900 to-blue-800">
                  <h2 className="text-base font-medium text-white">Récapitulatif</h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total produits</span>
                      <span className="font-medium text-gray-900">{quote.calculations.products_total.toFixed(2)}€</span>
                  </div>
                    <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total service</span>
                      <span className="font-medium text-gray-900">{quote.calculations.service_total.toFixed(2)}€</span>
                  </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                    <span className="text-gray-600">Sous-total</span>
                      <span className="font-medium text-gray-900">{quote.calculations.subtotal.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">TVA ({quote.calculations.tva_percentage}%)</span>
                      <span className="font-medium text-gray-900">{quote.calculations.tva_amount.toFixed(2)}€</span>
                  </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-semibold text-blue-900">{quote.calculations.total.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
                <button
                type="button"
                onClick={handleSubmit}
                  disabled={submitting}
                className="w-full py-4 px-6 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                  <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création en cours...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Créer le devis
                  </div>
                  )}
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
