'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

const generatePassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

export default function CreateAgent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirmation: '',
    city: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      const requestBody = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        name: `${formData.firstName} ${formData.lastName}`,
        role: 'agent',
        city: formData.city
      };

      console.log('Sending request with body:', requestBody);

      const response = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();
      console.log('Response from server:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || JSON.stringify(responseData));
      }

      router.push('/agents');
    } catch (err) {
      console.error('Error creating agent:', err);
      setError(err.message || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone_number') {
      // Remove any non-digit characters
      let phoneNumber = value.replace(/\D/g, '');
      
      setFormData(prev => ({
        ...prev,
        phone_number: phoneNumber
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      <Sidebar />
      <div className="flex-1">
        <div className="p-6 space-y-6">
          <Header />
          <main className="mt-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-8 relative">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Créer un agent
                      </h2>
                      <p className="text-blue-100 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Remplissez les informations du nouvel agent
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="bg-gray-50/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-100">
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
                        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{error}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <label htmlFor="lastName" className="block text-sm font-bold text-gray-900">
                              Nom
                            </label>
                          </div>
                          <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Entrez le nom"
                          />
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <label htmlFor="firstName" className="block text-sm font-bold text-gray-900">
                              Prénom
                            </label>
                          </div>
                          <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Entrez le prénom"
                          />
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-900">
                              Email
                            </label>
                          </div>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Entrez l'adresse email"
                          />
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <label htmlFor="phone_number" className="block text-sm font-bold text-gray-900">
                              Téléphone
                            </label>
                          </div>
                          <input
                            type="tel"
                            name="phone_number"
                            id="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Entrez le numéro de téléphone"
                          />
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                            </div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-900">
                              Mot de passe
                            </label>
                          </div>
                          <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Entrez le mot de passe"
                          />
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                            </div>
                            <label htmlFor="password_confirmation" className="block text-sm font-bold text-gray-900">
                              Confirmer le mot de passe
                            </label>
                          </div>
                          <input
                            type="password"
                            name="password_confirmation"
                            id="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Confirmez le mot de passe"
                          />
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <label htmlFor="city" className="block text-sm font-bold text-gray-900">
                              Ville
                            </label>
                          </div>
                          <input
                            type="text"
                            name="city"
                            id="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Entrez la ville"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4">
                        <Link
                          href="/agents"
                          className="inline-flex justify-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Annuler
                        </Link>
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Création...' : 'Créer l\'agent'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
