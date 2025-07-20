'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { partnersApi } from '../../../../api/partnersAPI'
import ResetPasswordModal from '@/components/ResetPasswordModal'

export default function PartnerDetails() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [partnerData, setPartnerData] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchPartnerData = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await partnersApi.getPartner(params.id)
        setPartnerData(data)
      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        setError(error.response?.data?.message || "Une erreur est survenue lors du chargement des données du partenaire")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPartnerData()
    }
  }, [params.id])

  const handleResetPassword = async () => {
    try {
      const result = await partnersApi.resetPartnerPassword(params.id)
      return result
    } catch (error) {
      console.error('Error resetting password:', error)
      throw error
    }
  }

  const handleAdminChangePassword = async (password) => {
    try {
      const result = await partnersApi.adminChangePartnerPassword(params.id, password)
      return result
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <Sidebar />
        <div className="flex-1">
          <div className="p-6">
            <Header />
          </div>
          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <Sidebar />
        <div className="flex-1">
          <div className="p-6">
            <Header />
          </div>
          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
                <div className="flex items-center gap-3 text-red-700">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{error}</span>
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

      <div className="flex-1">
        <div className="p-6">
          <Header toggleSidebar={toggleSidebar} />
        </div>
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="relative p-8">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/10 rounded-full p-3">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-white">{partnerData.name}</h1>
                        <p className="text-blue-100 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Détails du partenaire
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link href="/partners">
                    <button className="relative px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Retour à la liste
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Reset Password Modal */}
            {partnerData && (
              <ResetPasswordModal
                isOpen={isResetPasswordModalOpen}
                onClose={() => setIsResetPasswordModalOpen(false)}
                onReset={handleResetPassword}
                onAdminChange={handleAdminChangePassword}
                userData={partnerData}
                userType="partner"
              />
            )}

            {/* Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Informations de contact
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-gray-900">{partnerData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Téléphone</p>
                        <p className="text-gray-900">{partnerData.phone}</p>
                      </div>
                    </div>
                    
                    {/* Account Security Section */}
                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          <span className="font-medium text-gray-900">Sécurité du compte</span>
                        </div>
                        <button
                          onClick={() => setIsResetPasswordModalOpen(true)}
                          className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1.5"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Réinitialiser le mot de passe
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        En cas d'oubli du mot de passe, vous pouvez le réinitialiser ici. Un nouveau mot de passe sera généré et envoyé par email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Informations commerciales
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Commission</p>
                        <p className="text-gray-900">{partnerData.commission}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden md:col-span-2">
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Adresse
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Adresse</p>
                        <p className="text-gray-900">{partnerData.address || 'Non spécifié'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Code postal</p>
                        <p className="text-gray-900">{partnerData.zip_code || 'Non spécifié'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Ville</p>
                        <p className="text-gray-900">{partnerData.city || 'Non spécifié'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden md:col-span-2">
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Documents
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Identity Document */}
                    <a 
                      href={`https://partner-hazel-five.vercel.app/uploads/${params.id}-identity.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="bg-blue-100 rounded-lg p-3 group-hover:bg-blue-200 transition-colors">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Pièce d'identité</h3>
                        <p className="text-sm text-gray-500">Voir le document</p>
                      </div>
                    </a>

                    {/* Insurance Document */}
                    <a 
                      href={`https://partner-hazel-five.vercel.app/uploads/${params.id}-insurance.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="bg-blue-100 rounded-lg p-3 group-hover:bg-blue-200 transition-colors">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Assurance</h3>
                        <p className="text-sm text-gray-500">Voir le document</p>
                      </div>
                    </a>

                    {/* KBIS Document */}
                    <a 
                      href={`https://partner-hazel-five.vercel.app/uploads/${params.id}-kibis.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="bg-blue-100 rounded-lg p-3 group-hover:bg-blue-200 transition-colors">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">KBIS</h3>
                        <p className="text-sm text-gray-500">Voir le document</p>
                      </div>
                    </a>

                    {/* URSSAF Document */}
                    <a 
                      href={`https://partner-hazel-five.vercel.app/uploads/${params.id}-urrsaf.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="bg-blue-100 rounded-lg p-3 group-hover:bg-blue-200 transition-colors">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">URSSAF</h3>
                        <p className="text-sm text-gray-500">Voir le document</p>
                      </div>
                    </a>

                    {/* RIB Document */}
                    <a 
                      href={`https://partner-hazel-five.vercel.app/uploads/${params.id}-rib.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="bg-blue-100 rounded-lg p-3 group-hover:bg-blue-200 transition-colors">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">RIB</h3>
                        <p className="text-sm text-gray-500">Voir le document</p>
                      </div>
                    </a>

                    {/* Diploma Document */}
                    <a 
                      href={`https://partner-hazel-five.vercel.app/uploads/${params.id}-diploma.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="bg-blue-100 rounded-lg p-3 group-hover:bg-blue-200 transition-colors">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3m0 0l3-3m-3 3V8" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Diplôme</h3>
                        <p className="text-sm text-gray-500">Voir le document</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
