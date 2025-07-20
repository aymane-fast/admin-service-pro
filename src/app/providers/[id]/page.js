'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { prestatairesApi } from '../../../api/prestatairesAPI'

export default function EditPrestataire() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    postalCode: '',
    address: ''
  })

  useEffect(() => {
    const fetchPrestataire = async () => {
      try {
        const data = await prestatairesApi.getPrestataire(params.id)
        setFormData({
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone_number,
          postalCode: data.zip_code,
          address: data.address
        })
      } catch (error) {
        setError(error.response?.data?.message || "Erreur lors du chargement des données du prestataire")
      } finally {
        setLoading(false)
      }
    }

    fetchPrestataire()
  }, [params.id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      await prestatairesApi.updatePrestataire(params.id, formData)
      router.push('/providers')
    } catch (error) {
      setError(error.response?.data?.message || "Erreur lors de la mise à jour du prestataire")
      setSaving(false)
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
            <div className="max-w-7xl mx-auto text-center py-12">
              Chargement...
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      <Sidebar />
      <div className="flex-1">
        <div className="p-6">
          <Header />
        </div>
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-blue-900">Modifier le prestataire</h1>
              <p className="mt-2 text-gray-600">Modifiez les informations du prestataire ci-dessous</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm">
              <div className="bg-blue-900 p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-white">Informations du prestataire</h2>
                    <p className="text-blue-100 text-sm">Les champs marqués d'un * sont obligatoires</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Nom<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        placeholder="Entrez le nom"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        Prénom<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        placeholder="Entrez le prénom"
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
                        placeholder="exemple@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Numéro de téléphone<span className="text-red-500">*</span>
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
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                        Code postal<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        placeholder="90000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Adresse<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2.5 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      placeholder="Entrez l'adresse complète"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => router.push('/providers')}
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
        </main>
      </div>
    </div>
  )
}
