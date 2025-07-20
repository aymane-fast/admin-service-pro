'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { createClient } from '@/api/clientsApi'

export default function CreateClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone_number: '',
    second_phone: [],
    address: '',
    city: '',
    zip_code: '',
    type: 'individual',
    entreprise_name: '' // Added entreprise_name field
  })

  const [newSecondaryPhone, setNewSecondaryPhone] = useState('');

  const handleAddSecondaryPhone = (e) => {
    e.preventDefault();
    if (newSecondaryPhone.trim()) {
      setFormData(prev => ({
        ...prev,
        second_phone: [...prev.second_phone, newSecondaryPhone.trim()]
      }));
      setNewSecondaryPhone('');
    }
  };

  const handleRemoveSecondaryPhone = (index) => {
    setFormData(prev => ({
      ...prev,
      second_phone: prev.second_phone.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone_number' || name === 'newSecondaryPhone') {
      // Remove any non-digit characters
      let phoneNumber = value.replace(/\D/g, '');
      
      if (name === 'phone_number') {
        setFormData(prev => ({
          ...prev,
          phone_number: phoneNumber
        }));
      } else {
        setNewSecondaryPhone(phoneNumber);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const requestBody = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: formData.phone_number,
        second_phone: formData.second_phone,
        address: formData.address,
        city: formData.city,
        zip_code: formData.zip_code,
        type: formData.type,
        entreprise_name: formData.type === 'business' ? formData.entreprise_name : "null" // Only send if business type
      };

      console.log('Sending request with body:', requestBody);

      const response = await fetch('http://127.0.0.1:8000/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();
      console.log('Response from server:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || JSON.stringify(responseData));
      }

      router.push('/clients');
    } catch (err) {
      console.error('Error creating client:', err);
      setError(err.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

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
                    Créer un client
                  </h2>
                  <p className="text-blue-100 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Remplissez les informations du client
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

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="bg-gray-50/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-100">
                    <div className="grid grid-cols-1 gap-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2">
                          <label htmlFor="type" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Type de client
                          </label>
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="individual">Particulier</option>
                            <option value="business">Professionnel</option>
                          </select>
                        </div>

                        {formData.type === 'business' && (
                          <div className="space-y-2">
                            <label htmlFor="entreprise_name" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              Nom de l'entreprise
                            </label>
                            <input
                              type="text"
                              name="entreprise_name"
                              value={formData.entreprise_name}
                              onChange={handleChange}
                              className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Entrez le nom de l'entreprise"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <label htmlFor="firstName" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Prénom
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Entrez le prénom"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="lastName" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Nom
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Entrez le nom"
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
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Entrez l'email"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="phone_number" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
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
                              name="phone_number"
                              value={formData.phone_number.replace(/^\+33/, '')}
                              onChange={handleChange}
                              className="block w-full rounded-none rounded-r-lg border border-gray-200 px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="6 12 34 56 78"
                            />
                          </div>
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
                      onClick={() => router.push('/clients')}
                      className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 border border-gray-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/50 disabled:opacity-50"
                    >
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
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