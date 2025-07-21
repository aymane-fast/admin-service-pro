'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import paymentsApi from '@/api/paymentsApi';

export default function PaymentsTable({ paymentType = 'all', refreshTrigger = 0 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch order details');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      return null;
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentsApi.fetchPaymentsOverview();
      if (response?.data) {
        setPayments(response.data);
        
        // Fetch order details for each payment
        const orderDetailsPromises = response.data.map(payment => 
          fetchOrderDetails(payment.order_id)
        );
        
        const orderDetailsResults = await Promise.all(orderDetailsPromises);
        const orderDetailsMap = {};
        orderDetailsResults.forEach((order, index) => {
          if (order) {
            orderDetailsMap[response.data[index].order_id] = order;
          }
        });
        
        setOrderDetails(orderDetailsMap);
      }
      setError('');
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setError('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [paymentType]);

  // Load payments on mount and when refreshTrigger changes
  useEffect(() => {
    loadPayments();
  }, [refreshTrigger]);

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  if (!payments || payments.length === 0) {
    return <div className="text-center py-4">Aucun paiement trouvé</div>;
  }

  // Filter payments based on type
  const filteredPayments = payments
    .filter(payment => payment !== null) // Ensure valid payment objects
    .filter(payment => {
      if (paymentType === 'all') return true;
      return payment.entity_type === paymentType;
    });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const getEntityName = (payment) => {
    const order = orderDetails[payment.order_id];
    if (!order) return 'Chargement...';

    switch (payment.entity_type) {
      case 'client':
        return order.client ? `${order.client.first_name} ${order.client.last_name}` : 'Client non trouvé';
      case 'prestataire':
        return order.prestataire ? `${order.prestataire.first_name} ${order.prestataire.last_name}` : 'Prestataire non trouvé';
      case 'partner':
        return order.partner ? order.partner.name : 'Partenaire non trouvé';
      default:
        return 'Entité inconnue';
    }
  };

  return (
    <div className="mt-4 bg-white rounded-lg shadow-sm transition-shadow hover:shadow relative">
      <div className="overflow-x-auto rounded-b-xl">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-900 uppercase tracking-wider bg-gray-100/80">ID</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-900 uppercase tracking-wider bg-gray-100/80">Nom</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-900 uppercase tracking-wider bg-gray-100/80">Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-900 uppercase tracking-wider bg-gray-100/80">N° Commande</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-900 uppercase tracking-wider bg-gray-100/80">Montant</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-900 uppercase tracking-wider bg-gray-100/80">Méthode</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-900 uppercase tracking-wider bg-gray-100/80">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {currentPayments.map((payment, index) => (
              <tr 
                key={payment.id} 
                className={`
                  border-l-4 hover:bg-gray-50/50 transition-colors
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  ${payment.entity_type === 'client' ? 'border-green-500' : 
                    payment.entity_type === 'prestataire' ? 'border-blue-500' : 
                    'border-purple-500'}
                `}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {String(payment.id).padStart(5, '0')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`
                      w-2 h-2 rounded-full mr-2
                      ${payment.entity_type === 'client' ? 'bg-green-500' : 
                        payment.entity_type === 'prestataire' ? 'bg-blue-500' : 
                        'bg-purple-500'}
                    `}></div>
                    <span className="text-sm text-gray-900">
                      {getEntityName(payment)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    #{payment.order_id}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-900">
                    {parseFloat(payment.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${payment.payment_method === 'cash' ? 'bg-yellow-100 text-yellow-800' : 
                      payment.payment_method === 'credit_card' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'}
                  `}>
                    {payment.payment_method === 'cash' ? 'Espèces' :
                     payment.payment_method === 'credit_card' ? 'Carte bancaire' :
                     payment.payment_method === 'transfer' ? 'Virement' :
                     payment.payment_method || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Link href={`/payments/${payment.entity_type}/${payment.id}/details`}>
                      <button className="p-2 text-gray-500 hover:text-[#205D9E] transition-colors rounded-lg hover:bg-blue-50" title="Voir les détails">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Affichage de{' '}
              <span className="font-medium">{Math.min(startIndex + 1, filteredPayments.length)}</span>
              {' '}-{' '}
              <span className="font-medium">{Math.min(endIndex, filteredPayments.length)}</span>
              {' '}sur{' '}
              <span className="font-medium">{filteredPayments.length}</span>
              {' '}résultats
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Précédent</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    pageNumber === currentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Suivant</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
