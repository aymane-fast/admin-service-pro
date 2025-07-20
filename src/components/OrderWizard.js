'use client'

import { useState } from 'react'
import OrderDetailsStep from './OrderDetailsStep'
import PrestatairesInvitationStep from './PrestatairesInvitationStep'

export default function OrderWizard() {
  const [step, setStep] = useState(1)
  const [orderId, setOrderId] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)

  const handleOrderDetailsComplete = (details, id) => {
    setOrderDetails(details)
    setOrderId(id)
    setStep(2)
  }

  const handlePrestatairesComplete = () => {
    // Order is now complete with a selected prestataire
    // You can redirect to the order details page or show a success message
    window.location.href = `/orders/${orderId}`
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Progress Steps */}
      <nav className="mb-8">
        <ol className="flex items-center">
          <li className={`relative pr-8 sm:pr-20 ${step === 1 ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className="flex items-center">
              <span className={`h-6 w-6 flex items-center justify-center rounded-full ${
                step === 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
              }`}>
                1
              </span>
              <span className="ml-2 text-sm font-medium">Order Details</span>
            </div>
            <div className="absolute top-3 right-0 w-full h-0.5 bg-gray-200" />
          </li>
          <li className={`relative ${step === 2 ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className="flex items-center">
              <span className={`h-6 w-6 flex items-center justify-center rounded-full ${
                step === 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
              }`}>
                2
              </span>
              <span className="ml-2 text-sm font-medium">Select Prestataire</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Step Content */}
      <div className="bg-white shadow rounded-lg">
        {step === 1 && (
          <OrderDetailsStep onComplete={handleOrderDetailsComplete} />
        )}
        {step === 2 && orderId && (
          <PrestatairesInvitationStep
            orderId={orderId}
            onComplete={handlePrestatairesComplete}
          />
        )}
      </div>
    </div>
  )
} 