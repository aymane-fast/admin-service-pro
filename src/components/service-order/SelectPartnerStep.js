'use client'
import { useState, useEffect } from 'react'
import partnersApi from '@/api/partnersAPI'
import prestatairesApi from '@/api/prestatairesAPI'

export default function SelectPartnerStep({ onSelectPartner, onBack }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [partners, setPartners] = useState([])
  const [prestataires, setPrestataires] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPrestataire, setSelectedPrestataire] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Load partners
        const partnersData = await partnersApi.fetchPartners()
        setPartners(Array.isArray(partnersData) ? partnersData : [])
        
        // Load prestataires
        const prestatairesData = await prestatairesApi.fetchPrestataires()
        setPrestataires(Array.isArray(prestatairesData) ? prestatairesData : [])
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredPartners = Array.isArray(partners) ? partners.filter(partner => {
    if (!searchQuery) return true // Show all partners initially
    if (!partner) return false
    
    const searchLower = searchQuery.toLowerCase()
    const name = (partner.name || '').toLowerCase()
    const email = (partner.email || '').toLowerCase()
    const phone = (partner.phone || '').toString()
    
    return (
      name.includes(searchLower) ||
      email.includes(searchLower) ||
      phone.includes(searchQuery)
    )
  }) : []

  const handleSelectPartner = (partner) => {
   
    
    // Find a prestataire that matches the partner (you can define your own matching logic)
    const matchingPrestataire = prestataires.find(p => p.id === partner.prestataire_id) || null;
    setSelectedPrestataire(matchingPrestataire);
    
    // Pass both partner and prestataire to the parent component
    localStorage.setItem('partnerMail', partner.email);
    
    onSelectPartner(partner, matchingPrestataire);
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="mb-6 flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un partenaire par nom ou spécialité..."
              className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm"
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Partners List or Loading State */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="h-5 w-5 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredPartners.length > 0 ? (
                <div className="space-y-4">
                  {filteredPartners.map(partner => (
                    <div
                      key={partner.id}
                      onClick={() => handleSelectPartner(partner)}
                      className="group cursor-pointer p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all duration-150 ease-in-out bg-white relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                      <div className="flex justify-between items-start relative">
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <h3 className="font-medium text-gray-900">
                              {partner.name} 
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Disponible
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-500">
                              <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {partner.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {partner.phone}
                            </div>
                          </div>
                        </div>
                        <div className="text-blue-600 group-hover:translate-x-1 transition-transform duration-150">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun partenaire trouvé avec ces critères</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Commencez à taper pour rechercher un partenaire
                </div>
              )}
            </>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-start">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
