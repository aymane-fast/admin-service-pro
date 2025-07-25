'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { partnersApi } from '../../../api/partnersAPI'

function PasswordModal({ password, onClose }) {
  if (!password) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Nouveau mot de passe</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mb-4">
            <p className="text-gray-700 mb-2 font-semibold">Le mot de passe a été réinitialisé. Veuillez le communiquer au partenaire :</p>
             <div className="bg-gray-100 border border-gray-300 rounded px-3 py-2 font-mono text-lg text-center select-all text-green-600">{password}</div>
            <p className="text-xs text-gray-500 mt-2">Cette fenêtre se fermera automatiquement dans 10 secondes.</p>
          </div>
          <div className="flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditPartner() {
  const params = useParams()
  const router = useRouter()
  const id = params.id
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

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

  const handleSubmit = async (e, resetPassword = false) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const payload = { ...formData };
      if (resetPassword) payload.reset_password = true;
      const response = await partnersApi.updatePartner(id, payload)
      // Check for new_password in response.data
      if (response && response.new_password) {
        setNewPassword(response.new_password);
        setShowPasswordModal(true);
        setTimeout(() => {
          setShowPasswordModal(false);
          setNewPassword("");
        }, 10000);
      }
      // No redirect, just stay on the page
      setSaving(false);
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
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <Sidebar />
        <div className="flex-1">
          <div className="p-6">
            <Header />
          </div>
          <main className="p-6">
            <div className="max-w-7xl mx-auto text-center py-12">
              Loading...
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
              <h1 className="text-3xl font-bold text-blue-900">Modifier le partenaire</h1>
              <p className="mt-2 text-gray-600">Modifier les informations du partenaire</p>
            </div>
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={e => handleSubmit(e, false)} className="space-y-6">
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

              <div className="flex gap-3 justify-end">
                <button type="button" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg" onClick={() => router.push('/partners')}>Annuler</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Enregistrer les modifications</button>
                <button type="button" disabled={saving} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50" onClick={e => handleSubmit(e, true)}>Réinitialiser le mot de passe</button>
              </div>
            </form>
            <PasswordModal password={newPassword} onClose={() => { setShowPasswordModal(false); setNewPassword(""); }} />
          </div>
        </main>
      </div>
    </div>
  )
}
