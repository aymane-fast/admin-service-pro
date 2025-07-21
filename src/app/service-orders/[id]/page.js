'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { fetchOrders, fetchPrestataires, assignPrestataire, fetchPayments, fetchQuotes, fetchOrderInvitations, removePrestataire } from '@/api/orderDetailsApi'
import Image from 'next/image'
import paymentsApi from '@/api/paymentsApi'
import prestatairesApi from '@/api/prestatairesAPI'
import SelectPrestataireStep from '@/components/service-order/SelectPrestataireStep'
import api from '@/api'
import { quotesApi } from '@/api/quotesAPI'

// Helper functions at the top level
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // Base URL without /api

export default function OrderDetails() {
  const params = useParams()
  const orderId = params.id
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [OrderData, setOrderData] = useState(null)
  const [prestataires, setPrestataires] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loadingInvitations, setLoadingInvitations] = useState(true)
  const [selectingPrestataire, setSelectingPrestataire] = useState(false)
  const [prestataireSearchTerm, setPrestataireSearchTerm] = useState('') // Renamed from searchTerm
  const [percentages, setPercentages] = useState({})
  const [assigningPrestataire, setAssigningPrestataire] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [payments, setPayments] = useState({ received: [], sent: [] })
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [paymentError, setPaymentError] = useState('')
  const [showPrestataireModal, setShowPrestataireModal] = useState(false)
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false)
  const [isUploadInvoiceModalOpen, setIsUploadInvoiceModalOpen] = useState(false)
  const [uploadingInvoice, setUploadingInvoice] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [paymentData, setPaymentData] = useState({
    order_id: '',
    amount: '',
    payment_method: '',
    payment_date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('images')
  const [images, setImages] = useState([])
  const [quotes, setQuotes] = useState([])
  const [loadingQuotes, setLoadingQuotes] = useState(true)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [filteredPrestataires, setFilteredPrestataires] = useState([])
  const [loadingPrestataires, setLoadingPrestataires] = useState(false)
  const [prestataireError, setPrestataireError] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)
  const [removalReason, setRemovalReason] = useState('')
  const [removingPrestataire, setRemovingPrestataire] = useState(false)
  const [attachingQuote, setAttachingQuote] = useState(false)
  const [quoteSearchTerm, setQuoteSearchTerm] = useState('')
  const [filteredQuotes, setFilteredQuotes] = useState([])
  const [quoteError, setQuoteError] = useState('')
  const [isSupplierInvoiceModalOpen, setIsSupplierInvoiceModalOpen] = useState(false);
  const [uploadingSupplierInvoice, setUploadingSupplierInvoice] = useState(false);
  const [supplierInvoiceError, setSupplierInvoiceError] = useState('');
  const [supplierInvoiceData, setSupplierInvoiceData] = useState({
    invoice: null,
    amount: '',
    invoice_date: '',
    supplier_name: '',
    notes: ''
  });
  const [supplierInvoices, setSupplierInvoices] = useState([]);
  // Add new state for invoices
  const [invoices, setInvoices] = useState([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  // Add new state for the link invoice modal
  const [isLinkInvoiceModalOpen, setIsLinkInvoiceModalOpen] = useState(false)
  const [availableInvoices, setAvailableInvoices] = useState([])
  const [loadingAvailableInvoices, setLoadingAvailableInvoices] = useState(false)
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('')
  const [filteredAvailableInvoices, setFilteredAvailableInvoices] = useState([])

  const tabs = [
    { id: 'images', label: 'Images' },
    { id: 'payments', label: 'Paiements' },
    { id: 'documents', label: 'Documents' },
    { id: 'additional', label: 'Informations supplémentaires' }
  ];

  const statusOptions = {
    'En Cours': 'bg-yellow-100 text-yellow-800',
    'Terminé': 'bg-green-100 text-green-800',
    'Desactivé': 'bg-red-100 text-red-800'
  }

  // Separate function to fetch payments
  const fetchPaymentData = async (orderId) => {
    if (!orderId) {
      console.error('No order ID provided for payment fetch');
      return;
    }
    
    try {
      setLoadingPayments(true);
      const response = await paymentsApi.getPaymentsByOrder(orderId);
      
      if (response?.data) {
        // Group payments by direction and entity_type
        const groupedPayments = {
          received: response.data.filter(payment => 
            payment.direction === 'received' && payment.order_id === parseInt(orderId)
          ),
          sent: response.data.filter(payment => 
            payment.direction === 'sent' && payment.order_id === parseInt(orderId)
          )
        };

        setPayments(groupedPayments);
      }
      setPaymentError('');
    } catch (err) {
      console.error('Error fetching payments:', err);
      setPaymentError('Failed to load payments');
      setPayments({ received: [], sent: [] });
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadPrestataires = async () => {
    try {
        const data = await fetchPrestataires() // Use the function from orderDetailsApi.js
        setPrestataires(data)
    } catch (error) {
        console.error('Error loading prestataires:', error)
        setError('Erreur lors du chargement des prestataires')
    }
}

  const handleChoosePrestataire = async (prestataireId) => {
    try {
      setAssigningPrestataire(true)
      const updatedOrder = await assignPrestataire(orderId, prestataireId)

      // Check if we have a valid response
      if (!updatedOrder) {
        throw new Error('Aucune donnée reçue du serveur')
      }

      // Update the order data, ensuring we preserve all existing data
      setOrderData(prevData => ({
        ...prevData, // Keep all existing data
        ...updatedOrder, // Merge with updated data
        client: updatedOrder.client || prevData.client, // Ensure client data is preserved
        prestataire: updatedOrder.prestataire,
        prestataire_id: prestataireId
      }))

      // Close the modal and clear error
      setShowPrestataireModal(false)
      setError('')
      
      // Show success message
      alert('Prestataire assigné avec succès')
    } catch (error) {
      console.error('Error assigning prestataire:', error)
      setError(error.message || 'Erreur lors de l\'assignation du prestataire')
      alert(error.message || 'Erreur lors de l\'assignation du prestataire')
    } finally {
      setAssigningPrestataire(false)
    }
}

  const handleStatusChange = async () => {
    if (!orderId || !selectedStatus) return

    setChangingStatus(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          status: selectedStatus
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // Update local state
      setOrderData(prev => ({
        ...prev,
        status: selectedStatus
      }))

      setIsConfirmModalOpen(false)
      setIsStatusModalOpen(false)
      setSelectedStatus(null)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erreur lors de la mise à jour du statut')
    } finally {
      setChangingStatus(false)
    }
  }

  const fetchOrderData = async () => {
    try {
      setLoading(true)
      setError(null)
      // console.log('Fetching order with ID:', orderId)
      const data = await fetchOrders(orderId)
      // console.log('Order data received:', data)
      setOrderData(data)
      // Set images from the order data
      setImages(data?.images || [])
      
      // If you need to fetch payments as well
      if (data) {
        await fetchPaymentData(orderId)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setError(error.message || 'Failed to fetch order details')
    } finally {
      setLoading(false)
    }
  }

  const fetchInvitations = async () => {
    if (!orderId) return
    
    try {
      setLoadingInvitations(true)
      const data = await fetchOrderInvitations(orderId)
      setInvitations(data)
    } catch (error) {
      console.error('Error fetching invitations:', error)
    } finally {
      setLoadingInvitations(false)
    }
  }

  const handleSelectPrestataire = async (prestataireId) => {
    if (!orderId) return
    
    try {
      setSelectingPrestataire(true)
      const response = await api.post(`/orders/${orderId}/select-prestataire`, {
        prestataire_id: prestataireId
      })
      
      if (response.data.status === 'success') {
        setOrderData(response.data.data)
        await fetchInvitations() // Refresh invitations list
        alert('Prestataire assigné avec succès')
      }
    } catch (error) {
      console.error('Error selecting prestataire:', error)
      alert('Erreur lors de la sélection du prestataire')
    } finally {
      setSelectingPrestataire(false)
    }
  }

  // Define loadInitialData at component level
    const loadInitialData = async () => {
      try {
      setLoading(true);
      setError(null);
        
        // Fetch order data
      const orderData = await fetchOrders(orderId);
      setOrderData(orderData);
      setImages(orderData?.images || []);
        
        // Fetch invitations
      const invitationsData = await fetchOrderInvitations(orderId);
      setInvitations(invitationsData || []);
      
      // Fetch attached quotes
      await fetchOrderQuotes();
      
      // Fetch supplier invoices
      await fetchSupplierInvoices();
        
        // Fetch payments
        if (orderData) {
        await fetchPaymentData(orderId);
        }
      } catch (error) {
      console.error('Error fetching initial data:', error);
      setError(error.message || 'Failed to fetch order details');
      } finally {
      setLoading(false);
      setLoadingInvitations(false);
    }
  };

  // Update the main useEffect
  useEffect(() => {
    if (orderId) {
      loadInitialData();
    }
  }, [orderId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePercentageChange = (prestataireId, value) => {
    setPercentages(prev => ({
      ...prev,
      [prestataireId]: value
    }))
  }

  const handleAssignPrestataire = async (prestataireId) => {
    const percentage = percentages[prestataireId]
    if (!percentage) {
      alert('Veuillez entrer un pourcentage')
      return
    }

    try {
      setAssigningPrestataire(true)
      const updatedOrder = await assignPrestataire(orderId, prestataireId, percentage)
      setOrderData(updatedOrder)
      alert('Prestataire assigné avec succès')
      
      // Reset the percentage for this prestataire
      setPercentages(prev => {
        const newPercentages = { ...prev }
        delete newPercentages[prestataireId]
        return newPercentages
      })
      setShowPrestataireModal(false)
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de l\'assignation du prestataire')
    } finally {
      setAssigningPrestataire(false)
    }
  }

  const getPrestataireName = () => {
    if (!OrderData.prestataire_id) return "Non choisi";
    const prestataire = prestataires.find(p => p.id === OrderData.prestataire_id);
    if (!prestataire) return "Non choisi";
    return `${prestataire.first_name} ${prestataire.last_name}`;
  }

  const getPrestataireRating = () => {
    if (!OrderData.prestataire_id) return "Non choisi";
    const prestataire = prestataires.find(p => p.id === OrderData.prestataire_id);
    if (!prestataire) return "Non choisi";
    return `${prestataire.rating}`;
  }

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'refused':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'Accepté'
      case 'refused':
        return 'Refusé'
      default:
        return 'En attente'
    }
  }

  const getPrestataireStatusDisplay = () => {
    if (!OrderData.prestataire_status) return null

    let statusClass = getStatusBadgeClass(OrderData.prestataire_status)
    let statusText = getStatusText(OrderData.prestataire_status)
    let showChangeButton = false

    switch (OrderData.prestataire_status.toLowerCase()) {
      case 'accepted':
        statusClass = 'bg-green-100 text-green-800'
        statusText = 'Accepté'
        break
      case 'refused':
        statusClass = 'bg-red-100 text-red-800'
        statusText = 'Refusé'
        showChangeButton = true
        break
      default:
        statusClass = 'bg-yellow-100 text-yellow-800'
        statusText = 'En attente'
    }

    return (
      <div className="flex items-center space-x-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
          {statusText}
        </span>
        {showChangeButton && (
          <button
            onClick={() => {
              loadPrestataires()
              setShowPrestataireModal(true)
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
          >
            Changer
          </button>
        )}
      </div>
    )
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!OrderData?.id || !OrderData?.client?.id) {
      alert('Données de commande invalides');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await paymentsApi.createPayment({
        type: 'client',
        amount: parseFloat(paymentData.amount),
        payment_method: paymentData.payment_method,
        order_id: OrderData.id,
        client_id: OrderData.client.id,
        notes: `Payment for order #${OrderData.id}`
      });

      // Refresh payments after successful creation
      await fetchPaymentData(OrderData.id);
      setIsPaymentModalOpen(false);
      setPaymentData({
        order_id: '',
        amount: '',
        payment_method: '',
        payment_date: '',
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error creating payment: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    
    // If the path already starts with http/https, return as is
    if (imagePath.startsWith('http')) return imagePath
    
    // If the path already includes /storage/, don't add it again
    if (imagePath.includes('/storage/')) {
      return `${BASE_URL}${imagePath}`
    }
    
    // Remove any leading slashes and 'storage/' from the path
    const cleanPath = imagePath.replace(/^\/+|^storage\//, '')
    
    // Construct the full URL
    return `${BASE_URL}/storage/${cleanPath}`
  }

  const renderImages = () => {
    if (!images || images.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          Aucune image disponible pour cet ordre de service
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {images.map((image, index) => {
          const imageUrl = getImageUrl(image)
          if (!imageUrl) return null

          return (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={imageUrl}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const placeholder = document.createElement('div');
                  placeholder.className = 'w-full h-full flex items-center justify-center bg-gray-100';
                  placeholder.innerHTML = `
                    <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  `;
                  e.target.parentNode.appendChild(placeholder);
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity">
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <span className="bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg">
                    Voir en grand
                  </span>
                </a>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Update fetchOrderQuotes to handle both quotes and invoices
  const fetchOrderQuotes = async () => {
    try {
      setLoadingInvoices(true)
      console.log('Fetching quotes/invoices for order:', orderId)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quotes?order_id=${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch quotes/invoices for order')
      }

      const responseData = await response.json()
      
      // Handle the 'data' wrapper in the response
      const quotesData = responseData.data || responseData
      
      // Separate quotes and invoices (accepted quotes are invoices)
      const allQuotes = Array.isArray(quotesData) ? quotesData : []
      const acceptedQuotes = allQuotes.filter(quote => quote.status === 'accepted')
      const pendingQuotes = allQuotes.filter(quote => quote.status !== 'accepted')
      
      // Update OrderData with quotes and invoices
      setOrderData(prev => ({
        ...prev,
        quotes: pendingQuotes
      }))
      setInvoices(acceptedQuotes)
      
    } catch (error) {
      console.error('Error fetching quotes/invoices for order:', error)
    } finally {
      setLoadingInvoices(false)
    }
  }

  // Update the useEffect that calls fetchQuotes
  useEffect(() => {
    if (orderId) {
      fetchOrderQuotes();
    }
  }, [orderId]);

  // Update the tab change useEffect to use fetchOrderQuotes
  useEffect(() => {
    if (activeTab === 'documents' && orderId) {
      // Refresh quotes and invoices when switching to documents tab
      fetchOrderQuotes();
      fetchSupplierInvoices();
    }
  }, [activeTab, orderId]);

  // Update the fetchSupplierInvoices function
  const fetchSupplierInvoices = async () => {
    try {
      console.log('Fetching supplier invoices for order:', orderId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}/supplier-invoices`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch supplier invoices');
      }

      const data = await response.json();
      
      // The response is directly an array, no need to access data.data
      setSupplierInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching supplier invoices:', error);
    }
  };

  // This function loads all available quotes that aren't attached to any order (for the modal)
  const loadAvailableQuotes = async () => {
    try {
      setLoadingQuotes(true);
      console.log('Loading all available quotes for selection...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quotes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }

      const data = await response.json();
      console.log('All quotes response:', data);
      
      // Extract quotes from data wrapper if present
      const quotesData = data.data || data;
      
      if (!Array.isArray(quotesData)) {
        console.error('Invalid quotes response:', quotesData);
        setQuoteError('Format de réponse invalide');
        setLoadingQuotes(false);
        return;
      }
      
      // Filter quotes that are NOT already attached to any order
      const availableQuotes = quotesData.filter(quote => !quote.order_id);
      console.log('Available quotes (not attached to any order):', availableQuotes);
      
      setQuotes(availableQuotes);
      setFilteredQuotes(availableQuotes);
      setQuoteError('');
    } catch (error) {
      console.error('Error loading quotes:', error);
      setQuoteError('Failed to load quotes');
      setQuotes([]);
      setFilteredQuotes([]);
    } finally {
      setLoadingQuotes(false);
    }
  };

  // Update the modal open handler to use loadAvailableQuotes
  useEffect(() => {
    if (isAddQuoteModalOpen) {
      loadAvailableQuotes();
    }
  }, [isAddQuoteModalOpen]);

  // Update the quote modal content to show quote status
  const getQuoteStatusBadge = (quote) => {
    if (quote.order_id === parseInt(orderId)) {
      return 'bg-blue-100 text-blue-800';
    }
    if (quote.order_id) {
      return 'bg-gray-100 text-gray-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getQuoteStatusText = (quote) => {
    if (quote.order_id === parseInt(orderId)) {
      return 'Attaché à cet ordre';
    }
    if (quote.order_id) {
      return 'Attaché à un autre ordre';
    }
    return 'Disponible';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  // Add this function to fetch prestataires
  const searchPrestataires = async (query) => {
    if (!query?.trim()) {
      setFilteredPrestataires([])
      return
    }

    try {
      setLoadingPrestataires(true)
      setPrestataireError('')
      const response = await prestatairesApi.fetchPrestataires()
      
      if (!response) {
        throw new Error('Failed to fetch prestataires')
      }
      
      const filtered = response.filter(prestataire => 
        prestataire.first_name?.toLowerCase().includes(query.toLowerCase()) ||
        prestataire.last_name?.toLowerCase().includes(query.toLowerCase()) ||
        prestataire.email?.toLowerCase().includes(query.toLowerCase()) ||
        prestataire.phone_number?.includes(query)
      )
      
      setFilteredPrestataires(filtered)
    } catch (error) {
      console.error('Error searching prestataires:', error)
      setPrestataireError('Erreur lors de la recherche des prestataires')
      setFilteredPrestataires([])
    } finally {
      setLoadingPrestataires(false)
    }
  }

  // Add debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (prestataireSearchTerm) {
        searchPrestataires(prestataireSearchTerm)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [prestataireSearchTerm])

  const getInvitationStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800'
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800'
      case 'refused':
        return 'bg-rose-100 text-rose-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getInvitationStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente'
      case 'accepted':
        return 'Acceptée'
      case 'refused':
        return 'Refusée'
      default:
        return 'Inconnu'
    }
  }

  const handleRemovePrestataire = async () => {
    if (!orderId) {
      alert('ID de l\'ordre de service non spécifié')
      return
    }
    
    try {
      setRemovingPrestataire(true)
      const response = await removePrestataire(orderId, removalReason || undefined)
      
      if (response.status === 'success') {
        // Update the order data
        setOrderData(prevData => ({
          ...prevData,
          prestataire: null,
          prestataire_id: null
        }))
        
        // Close modal and reset form
        setIsRemoveModalOpen(false)
        setRemovalReason('')
        
        // Show success message
        alert('Prestataire retiré avec succès')
      }
    } catch (error) {
      console.error('Error removing prestataire:', error)
      // Show user-friendly error message
      alert(error.message || 'Erreur lors du retrait du prestataire')
    } finally {
      setRemovingPrestataire(false)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadError('Veuillez sélectionner un fichier PDF');
      return;
    }

    setSelectedFile(file);
    setUploadingInvoice(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('order_id', orderId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/upload-invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du fichier');
      }

      // Close modal and reset state
      setIsUploadInvoiceModalOpen(false);
      setSelectedFile(null);
      alert('Facture téléchargée avec succès');
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError(error.message || 'Erreur lors du téléchargement du fichier');
    } finally {
      setUploadingInvoice(false);
    }
  };

  const handleQuoteSelection = async (quote) => {
    try {
      setAttachingQuote(true);
      console.log('Attaching quote:', quote.id, 'to order:', orderId);
      
      // First, update the quote to link it to this order
      const quoteResponse = await fetch(`http://127.0.0.1:8000/api/quotes/${quote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          order_id: parseInt(orderId)
        })
      });

      const quoteResponseText = await quoteResponse.text();
      console.log('Quote update response:', quoteResponseText);

      if (!quoteResponse.ok) {
        throw new Error(`Failed to update quote: ${quoteResponseText}`);
      }

      // Update local state with the new quote data
      setOrderData(prev => ({
        ...prev,
        quote: quote
      }));

      // Refresh order data to ensure we have the latest state
      await fetchOrderData();

      // Close modal and show success message
      setIsAddQuoteModalOpen(false);
      alert('Devis attaché avec succès');
    } catch (error) {
      console.error('Error attaching quote:', error);
      alert(error.message || 'Erreur lors de l\'attachement du devis');
    } finally {
      setAttachingQuote(false);
    }
  };

  // Update the quote search handler
  const handleQuoteSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setQuoteSearchTerm(searchTerm);
    
    if (!quotes || quotes.length === 0) {
      // If we don't have quotes loaded, reload them
      loadAvailableQuotes();
      return;
    }
    
    if (!searchTerm) {
      // If search is cleared, show all available quotes (which already filters out attached quotes)
      setFilteredQuotes(quotes);
      return;
    }
    
    // Filter unattached quotes by search term
    const filtered = quotes.filter(quote => 
      (quote.id && quote.id.toString().includes(searchTerm)) || 
      (quote.client && `${quote.client.first_name} ${quote.client.last_name}`.toLowerCase().includes(searchTerm)) ||
      (quote.service_name && quote.service_name.toLowerCase().includes(searchTerm)) ||
      (quote.total && quote.total.toString().includes(searchTerm))
    );
    
    setFilteredQuotes(filtered);
  };

  // Add useEffect to load attached quotes on component mount
  useEffect(() => {
    if (orderId) {
      fetchOrderQuotes();
    }
  }, [orderId]);

  // Add this function to handle supplier invoice upload
  const handleSupplierInvoiceSubmit = async (e) => {
    e.preventDefault();
    setUploadingSupplierInvoice(true);
    
    try {
      const formData = new FormData();
      formData.append('invoice', supplierInvoiceData.invoice);
      if (supplierInvoiceData.amount) formData.append('amount', supplierInvoiceData.amount);
      if (supplierInvoiceData.invoice_date) formData.append('invoice_date', supplierInvoiceData.invoice_date);
      if (supplierInvoiceData.supplier_name) formData.append('supplier_name', supplierInvoiceData.supplier_name);
      if (supplierInvoiceData.notes) formData.append('notes', supplierInvoiceData.notes);

      const response = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}/supplier-invoices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload invoice');
      }

      // Close modal and reset form
      setIsSupplierInvoiceModalOpen(false);
      setSupplierInvoiceData({
        invoice: null,
        amount: '',
        invoice_date: '',
        supplier_name: '',
        notes: ''
      });
      
      // Refresh the supplier invoices list
      await fetchSupplierInvoices();
      
    } catch (error) {
      console.error('Error uploading invoice:', error);
      setSupplierInvoiceError("Une erreur s'est produite lors de l'envoi de la facture");
    } finally {
      setUploadingSupplierInvoice(false);
    }
  };

  // Add a function to get the download URL
  const getInvoiceDownloadUrl = (invoice) => {
    return `http://127.0.0.1:8000/storage/${invoice.file_path}`;
  };

  // Add a function to render invoices section
  const renderInvoicesSection = () => {
    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Factures</h3>
          <button
            onClick={() => setIsLinkInvoiceModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Lier une facture existante
          </button>
        </div>
        <div className="mt-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix HT</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TVA</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total TTC</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loadingInvoices ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        <span className="ml-2">Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Aucune facture trouvée
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{invoice.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.service_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(invoice.service_price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.tva_percentage}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(invoice.total)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.payment_status === 'paid' ? 'Payé' : 'Non payé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <a
                          href={`http://127.0.0.1:8000/api/quotes/${invoice.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Télécharger PDF
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Add function to fetch available invoices (accepted quotes not linked to any order)
  const fetchAvailableInvoices = async () => {
    try {
      setLoadingAvailableInvoices(true)
      const response = await fetch('http://127.0.0.1:8000/api/quotes?status=accepted', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch available invoices')
      }

      const data = await response.json()
      const invoicesData = data.data || data
      // Filter out invoices that are already linked to orders
      const availableOnes = invoicesData.filter(invoice => !invoice.order_id)
      setAvailableInvoices(availableOnes)
      setFilteredAvailableInvoices(availableOnes)
    } catch (error) {
      console.error('Error fetching available invoices:', error)
    } finally {
      setLoadingAvailableInvoices(false)
    }
  }

  // Add function to handle invoice search
  const handleInvoiceSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase()
    setInvoiceSearchTerm(searchTerm)
    
    if (!searchTerm) {
      setFilteredAvailableInvoices(availableInvoices)
      return
    }
    
    const filtered = availableInvoices.filter(invoice => 
      (invoice.id && invoice.id.toString().includes(searchTerm)) ||
      (invoice.service_name && invoice.service_name.toLowerCase().includes(searchTerm)) ||
      (invoice.total && invoice.total.toString().includes(searchTerm))
    )
    setFilteredAvailableInvoices(filtered)
  }

  // Add function to handle invoice selection
  const handleInvoiceSelection = async (invoice) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/quotes/${invoice.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          order_id: orderId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to link invoice')
      }

      // Refresh the invoices data
      fetchOrderQuotes()
      setIsLinkInvoiceModalOpen(false)
      alert('Facture liée avec succès')
    } catch (error) {
      console.error('Error linking invoice:', error)
      alert('Erreur lors de la liaison de la facture')
    }
  }

  // Update useEffect to load available invoices when modal opens
  useEffect(() => {
    if (isLinkInvoiceModalOpen) {
      fetchAvailableInvoices()
    }
  }, [isLinkInvoiceModalOpen])

  // Add a helper function to determine the document action button
  const getDocumentActionButton = () => {
    // Check if there's an invoice (accepted quote)
    if (invoices && invoices.length > 0) {
      return (
        <a
          href={`http://127.0.0.1:8000/api/quotes/${invoices[0].id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Voir facture
        </a>
      );
    }
    
    // Check if there's a pending quote
    if (OrderData?.quotes && OrderData.quotes.length > 0) {
      return (
  <>
        <Link
          href={`/quotes/edit/${OrderData.quotes[0].id}`}
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Modifier devis
        </Link>
        <Link
          href={`/quotes/${OrderData.quotes[0].id}`}
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-400 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Voir devis
        </Link>
  </>
      );
    }
    
    // No quote or invoice exists, show create button
    return (
      <Link
        href={`/quotes/create?order_id=${orderId}`}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Créer devis
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1">
          <div className="p-6 border-b border-gray-200">
            <Header />
          </div>
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1">
          <div className="p-6 border-b border-gray-200">
            <Header />
          </div>
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!OrderData) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1">
          <div className="p-6 border-b border-gray-200">
            <Header />
          </div>
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">Ordre de service non trouvé</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 lg:h-screen transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar 
          isOpen={isSidebarOpen} 
          closeSidebar={() => setIsSidebarOpen(false)} 
        />
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 w-full lg:w-auto overflow-x-hidden">
        <div className="p-6 border-b border-gray-200 bg-white">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>
        <main className="flex-1 p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Blue Header Line */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-4 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-xl font-bold text-white">Détails de l'ordre de service</h1>
                    <p className="text-blue-100 text-sm mt-1">Informations détaillées de l'ordre de service</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsStatusModalOpen(true)}
                      className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Changer le statut
                    </button>
                    {getDocumentActionButton()}
                  </div>
                </div>
              </div>

              {/* Content inside the white container */}
              <div className="p-8">
                {/* Client Details Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                  <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      Détails du client
                    </h2>
                  </div>
                  <div className="p-6">
                    {OrderData?.client ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gray-50/50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600 uppercase">Nom</p>
                          <p className="mt-1 text-gray-900 font-medium">
                            {OrderData.client.first_name} {OrderData.client.last_name}
                          </p>
                        </div>
                        <div className="bg-gray-50/50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600 uppercase">Email</p>
                          <p className="mt-1 text-gray-900 font-medium">{OrderData.client.email || 'Non renseigné'}</p>
                        </div>
                        <div className="bg-gray-50/50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600 uppercase">Téléphone</p>
                          <p className="mt-1 text-gray-900 font-medium">{OrderData.client.phone_number || 'Non renseigné'}</p>
                        </div>
                        <div className="bg-gray-50/50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600 uppercase">Adresse</p>
                          <p className="mt-1 text-gray-900 font-medium">{OrderData.client.address || 'Non renseigné'}</p>
                        </div>
                        <div className="bg-gray-50/50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600 uppercase">Ville</p>
                          <p className="mt-1 text-gray-900 font-medium">{OrderData.client.city || 'Non renseigné'}</p>
                        </div>
                        <div className="bg-gray-50/50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600 uppercase">Code postal</p>
                          <p className="mt-1 text-gray-900 font-medium">{OrderData.client.zip_code || 'Non renseigné'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune information client</h3>
                        <p className="mt-1 text-sm text-gray-500">Les détails du client ne sont pas disponibles.</p>
                      </div>
                    )}
                  </div>
                </div>
{/* Partner Section */}
<div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
  <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <div className="p-2 bg-purple-50 rounded-lg">
        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      Partenaire
    </h2>
  </div>
  <div className="p-6">
    {OrderData.partner ? (
      <div className="mb-6">
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800">Partenaire sélectionné</h3>
                <div className="mt-2 text-sm text-dark-900">
                  {OrderData.partner.name}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {OrderData.partner.type}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {OrderData.partner.status}
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-purple-600">Email</p>
              <p className="text-sm text-gray-900 font-medium">{OrderData.partner.email}</p>
            </div>
            <div>
              <p className="text-sm text-purple-600">Téléphone</p>
              <p className="text-sm text-gray-900 font-medium">{OrderData.partner.phone}</p>
            </div>
            <div>
              <p className="text-sm text-purple-600">Adresse</p>
              <p className="text-sm text-gray-900 font-medium">{OrderData.partner.address}</p>
            </div>
            <div>
              <p className="text-sm text-purple-600">Commission</p>
              <p className="text-sm text-gray-900 font-medium">{Math.floor(OrderData.partner.commission)}%</p>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="text-center py-4 text-slate-700">
        Aucun partenaire associé à cette commande
      </div>
    )}
  </div>
</div>

                {/* Prestataire Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                  <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      Prestataire
                    </h2>
                  </div>
                  <div className="p-6">
                    {OrderData.prestataire ? (
                      <div className="mb-6">
                        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Prestataire sélectionné</h3>
                                <div className="mt-2  text-sm text-green-700">
                                  {OrderData.prestataire.first_name} {OrderData.prestataire.last_name}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => setIsRemoveModalOpen(true)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Retirer le prestataire
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Prestataires invités</h3>
                        <button
                          onClick={() => setShowPrestataireModal(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Inviter des prestataires
                        </button>
                      </div>

                      {loadingInvitations ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="mt-2 text-slate-800">Chargement des invitations...</p>
                        </div>
                      ) : invitations.length > 0 ? (
                        <div className="mt-4">
                          <h3 className="text-blue-600 font-semibold mb-3">Invitations envoyées</h3>
                          <div className="space-y-3">
                            {invitations.map((invitation) => (
                              <div key={invitation.id} className="border rounded-lg p-4 bg-white shadow-sm">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-slate-900">
                                      {invitation.prestataire?.first_name} {invitation.prestataire?.last_name}
                                    </p>
                                    <p className="text-sm text-slate-600">{invitation.prestataire?.email}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getInvitationStatusBadge(invitation.status)}`}>
                                      {getInvitationStatusText(invitation.status)}
                                    </span>
                                    {invitation.status === 'accepted' && !OrderData.prestataire_id && (
                                      <button
                                        onClick={() => handleSelectPrestataire(invitation.prestataire.id)}
                                        disabled={selectingPrestataire}
                                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                          selectingPrestataire ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                      >
                                        {selectingPrestataire ? 'Attribution...' : 'Attribuer le job'}
                                      </button>
                                    )}

                                  </div>
                                </div>
                                
                                {invitation.status === 'refused' && invitation.refusal_reason && (
                                  <p className="mt-2 text-sm text-rose-600">
                                    Raison du refus: {invitation.refusal_reason}
                                  </p>
                                )}
                                <p className="text-xs text-slate-600 mt-2">
                                  Invité le {formatDate(invitation.created_at)}
                                </p>
                              </div>
                            ))}
                          </div>
                          
                        </div>
                        
                      ) : (
                        <div className="text-center py-4 text-slate-700">
                          Aucune invitation envoyée
                        </div>
                      )}
                    </div>
                  </div>
                </div>
{/* // Commission Section */}
<div className="mt-6 pt-6 border-t border-gray-100">
  <div className="flex items-start">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
    <div className="ml-4 flex-1">
      <h3 className="text-lg font-medium text-gray-900">Commission</h3>
      <div className="mt-2 bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Pourcentage de commission:</span>
<span className="font-medium text-gray-900">
  {Math.floor(OrderData?.prestataire?.commission_percentage ?? 0)}%
</span>
        </div>
      
      </div>
    </div>
  </div>
</div>

                {/* Service Order Details Card */}

                {/* Description Section */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-medium text-gray-900">Description du service</h3>
                          <div className="mt-2 bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {OrderData.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                  <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    
                  </div>
                </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      
                      
                      
                      
                      
                    </div>

                
                <div className="bg-white rounded-lg shadow-sm">
                  {/* Tabs Header */}
                  <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-4 px-6 inline-flex items-center gap-2 border-b-2 font-medium text-sm
                            ${activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                  {/* <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          {!hasInvoice ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900">Facture Fournisseur</h3>
                                  <p className="text-sm text-gray-500">Télécharger la facture fournisseur (PDF uniquement)</p>
                                </div>
                              </div>
                              <div className="relative">
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={handleFileUpload}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  disabled={uploading}
                                />
                                <button
                                  type="button"
                                  className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  {uploading ? (
                                    <>
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Téléchargement...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                      </svg>
                                      Télécharger
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900">Facture Fournisseur</h3>
                                  <a
                                    href={`${process.env.NEXT_PUBLIC_API_URL}/files/factures/facture-${params.id}.pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    Voir la facture fournisseur
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                   */}

                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === 'payments' && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-900">Paiements</h3>
                          <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Ajouter un paiement
                          </button>
                        </div>

                        {loadingPayments ? (
                          <div className="text-center py-4">Chargement des paiements...</div>
                        ) : paymentError ? (
                          <div className="text-center text-red-600 py-4">{paymentError}</div>
                        ) : (
                          <div className="space-y-6">
                            {/* Received Payments (Client) */}
                            <div className="bg-white shadow rounded-lg overflow-hidden">
                              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                  Paiements reçus (Client)
                                </h3>
                              </div>
                              <div className="px-4 py-5 sm:p-6">
                                {payments.received.length === 0 ? (
                                  <p className="text-gray-500 text-center">Aucun paiement reçu</p>
                                ) : (
                                  <div className="space-y-4">
                                    {payments.received.map((payment) => (
                                      <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                          <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
                                            </div>
                                          </div>
                                          <div>
                                            <p className="text-lg font-medium text-gray-900">
                                              {parseFloat(payment.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                              {new Date(payment.payment_date).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                              })}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                          <span className={`px-3 py-1 text-sm font-medium rounded-full
                                            ${payment.payment_method === 'credit_card' ? 'bg-blue-100 text-blue-800' :
                                              payment.payment_method === 'cash' ? 'bg-green-100 text-green-800' :
                                              'bg-purple-100 text-purple-800'}`}>
                                            {payment.payment_method === 'credit_card' ? 'Carte bancaire' :
                                             payment.payment_method === 'cash' ? 'Espèces' : 'Virement'}
                                          </span>
                                          <Link
                                            href={`/payments/${payment.entity_type}/${payment.id}/details`}
                                            className="text-blue-600 hover:text-blue-800"
                                          >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                          </Link>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            
                          </div>
                        )}
                      </div>
                    )}

                  
                    {activeTab === 'images' && (
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Images</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Images liées à cet ordre de service
                          </p>
                        </div>
                        {renderImages()}
                      </div>
                    )}

                    {activeTab === 'additional' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                              <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              Prix
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                                value={OrderData.price || ''}
                                onChange={(e) => {/* Add handler */}}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                              <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Note
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              </div>
                              <textarea
                                placeholder="Ajouter une note pour le prestataire"
                                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md resize-none h-[38px] text-gray-900"
                                value={OrderData.note || ''}
                                onChange={(e) => {/* Add handler */}}
                              ></textarea>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Enregistrer
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === 'documents' && (
                      <div className="space-y-8">
                        {/* Document Section Header */}
                        <div className="bg-white p-6 rounded-lg shadow">
                          <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents de la commande</h2>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-800">Devis</span>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                  {OrderData?.quotes?.length || 0}
                                </span>
                              </div>
                              <p className="text-xs text-blue-600">Devis en attente d'acceptation</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-green-800">Factures</span>
                                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                  {invoices?.length || 0}
                                </span>
                              </div>
                              <p className="text-xs text-green-600">Devis acceptés et convertis en factures</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-purple-800">Factures Fournisseur</span>
                                <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                  {supplierInvoices?.length || 0}
                                </span>
                              </div>
                              <p className="text-xs text-purple-600">Factures des fournisseurs</p>
                            </div>
                          </div>
                        </div>

                        {/* Quotes Section */}
                        {(!invoices || invoices.length === 0) && (
                          <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                              <div className="flex justify-between items-center">
                                        <div>
                                  <h3 className="text-lg font-medium text-gray-900">Devis en attente</h3>
                                  <p className="mt-1 text-sm text-gray-500">
                                    Devis qui nécessitent une acceptation pour être convertis en factures
                                  </p>
                                </div>
                            <button
                              onClick={() => setIsAddQuoteModalOpen(true)}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                              Ajouter un devis
                            </button>
                          </div>
                            </div>
                            {OrderData?.quotes?.length > 0 ? (
                              <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix HT</th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TVA</th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total TTC</th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {OrderData?.quotes?.map((quote) => (
                                      <tr key={quote.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{quote.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quote.service_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(quote.service_price)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quote.tva_percentage}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(quote.total)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getQuoteStatusBadge(quote)}`}>
                                          {getQuoteStatusText(quote)}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          <a
                                            href={`http://127.0.0.1:8000/api/quotes/${quote.id}/pdf`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                          >
                                            Voir PDF
                                          </a>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="p-6 text-center">
                                <div className="mx-auto h-12 w-12 text-gray-400">
                                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                </div>
                                <p className="mt-2 text-sm font-medium text-gray-900">Aucun devis en attente</p>
                                <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un devis en cliquant sur le bouton ci-dessus</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Invoices Section */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                          <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">Factures</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  Devis acceptés et convertis en factures
                                </p>
                              </div>
                                          <button
                                onClick={() => setIsLinkInvoiceModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                          >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                Lier une facture existante
                                          </button>
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix HT</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TVA</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total TTC</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {loadingInvoices ? (
                                  <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center">
                                      <div className="flex justify-center items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                                        <span className="ml-2">Chargement...</span>
                                        </div>
                                    </td>
                                  </tr>
                                ) : invoices.length === 0 ? (
                                  <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                      <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="mt-2 text-sm font-medium">Aucune facture trouvée</p>
                                        <p className="mt-1 text-sm text-gray-500">Commencez par accepter un devis ou lier une facture existante</p>
                                      </div>
                                    </td>
                                  </tr>
                                ) : (
                                  invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{invoice.id}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.service_name}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(invoice.service_price)}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.tva_percentage}%</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(invoice.total)}</td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          invoice.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {invoice.payment_status === 'paid' ? 'Payé' : 'Non payé'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-4">
                                          <a
                                            href={`http://127.0.0.1:8000/api/quotes/${invoice.id}/pdf`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-900 flex items-center"
                                          >
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            PDF
                                          </a>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                                      </div>
                        </div>

                        {/* Supplier Invoices Section */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                          <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">Factures Fournisseur</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  Factures émises par les fournisseurs
                                </p>
                              </div>
                            <button
                              onClick={() => setIsSupplierInvoiceModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                Ajouter une facture fournisseur
                            </button>
                                    </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {supplierInvoices.length === 0 ? (
                                  <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                      <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="mt-2 text-sm font-medium">Aucune facture fournisseur</p>
                                        <p className="mt-1 text-sm text-gray-500">Ajoutez une facture fournisseur en cliquant sur le bouton ci-dessus</p>
                                      </div>
                                      </td>
                                  </tr>
                                ) : (
                                  supplierInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(invoice.invoice_date)}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.supplier_name}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatPrice(invoice.amount)}</td>
                                      <td className="px-6 py-4 text-sm text-gray-900">{invoice.notes}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                          <a
                                            href={getInvoiceDownloadUrl(invoice)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-900 flex items-center"
                                          >
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                          Voir le fichier
                                        </a>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Change Button */}
                {/* Removed */}

                {/* Confirmation Modal */}
                {isConfirmModalOpen && (
                  <div className="fixed z-[110] inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                      </div>
                      <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                      <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                        <div>
                          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div className="mt-3 text-center sm:mt-5">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                              Confirmer le changement de statut
                            </h3>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                Êtes-vous sûr de vouloir changer le statut de <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOptions[OrderData.status]}`}>
                                  {OrderData.status}
                                </span> à <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOptions[selectedStatus]}`}>
                                  {selectedStatus}
                                </span> ?
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                          <button
                            type="button"
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                              changingStatus ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={handleStatusChange}
                            disabled={changingStatus}
                          >
                            {changingStatus ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Modification...
                              </>
                            ) : (
                              'Confirmer'
                            )}
                          </button>
                          <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                            onClick={() => {
                              setIsConfirmModalOpen(false)
                              setSelectedStatus(null)
                            }}
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Modal */}
            {isPaymentModalOpen && (
              <div className="fixed z-[100] inset-0 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>
                  <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                  <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Ajouter un paiement</h3>
                        <button
                          onClick={() => setIsPaymentModalOpen(false)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {paymentError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                          {paymentError}
                        </div>
                      )}

                      <form onSubmit={handlePaymentSubmit}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                              <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Montant
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                              <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Méthode de paiement
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                              <select
                                required
                                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                                value={paymentData.payment_method}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
                              >
                                <option value="">Sélectionner une méthode</option>
                                <option value="cash">Espèces</option>
                                <option value="virement">Virement</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                              <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Date de paiement
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <input
                                type="date"
                                required
                                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                                value={paymentData.payment_date}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, payment_date: e.target.value }))}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setIsPaymentModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                          >
                            {isSubmitting ? 'En cours...' : 'Ajouter le paiement'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Status Change Modal */}
      {isStatusModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Changer le statut de la commande
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Le statut actuel est: <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOptions[OrderData.status]}`}>
                        {OrderData.status}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {Object.keys(statusOptions).filter(status => status !== OrderData.status).map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status);
                          setIsConfirmModalOpen(true);
                        }}
                        className={`w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      >
                        <span className={`mr-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOptions[status]}`}>
                          {status}
                        </span>
                        Changer pour {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-100 text-base font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm"
                  onClick={() => setIsStatusModalOpen(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPrestataireModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 p-6 border-b">
                        Sélectionner les prestataires
                      </h3>
                        </div>
                    <SelectPrestataireStep
                      orderId={orderId}
                      onBack={() => setShowPrestataireModal(false)}
                    />
                        </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add the Remove Prestataire Modal */}
      {isRemoveModalOpen && (
        <div className="fixed z-[110] inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Retirer le prestataire de la mission
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Êtes-vous sûr de vouloir retirer {OrderData.prestataire?.first_name} {OrderData.prestataire?.last_name} de cette mission ?
                    </p>
                    <div className="mt-4">
                      <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                        Motif du retrait (optionnel)
                      </label>
                      <textarea
                        id="reason"
                        rows={4}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder="Saisissez le motif du retrait..."
                        value={removalReason}
                        onChange={(e) => setRemovalReason(e.target.value)}
                        maxLength={1000}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm ${
                    removingPrestataire ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleRemovePrestataire}
                  disabled={removingPrestataire}
                >
                  {removingPrestataire ? 'Retrait en cours...' : 'Confirmer le retrait'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => {
                    setIsRemoveModalOpen(false)
                    setRemovalReason('')
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Quote Modal */}
      {isAddQuoteModalOpen && (
        <div className="fixed z-[110] inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ajouter un devis</h3>
                  <button
                    onClick={() => setIsAddQuoteModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Search Input */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher un devis..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={quoteSearchTerm}
                      onChange={handleQuoteSearch}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Quotes List */}
                <div className="mt-4 max-h-96 overflow-y-auto">
                  {loadingQuotes ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Chargement des devis...</p>
                    </div>
                  ) : quoteError ? (
                    <div className="text-center py-4 text-red-600">
                      {quoteError}
                    </div>
                  ) : filteredQuotes.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      Aucun devis trouvé
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredQuotes.map((quote) => (
                        <div
                          key={quote.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleQuoteSelection(quote)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                Devis #{quote.id}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Service: {quote.service_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Client: {quote.client_name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Montant: {parseFloat(quote.total).toFixed(2)} €
                              </p>
                              <p className="text-sm text-gray-500">
                                Créé le: {formatDate(quote.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getQuoteStatusBadge(quote)}`}>
                                {getQuoteStatusText(quote)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Invoice Modal */}
      {isUploadInvoiceModalOpen && (
        <div className="fixed z-[110] inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Télécharger la facture fournisseur</h3>
                  <button
                    onClick={() => {
                      setIsUploadInvoiceModalOpen(false);
                      setSelectedFile(null);
                      setUploadError('');
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {uploadError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                    {uploadError}
                  </div>
                )}
                <div className="mt-4">
                  <div className="flex items-center justify-center w-full">
                    <label className={`w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white ${
                      uploadingInvoice ? 'opacity-50 cursor-not-allowed' : ''
                    }`}>
                      <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1z" />
                      </svg>
                      <span className="mt-2 text-base">
                        {uploadingInvoice ? 'Téléchargement en cours...' : 'Sélectionner un fichier PDF'}
                      </span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf" 
                        onChange={handleFileUpload}
                        disabled={uploadingInvoice}
                      />
                    </label>
                  </div>
                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Fichier sélectionné: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Invoice Upload Modal */}
      {isSupplierInvoiceModalOpen && (
        <div className="fixed z-[110] inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ajouter une facture fournisseur</h3>
                  <button
                    onClick={() => {
                      setIsSupplierInvoiceModalOpen(false);
                      setSupplierInvoiceData({
                        invoice: null,
                        amount: '',
                        invoice_date: '',
                        supplier_name: '',
                        notes: ''
                      });
                      setSupplierInvoiceError('');
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {supplierInvoiceError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
                    {supplierInvoiceError}
                  </div>
                )}

                <form onSubmit={handleSupplierInvoiceSubmit} className="space-y-4">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facture (PDF, JPG, JPEG, PNG - Max 10MB)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="invoice-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Télécharger un fichier</span>
                            <input
                              id="invoice-upload"
                              name="invoice-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file && file.size <= 10 * 1024 * 1024) {
                                  setSupplierInvoiceData(prev => ({
                                    ...prev,
                                    invoice: file
                                  }));
                                  setSupplierInvoiceError('');
                                } else {
                                  setSupplierInvoiceError('Le fichier doit faire moins de 10MB');
                                }
                              }}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          {supplierInvoiceData.invoice ? supplierInvoiceData.invoice.name : 'PDF, JPG, JPEG, PNG jusqu\'à 10MB'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Montant
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        step="0.01"
                        id="amount"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={supplierInvoiceData.amount}
                        onChange={(e) => setSupplierInvoiceData(prev => ({
                          ...prev,
                          amount: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  {/* Invoice Date */}
                  <div>
                    <label htmlFor="invoice-date" className="block text-sm font-medium text-gray-700">
                      Date de facture
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        id="invoice-date"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={supplierInvoiceData.invoice_date}
                        onChange={(e) => setSupplierInvoiceData(prev => ({
                          ...prev,
                          invoice_date: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  {/* Supplier Name */}
                  <div>
                    <label htmlFor="supplier-name" className="block text-sm font-medium text-gray-700">
                      Nom du fournisseur
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="supplier-name"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={supplierInvoiceData.supplier_name}
                        onChange={(e) => setSupplierInvoiceData(prev => ({
                          ...prev,
                          supplier_name: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="notes"
                        rows={3}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={supplierInvoiceData.notes}
                        onChange={(e) => setSupplierInvoiceData(prev => ({
                          ...prev,
                          notes: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSupplierInvoiceModalOpen(false);
                        setSupplierInvoiceData({
                          invoice: null,
                          amount: '',
                          invoice_date: '',
                          supplier_name: '',
                          notes: ''
                        });
                      }}
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        uploadingSupplierInvoice ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={uploadingSupplierInvoice || !supplierInvoiceData.invoice}
                    >
                      {uploadingSupplierInvoice ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Envoi en cours...
                        </>
                      ) : (
                        'Envoyer'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Link Invoice Modal */}
      {isLinkInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Lier une facture existante
                    </h3>
                    
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Rechercher une facture..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={invoiceSearchTerm}
                        onChange={handleInvoiceSearch}
                      />
                    </div>

                    <div className="mt-4 max-h-96 overflow-y-auto">
                      {loadingAvailableInvoices ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="mt-2 text-gray-600">Chargement des factures...</p>
                        </div>
                      ) : filteredAvailableInvoices.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          Aucune facture disponible
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredAvailableInvoices.map((invoice) => (
                            <div
                              key={invoice.id}
                              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleInvoiceSelection(invoice)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900">
                                    Facture #{invoice.id}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    Service: {invoice.service_name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Montant: {formatPrice(invoice.total)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Créé le: {formatDate(invoice.created_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsLinkInvoiceModalOpen(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
