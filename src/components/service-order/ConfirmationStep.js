'use client'
import { useState } from 'react'
import { createServiceOrder } from '@/api/serviceOrdersApi'
import { orderInvitationsApi } from '@/api/orderInvitationsAPI'
import api from '@/api'

const BASE_URL = 'http://127.0.0.1:8000' // Base URL without /api

export default function ConfirmationStep({ formData, onBack, onSubmit }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    try {
      // First create the order to get the order ID
      const orderResponse = await createServiceOrder({
        client_id: formData.client.id,
        partner_id: formData.partner.id,
        date_intervention: formData.serviceDetails.date,
        heure_intervention: formData.serviceDetails.time,
        description: formData.serviceDetails.description,
        images: [] // Initially empty, will update after uploads
      })

      // Upload images if they exist
      const uploadedImagePaths = []
      if (formData.serviceDetails?.images?.length) {
        const uploadPromises = formData.serviceDetails.images.map(async (image) => {
          if (!image.file) return null // Skip if no file object

          const formData = new FormData()
          formData.append('file', image.file)
          formData.append('type', 'other')
          formData.append('entity_type', 'order')
          formData.append('entity_id', orderResponse.id)

          try {
            const response = await api.post('/files/upload', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            })

            if (response.data.status === 'success') {
              return response.data.data.path
            }
            console.error('Upload failed:', response.data)
            return null
          } catch (error) {
            console.error('Upload error:', error)
            return null
          }
        })

        const paths = await Promise.all(uploadPromises)
        uploadedImagePaths.push(...paths.filter(Boolean))

        // Update the order with the uploaded image paths if we have any
        if (uploadedImagePaths.length > 0) {
          await api.put(`/orders/${orderResponse.id}`, {
            images: uploadedImagePaths,
            updateImage:true
          })
        }
      }

      // If there are selected prestataires, send invitations
      if (formData.selectedPrestataires && formData.selectedPrestataires.length > 0) {
        await orderInvitationsApi.invitePrestataires(
          orderResponse.id, 
          formData.selectedPrestataires.map(p => p.value)
        )
      }
      
      // Call onSubmit with the complete order data
      onSubmit({
        ...orderResponse,
        images: uploadedImagePaths
      })
    } catch (error) {
      console.error('Create Service Order Error:', error)
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        "Erreur lors de la création de l'ordre de service"
      )
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden divide-y divide-gray-200">
          {/* Summary Cards */}
          {[
            {
              title: 'Client',
              icon: (
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              ),
              content: (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nom complet</p>
                    <p className="mt-1 text-gray-900">{formData.client.first_name} {formData.client.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-gray-900">{formData.client.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Téléphone</p>
                    <p className="mt-1 text-gray-900">{formData.client.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Adresse</p>
                    <p className="mt-1 text-gray-900">{formData.client.address}</p>
                  </div>
                </div>
              )
            },
            {
              title: 'Détails du service',
              icon: (
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              content: (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="mt-1 text-gray-900">{formatDate(formData.serviceDetails.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Heure</p>
                      <p className="mt-1 text-gray-900">{formData.serviceDetails.time}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 whitespace-pre-wrap">{formData.serviceDetails.description}</p>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: 'Partenaire',
              icon: (
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
              content: (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nom complet</p>
                    <p className="mt-1 text-gray-900">{formData.partner.name}</p>
                  </div>
                  {/* <div>
                    <p className="text-sm font-medium text-gray-500">Spécialité</p>
                    <p className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {formData.partner.specialty}
                      </span>
                    </p>
                  </div> */}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-gray-900">{formData.partner.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Téléphone</p>
                    <p className="mt-1 text-gray-900">{formData.partner.phone}</p>
                  </div>
                </div>
              )
            },
            {
              title: 'Prestataires invités',
              icon: (
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              content: (
                <div className="space-y-4">
                  {formData.selectedPrestataires && formData.selectedPrestataires.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {formData.selectedPrestataires.map((prestataire, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {prestataire.label}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {prestataire.email}
                            </p>
                            {prestataire.specialties && prestataire.specialties.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {prestataire.specialties.map((specialty, specIndex) => (
                                  <span
                                    key={specIndex}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {specialty}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Aucun prestataire sélectionné
                    </div>
                  )}
                </div>
              )
            }
          ].filter(Boolean).map((section, index) => (
            <div key={section.title} className="px-6 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">{section.icon}</div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">{section.title}</h3>
              </div>
              <div className="mt-4">{section.content}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Retour
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? 'Création...' : 'Créer la commande'}
          </button>
        </div>
      </div>
    </div>
  )
}
