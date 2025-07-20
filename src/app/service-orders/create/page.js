'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import SelectClientStep from '@/components/service-order/SelectClientStep'
import ServiceDetailsStep from '@/components/service-order/ServiceDetailsStep'
import SelectPartnerStep from '@/components/service-order/SelectPartnerStep'
import ConfirmationStep from '@/components/service-order/ConfirmationStep'
import PrestatairesInvitationStep from '@/components/service-order/PrestatairesInvitationStep'
import OrderStepper from '@/components/service-order/OrderStepper'
import { createOrder } from '@/api/ordersApi'

const steps = [
  { id: 1, name: 'Sélection du client', description: 'Choisir ou créer un client' },
  { id: 2, name: 'Détails du service', description: 'Date, heure et description' },
  { id: 3, name: 'Sélection du partenaire', description: 'Choisir un partenaire' },
  { id: 4, name: 'Prestataires', description: 'Sélectionner des prestataires' },
  { id: 5, name: 'Récapitulatif', description: 'Vérifier et confirmer' }
]

export default function CreateServiceOrder() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [formData, setFormData] = useState({
    client: null,
    serviceDetails: null,
    partner: null,
    selectedPrestataires: []
  })
  const [error, setError] = useState(null)

  const updateFormData = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSubmit = async (response) => {
    try {
      setError(null)
      setOrderId(response.id)
      nextStep() // Move to prestataire selection step
    } catch (error) {
      console.error('Error handling order creation:', error)
      setError(error.response?.data?.message || error.message || "Erreur lors de la création de l'ordre de service")
    }
  }

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
        <Sidebar 
          isOpen={isSidebarOpen} 
          closeSidebar={() => setIsSidebarOpen(false)} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full lg:w-auto">
        <div className="p-4 sm:p-6">
          <Header toggleSidebar={toggleSidebar} />
          
          <main className="max-w-7xl mx-auto">
            {/* Content Grid - Update to maintain equal height */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 flex flex-col space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-800">
                    <h1 className="text-xl font-semibold text-white">Créer un ordre de service</h1>
                    <p className="mt-1 text-sm text-blue-100">
                      Suivez les étapes pour créer un nouvel ordre de service
                    </p>
                  </div>
                </div>

                {/* Steps Progress */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <OrderStepper currentStep={currentStep} />
                </div>

                {/* Content Card - Make it grow to fill space */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1">
                  {currentStep === 1 && (
                    <SelectClientStep
                      onSelectClient={(client) => {
                        updateFormData('client', client)
                        nextStep()
                      }}
                    />
                  )}
                  {currentStep === 2 && (
                    <ServiceDetailsStep
                      initialData={formData.serviceDetails}
                      onNext={(details) => {
                        updateFormData('serviceDetails', details)
                        nextStep()
                      }}
                      onBack={prevStep}
                    />
                  )}
                  {currentStep === 3 && (
                    <SelectPartnerStep
                      onSelectPartner={(partner) => {
                        updateFormData('partner', partner)
                        nextStep()
                      }}
                      onBack={prevStep}
                    />
                  )}
                  {currentStep === 4 && (
                    <PrestatairesInvitationStep
                      orderId={null}
                      onSelect={(prestataires) => {
                        updateFormData('selectedPrestataires', prestataires)
                        nextStep()
                      }}
                      onBack={prevStep}
                      selectionOnly={true}
                      initialSelected={formData.selectedPrestataires.map(p => ({
                        id: p.value,
                        first_name: p.label.split(' ')[0],
                        last_name: p.label.split(' ').slice(1).join(' '),
                        email: p.email,
                        specialties: p.specialties?.join(',') || ''
                      }))}
                    />
                  )}
                  {currentStep === 5 && (
                    <ConfirmationStep
                      formData={formData}
                      onBack={prevStep}
                      onSubmit={async (response) => {
                        try {
                          setError(null)
                          router.push(`/service-orders/${response.id}`)
                        } catch (error) {
                          console.error('Error handling order creation:', error)
                          setError(error.response?.data?.message || error.message || "Erreur lors de la création de l'ordre de service")
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Right Column - Summary */}
              <div className="flex flex-col space-y-6">
                {/* Summary Card - Make it grow to fill space */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1">
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-blue-800">
                    <h2 className="text-lg font-medium text-white">Résumé</h2>
                  </div>
                  <div className="p-6 flex-1">
                    <div className="space-y-6">
                      {/* Client Info - With Placeholder */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Client</h3>
                        {formData.client ? (
                          <div className="mt-2 flex items-center">
                            <div className="flex-shrink-0">
                              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {formData.client.first_name} {formData.client.last_name}
                              </p>
                              <p className="text-sm text-gray-500">{formData.client.email}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Non sélectionné
                          </div>
                        )}
                      </div>

                      {/* Service Details - With Placeholder */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Détails du service</h3>
                        {formData.serviceDetails ? (
                          <div className="mt-2">
                            <p className="text-sm text-gray-900">
                              {new Date(formData.serviceDetails.date).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {formData.serviceDetails.time}
                            </p>
                            {formData.serviceDetails.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {formData.serviceDetails.description}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Non renseigné
                          </div>
                        )}
                      </div>

                      {/* Partner Info - With Placeholder */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Partenaire</h3>
                        {formData.partner ? (
                          <div className="mt-2 flex items-center">
                            <div className="flex-shrink-0">
                              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{formData.partner.name}</p>
                              <p className="text-sm text-gray-500">{formData.partner.email}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Non sélectionné
                          </div>
                        )}
                      </div>

                      {/* Selected Prestataires - With Placeholder */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Prestataires invités</h3>
                        {formData.selectedPrestataires && formData.selectedPrestataires.length > 0 ? (
                          <div className="mt-2 space-y-3">
                            {formData.selectedPrestataires.map((prestataire, index) => (
                              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {prestataire.label}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
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
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Non sélectionné
                          </div>
                        )}
                      </div>
                    </div>
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
