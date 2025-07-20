'use client'
import { useState, useEffect } from 'react'
import paymentsApi from '@/api/paymentsApi'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import PaymentsTable from '@/components/PaymentsTable'
import PaymentModal from '@/components/PaymentModal';
import { formatCurrency } from '@/utils/formatters';
import CreatePaymentModal from '@/components/payments/CreatePaymentModal';

export default function PaymentsPage() {
  const [paymentType, setPaymentType] = useState('all');
  const [paymentsData, setPaymentsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const data = await paymentsApi.fetchPaymentsOverview();
        setPaymentsData(data);
        setError('');
      } catch (error) {
        console.error('Failed to fetch payments:', error);
        setError('Erreur lors du chargement des paiements');
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [refreshTrigger]);
  
  const handleClientPaymentSubmit = async (data) => {
    try {
      await paymentsApi.createPayment({
        ...data,
        type: 'client'
      })
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Error creating client payment:', error)
    }
  }

  const handlePartnerPaymentSubmit = async (data) => {
    try {
      await paymentsApi.createPayment({
        ...data,
        type: 'partner'
      })
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Error creating partner payment:', error)
    }
  }

  const handlePrestatairePaymentSubmit = async (data) => {
    try {
      await paymentsApi.createPayment({
        ...data,
        type: 'prestataire'
      })
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Error creating prestataire payment:', error)
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
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full lg:w-auto">
        <div className="p-4 sm:p-6 space-y-6">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          <div className="bg-white rounded-xl shadow-sm">
            <div className="bg-blue-900 p-4 sm:p-6 rounded-t-xl">
              {loading ? (
                <div className="text-white">Chargement...</div>
              ) : error ? (
                <div className="text-red-200">{error}</div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                        <svg className="w-5 sm:w-6 h-5 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Liste des paiements
                      </h2>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => setPaymentType('all')}
                          className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                            paymentType === 'all' 
                              ? 'bg-white text-blue-900 shadow-sm' 
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full bg-white/50"></div>
                          <span className="whitespace-nowrap">Tous</span>
                        </button>
                        <button
                          onClick={() => setPaymentType('client')}
                          className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                            paymentType === 'client' 
                              ? 'bg-white text-blue-900 shadow-sm' 
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="whitespace-nowrap">Clients</span>
                        </button>
                        <button
                          onClick={() => setPaymentType('prestataire')}
                          className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                            paymentType === 'prestataire' 
                              ? 'bg-white text-blue-900 shadow-sm' 
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="whitespace-nowrap">Prestataires</span>
                        </button>
                        <button
                          onClick={() => setPaymentType('partner')}
                          className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                            paymentType === 'partner' 
                              ? 'bg-white text-blue-900 shadow-sm' 
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <span className="whitespace-nowrap">Partenaires</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedPaymentType('client');
                          setShowPaymentModal(true);
                        }}
                        className="px-3 sm:px-4 py-2 text-sm bg-white/10 text-white rounded-lg hover:bg-white/20 flex items-center gap-2 transition-all duration-150"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="whitespace-nowrap">Paiement Client</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPaymentType('partner');
                          setShowPaymentModal(true);
                        }}
                        className="px-3 sm:px-4 py-2 text-sm bg-white/10 text-white rounded-lg hover:bg-white/20 flex items-center gap-2 transition-all duration-150"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="whitespace-nowrap">Paiement Partenaire</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPaymentType('prestataire');
                          setShowPaymentModal(true);
                        }}
                        className="px-3 sm:px-4 py-2 text-sm bg-white/10 text-white rounded-lg hover:bg-white/20 flex items-center gap-2 transition-all duration-150"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="whitespace-nowrap">Paiement Prestataire</span>
                      </button>
                    </div>
                  </div>

                  {paymentsData?.totals && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Received Payments Card */}
                      <div className="bg-gradient-to-br from-[#205D9E] to-[#1E4B7E] p-4 sm:p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-white/80">Paiements Reçus</div>
                            <div className="text-xl sm:text-2xl font-bold text-white mt-2">
                              {formatCurrency(paymentsData.totals.received || 0)}
                            </div>
                          </div>
                          <div className="p-2 sm:p-3 bg-white/10 rounded-lg">
                            <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Sent Payments Card */}
                      <div className="bg-gradient-to-br from-[#4B7BEC] to-[#3867D6] p-4 sm:p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-white/80">Paiements Envoyés</div>
                            <div className="text-xl sm:text-2xl font-bold text-white mt-2">
                              {formatCurrency(paymentsData.totals.sent || 0)}
                            </div>
                          </div>
                          <div className="p-2 sm:p-3 bg-white/10 rounded-lg">
                            <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Total Balance Card */}
                      <div className="bg-gradient-to-br from-[#45AAF2] to-[#2D98DA] p-4 sm:p-6 rounded-xl sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-white/80">Balance Totale</div>
                            <div className="text-xl sm:text-2xl font-bold text-white mt-2">
                              {formatCurrency((paymentsData.totals.received || 0) - (paymentsData.totals.sent || 0))}
                            </div>
                          </div>
                          <div className="p-2 sm:p-3 bg-white/10 rounded-lg">
                            <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6">
              <PaymentsTable paymentType={paymentType} />
            </div>
          </div>
        </div>
      </div>

      {/* Single Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          type={selectedPaymentType}
          onPaymentCreated={() => {
            setShowPaymentModal(false);
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
}