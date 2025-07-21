'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { getClient } from '@/api/clientsApi'

export default function ClientDetails() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [clientData, setClientData] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clients/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch client details');
        }

        if (data.status === 'success' && data.data) {
          setClientData(data.data);
        } else {
          setError('Client non trouvé');
        }
      } catch (error) {
        console.error('Error fetching client details:', error);
        setError(error.message || 'Failed to load client details');
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [params.id])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 lg:h-screen transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full lg:w-auto overflow-x-hidden">
          <div className="p-6">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          </div>
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto text-center py-12">
              Chargement...
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 lg:h-screen transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full lg:w-auto overflow-x-hidden">
          <div className="p-6">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          </div>
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto text-center py-12">
              {error}
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!clientData) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 lg:h-screen transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full lg:w-auto overflow-x-hidden">
          <div className="p-6">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          </div>
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto text-center py-12">
              Client non trouvé
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 lg:h-screen transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full lg:w-auto overflow-x-hidden">
        <div className="p-6">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Détails du client
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Informations détaillées sur {clientData.first_name} {clientData.last_name}
                </p>
              </div>
              <Link
                href="/clients"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à la liste
              </Link>
            </div>

            {/* Client Information Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-900 to-blue-800">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Informations personnelles
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Prénom</label>
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">{clientData.first_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Nom</label>
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">{clientData.last_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Email</label>
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">{clientData.email || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Type</label>
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg capitalize">{clientData.type}</p>
                    </div>
{clientData.type === 'business' && (
  <div>
    <label className="block text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Nom de l'entreprise</label>
    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">
      {clientData.entreprise_name || 'Non renseigné'}
    </p>
  </div>
)}
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-900 to-blue-800">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Coordonnées
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Téléphone principal</label>
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {clientData.phone_number ? (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          +33 {clientData.phone_number}
                        </span>
                      ) : 'Non renseigné'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Téléphones secondaires</label>
                    {clientData.second_phone && clientData.second_phone.length > 0 ? (
                      <div className="space-y-2">
                        {clientData.second_phone.map((phone, index) => (
                          <p key={index} className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            +33 {phone}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-base text-gray-500 bg-gray-50 p-3 rounded-lg italic">Aucun numéro secondaire</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-blue-900 uppercase tracking-wide mb-2">Adresse</label>
                    <div className="space-y-2">
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">{clientData.address || 'Non renseignée'}</p>
                      <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {clientData.zip_code && clientData.city ? (
                          <>{clientData.zip_code} {clientData.city}</>
                        ) : 'Code postal et ville non renseignés'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
