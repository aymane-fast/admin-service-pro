'use client'
import { useState } from 'react'
import PaymentModal from '@/components/PaymentModal'

export default function CreatePaymentModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  type, // Add type prop: 'client', 'partner', or 'prestataire'
  title 
}) {
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'bank_transfer',
    order_id: '',
    entity_id: '',
    notes: ''
  })

  const getModalTitle = () => {
    switch(type) {
      case 'client':
        return 'Nouveau paiement - Client'
      case 'partner':
        return 'Nouveau paiement - Partenaire'
      case 'prestataire':
        return 'Nouveau paiement - Prestataire'
      default:
        return 'Nouveau paiement'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error creating payment:', error)
    }
  }

  return (
    <PaymentModal 
      isOpen={isOpen}
      onClose={onClose}
      type={type}
      onPaymentCreated={handleSubmit}
    />
  )
} 