'use client'
import { useState, useEffect } from 'react'
import prestatairesApi from '@/api/prestatairesAPI'

export default function SelectPrestataireStep({ orderId, onBack }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [prestataires, setPrestataires] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [invitingPrestataires, setInvitingPrestataires] = useState(false)
  const [selectedPrestataires, setSelectedPrestataires] = useState([])
  const [invitationResult, setInvitationResult] = useState(null)

  useEffect(() => {
    const loadPrestataires = async () => {
      try {
        setLoading(true)
        setError(null)
      
        
        const data = await prestatairesApi.fetchPrestataires()
        setPrestataires(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error loading prestataires:', err)
        setError('Erreur lors du chargement des prestataires')
      } finally {
        setLoading(false)
      }
    }

    loadPrestataires()
  }, [])

  const filteredPrestataires = prestataires.filter(prestataire => {
    if (!searchQuery) return true
    if (!prestataire) return false
    
    const searchLower = searchQuery.toLowerCase()
    const firstName = (prestataire.first_name || '').toLowerCase()
    const lastName = (prestataire.last_name || '').toLowerCase()
    const email = (prestataire.email || '').toLowerCase()
    
    return (
      firstName.includes(searchLower) ||
      lastName.includes(searchLower) ||
      email.includes(searchLower)
    )
  })

  const handleTogglePrestataire = (prestataireId) => {
    setSelectedPrestataires(prev => {
      if (prev.includes(prestataireId)) {
        return prev.filter(id => id !== prestataireId)
      } else {
        return [...prev, prestataireId]
      }
    })
  }

  const handleInvitePrestataires = async () => {
    if (selectedPrestataires.length === 0) return

    setInvitingPrestataires(true)
    setError(null)
    setInvitationResult(null)

    try {
      const data = await prestatairesApi.invitePrestataires(orderId, selectedPrestataires)
      
      setInvitationResult({
        success: true,
        message: data.message,
        invitations: data.data,
        warnings: data.warnings
      })
      // Clear selections after successful invitation
      setSelectedPrestataires([])
    } catch (error) {
      console.error('Invitation error:', error)
      setError(error.response?.data?.message || 'Erreur lors de l\'envoi des invitations')
    } finally {
      setInvitingPrestataires(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="mb-6 flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {invitationResult && (
          <div className="mb-6">
            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="ml-3">
                <p className="text-sm text-green-700">{invitationResult.message}</p>
              </div>
            </div>
            {invitationResult.warnings && (
              <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">{invitationResult.warnings.message}</p>
                <p className="text-sm text-yellow-600 mt-1">
                  Prestataires affectés: {invitationResult.warnings.failed_prestataire_ids.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-6">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un prestataire..."
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

          {/* Selected Count */}
          {selectedPrestataires.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                {selectedPrestataires.length} prestataire{selectedPrestataires.length > 1 ? 's' : ''} sélectionné{selectedPrestataires.length > 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Prestataires List */}
          <div className="space-y-4">
            {/* Loading skeleton */}
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="flex justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPrestataires.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sélectionner</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPrestataires.map((prestataire) => (
                      <tr key={prestataire.id} className={selectedPrestataires.includes(prestataire.id) ? 'bg-blue-50' : ''}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedPrestataires.includes(prestataire.id)}
                            onChange={() => handleTogglePrestataire(prestataire.id)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {prestataire.first_name} {prestataire.last_name}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{prestataire.email}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun prestataire trouvé</h3>
                <p className="mt-1 text-sm text-gray-500">Essayez avec d'autres critères de recherche.</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation and Submit Buttons */}
        <div className="mt-6 flex justify-between">
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

          <button
            type="button"
            onClick={handleInvitePrestataires}
            disabled={selectedPrestataires.length === 0 || invitingPrestataires}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-white ${
              selectedPrestataires.length > 0 && !invitingPrestataires
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {invitingPrestataires ? 'Envoi des invitations...' : 'Inviter les prestataires'}
          </button>
        </div>
      </div>
    </div>
  )
} 