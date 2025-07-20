'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { partnersApi } from '../../../api/partnersAPI'

export default function EditPartner({ params }) {
  const router = useRouter()
  const { id } = params
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    commission: '',
    phone: '',
    zipCode: '',
    city: ''
  })

  useEffect(() => {
    const loadPartner = async () => {
      try {
        const data = await partnersApi.getPartner(id)
        setFormData({
          name: data.name || '',
          email: data.email || '',
          commission: data.commission || '',
          phone: data.phone || '',
          zipCode: data.zip_code || '',
          city: data.city || ''
        })
      } catch (error) {
        console.error('Failed to fetch partner:', error)
        setError(error.message || 'Failed to load partner details')
      } finally {
        setLoading(false)
      }
    }

    loadPartner()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await partnersApi.updatePartner(id, formData)
      router.push('/partners')
    } catch (error) {
      console.error('Failed to update partner:', error)
      setError(error.response?.data?.message || 'Failed to update partner')
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FF]">
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
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="text-center py-4">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FF]">
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
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <div className="bg-white rounded-xl shadow-sm">
            <div className="bg-blue-900 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Modifier le partenaire
                  </h2>
                  <p className="text-blue-100 text-sm">Modifier les informations du partenaire</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nom de l'entreprise<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      placeholder="Entrez le nom de l'entreprise"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      placeholder="entreprise@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="commission" className="block text-sm font-medium text-gray-700">
                      Commission (%)<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="commission"
                      name="commission"
                      value={formData.commission}
                      onChange={handleChange}
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      placeholder="30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Téléphone<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      placeholder="0123456789"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                      Code postal<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      placeholder="90000"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      Ville<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      placeholder="Entrez la ville"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => router.push('/partners')}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-6 py-2.5 rounded-lg text-white transition-colors flex items-center gap-2 ${
                      saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-blue-800'
                    }`}
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enregistrement...
                      </>
                    ) : (
                      'Enregistrer les modifications'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
