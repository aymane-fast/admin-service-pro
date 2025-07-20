'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { partnersApi } from '@/api/partnersAPI'
import { emailsApi } from '@/api/emailsAPI'

export default function CreatePartner() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    name: '',
    email: '',
    phone: '+33',
    commission: '',
    address: '',
    zip_code: '',
    city: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(null)

    try {
      if (!formData.first_name || !formData.last_name || !formData.name || !formData.email || 
          !formData.commission || !formData.phone || !formData.zip_code || !formData.city || !formData.address) {
        throw new Error('Veuillez remplir tous les champs obligatoires')
      }

      const commission = parseFloat(formData.commission)
      if (isNaN(commission) || commission < 0 || commission > 100) {
        throw new Error('La commission doit être un nombre entre 0 et 100')
      }

      const response = await partnersApi.createPartner(formData)

      // Send credentials via email instead of WhatsApp
      try {
        await emailsApi.sendCredentialsEmail({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: response.generatedPassword
        }, 'partner');
        
        setSuccess({
          message: 'Partenaire créé avec succès. Les identifiants ont été envoyés par email.',
          password: response.generatedPassword
        });
      } catch (emailError) {
        console.error('Error sending credentials email:', emailError);
        setSuccess({
          message: 'Partenaire créé avec succès, mais l\'envoi des identifiants par email a échoué.',
          password: response.generatedPassword
        });
      }

      setTimeout(() => {
        router.push('/partners')
      }, 5000)
    } catch (error) {
      console.error('Partner creation error:', error)
      // Check specifically for email already exists error
      if (error.response?.status === 422 && 
          error.response?.data?.errors?.email?.[0]?.includes('already')) {
        setError("Cette adresse email est déjà utilisée. Veuillez en choisir une autre.")
      } else {
        setError(
          error.response?.data?.message || 
          error.message || 
          "Erreur lors de la création du partenaire"
        )
      }
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      let phoneNumber = value.replace(/\D/g, '')
      phoneNumber = phoneNumber.replace(/^0+/, '')
      setFormData(prev => ({
        ...prev,
        phone: '+33' + phoneNumber
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
      <div className="flex-1 w-full lg:w-auto overflow-hidden">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          <Header toggleSidebar={toggleSidebar} />
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-8 relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Créer un partenaire
                  </h2>
                  <p className="text-blue-100 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Remplissez les informations du partenaire
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                {error && (
                  <div className="mb-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1 text-red-700">{error}</div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div className="flex-1 text-green-700">
                        {success.message}
                        <div className="mt-1 text-sm">
                          Mot de passe généré: <span className="font-mono">{success.password}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="bg-gray-50/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-100">
                    <div className="grid grid-cols-1 gap-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2">
                          <label htmlFor="first_name" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Prénom
                          </label>
                          <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Entrez le prénom"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="last_name" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Nom
                          </label>
                          <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Entrez le nom"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="name" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Nom de la société
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Entrez le nom de la société"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="email" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Entrez l'email"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="phone" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Téléphone
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                              +33
                            </span>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone.replace(/^\+33/, '')}
                              onChange={handleChange}
                              className="block w-full rounded-none rounded-r-lg border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="6 12 34 56 78"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="commission" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Commission (%)
                          </label>
                          <input
                            type="number"
                            id="commission"
                            name="commission"
                            value={formData.commission}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Entrez la commission"
                            min="0"
                            max="100"
                            step="any"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="address" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Adresse
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Entrez l'adresse"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="zip_code" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Code postal
                          </label>
                          <input
                            type="text"
                            id="zip_code"
                            name="zip_code"
                            value={formData.zip_code}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Entrez le code postal"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="city" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Ville
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Entrez la ville"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => router.push('/partners')}
                      className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 border border-gray-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/50 disabled:opacity-50"
                    >
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
