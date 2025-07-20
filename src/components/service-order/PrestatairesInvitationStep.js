'use client'

import { useState, useEffect } from 'react'
import { orderInvitationsApi } from '@/api/orderInvitationsAPI'
import { prestatairesApi } from '@/api/prestatairesAPI'
import Select from 'react-select'

export default function PrestatairesInvitationStep({ orderId, onSelect, onComplete, onBack, selectionOnly = false, initialSelected = [] }) {
  const [prestataires, setPrestataires] = useState([])
  const [selectedPrestataires, setSelectedPrestataires] = useState(() => {
    // Safely map initial selected prestataires if they exist and have valid data
    if (!Array.isArray(initialSelected)) return []
    return initialSelected
      .filter(p => p && p.id) // Filter out invalid entries
      .map(p => ({
        value: String(p.id), // Convert id to string safely
        label: p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : p.name || 'Unknown',
        email: p.email || '',
        specialties: p.specialties ? p.specialties.split(',') : []
      }))
  })
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    loadPrestataires()
    if (orderId) {
      loadInvitations()
    } else {
      setLoading(false)
    }
  }, [orderId])

  const loadPrestataires = async () => {
    try {
      var mailPartner =  localStorage.getItem("partnerMail");
      console.log('ddddddddddddddddd');
      
      console.log(mailPartner);
      const data = await prestatairesApi.fetchPrestataires(mailPartner)
      setPrestataires(data)
    } catch (err) {
      setError('Failed to load prestataires')
      console.error(err)
      setLoading(false)
    }
  }

  const loadInvitations = async () => {
    try {
      const response = await orderInvitationsApi.getOrderInvitations(orderId)
      setInvitations(response.data)
    } catch (err) {
      setError('Failed to load invitations')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (selected) => {
    setSelectedPrestataires(selected || [])
  }

  const handleSubmit = async () => {
    if (selectedPrestataires.length === 0) {
      setError('Please select at least one prestataire')
      return
    }

    if (selectionOnly) {
      onSelect(selectedPrestataires)
      return
    }

    setInviting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await orderInvitationsApi.invitePrestataires(orderId, selectedPrestataires.map(s => s.value))
      setSuccess('Invitations sent successfully')
      setSelectedPrestataires([])
      await loadInvitations()

      if (response.warnings) {
        setError(`Some invitations could not be sent: ${response.warnings.message}`)
      }
    } catch (err) {
      setError('Failed to send invitations')
      console.error(err)
    } finally {
      setInviting(false)
    }
  }

  const prestatairesOptions = prestataires.map(prestataire => ({
    value: prestataire.id.toString(),
    label: `${prestataire.first_name} ${prestataire.last_name}`,
    email: prestataire.email,
    specialties: prestataire.specialties ? prestataire.specialties.split(',') : []
  }))

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: '50px',
      background: 'white',
      borderColor: '#E5E7EB',
      '&:hover': {
        borderColor: '#205D9E',
      },
      boxShadow: 'none',
    }),
    option: (base, state) => ({
      ...base,
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      background: state.isSelected ? '#205D9E' : state.isFocused ? '#EFF6FF' : 'white',
      color: state.isSelected ? 'white' : '#111827',
      '&:active': {
        background: '#205D9E',
      },
    }),
    multiValue: (base) => ({
      ...base,
      background: '#EFF6FF',
      borderRadius: '6px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#205D9E',
      fontWeight: '500',
      padding: '4px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#205D9E',
      ':hover': {
        background: '#DBEAFE',
        color: '#1E40AF',
      },
    }),
  }

  const [searchQuery, setSearchQuery] = useState('')

  const filteredPrestataires = prestataires.filter(prestataire => {
    const searchLower = searchQuery.toLowerCase()
    const fullName = `${prestataire.first_name} ${prestataire.last_name}`.toLowerCase()
    const specialtiesStr = prestataire.specialties ? prestataire.specialties.toLowerCase() : ''
    
    return fullName.includes(searchLower) || specialtiesStr.includes(searchLower)
  })
if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
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
        </div>
      </div>
    )
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

        {success && (
          <div className="mb-6 flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un prestataire par nom ou spécialité..."
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

          {filteredPrestataires.length > 0 ? (
            <div className="space-y-4">
              {filteredPrestataires.map(prestataire => {
                const isSelected = selectedPrestataires.some(selected => selected.value === String(prestataire.id));
                return (
                  <div
                    key={prestataire.id}
                    onClick={() => {
                      if (isSelected) {
                        handleChange(selectedPrestataires.filter(p => p.value !== String(prestataire.id)));
                      } else {
                        handleChange([...selectedPrestataires, {
                          value: String(prestataire.id),
                          label: `${prestataire.first_name} ${prestataire.last_name}`,
                          email: prestataire.email,
                          specialties: prestataire.specialties ? prestataire.specialties.split(',') : []
                        }]);
                      }
                    }}
                    className={`group cursor-pointer p-4 border rounded-lg transition-all duration-150 ease-in-out relative overflow-hidden ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:border-blue-500 hover:shadow-lg'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                    <div className="flex justify-between items-start relative">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <h3 className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                            {prestataire.first_name} {prestataire.last_name}
                          </h3>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {prestataire.email}
                          </div>
                          {prestataire.specialties && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {prestataire.specialties.split(',').map((specialty, index) => (
                                <span
                                  key={index}
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    isSelected 
                                      ? 'bg-blue-200 text-blue-900' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {specialty.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`${isSelected ? 'text-blue-700' : 'text-blue-600'} group-hover:translate-x-1 transition-transform duration-150`}>
                        {isSelected ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery ? "Aucun prestataire trouvé avec ces critères" : "Commencez à taper pour rechercher un prestataire"}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center">
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

            {selectedPrestataires.length > 0 && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPrestataires([])}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Tout effacer ({selectedPrestataires.length})
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={inviting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {inviting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    selectionOnly ? 'Continuer' : 'Envoyer les invitations'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
