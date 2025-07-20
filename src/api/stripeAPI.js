import api from '../api'
import { getToken } from '@/utils/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const stripeApi = {
    // Get Stripe configuration status
    getStripeConfig: async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await api.get('/stripe/configs', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return response.data
        } catch (error) {
            console.error('Error fetching Stripe config:', error)
            throw error
        }
    },

    // Save Stripe configuration
    saveStripeConfig: async (config) => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error('Authentication token is required')
            }

            // Create request payload matching API documentation exactly
            const payload = {
                publishable_key: config.publishable_key,
                secret_key: config.secret_key || '' // Always include secret_key
            }

            // Only add webhook_secret if it exists and has a value
            if (config.webhook_secret && config.webhook_secret.trim()) {
                payload.webhook_secret = config.webhook_secret.trim()
            }

            const response = await api.post('/stripe/config', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            return response.data
        } catch (error) {
            console.error('Error saving Stripe config:', error)
            throw error
        }
    },

    // Test Stripe connection
    testStripeConnection: async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await api.get('/stripe/test', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return response.data
        } catch (error) {
            console.error('Error testing Stripe connection:', error)
            throw error
        }
    },

    // List payments with filters
    getPayments: async (filters = {}) => {
        try {
            const token = localStorage.getItem('token')
            const queryParams = new URLSearchParams()

            // Add filters to query params
            if (filters.status) queryParams.append('status', filters.status)
            if (filters.start_date) queryParams.append('start_date', filters.start_date)
            if (filters.end_date) queryParams.append('end_date', filters.end_date)
            if (filters.min_amount) queryParams.append('min_amount', filters.min_amount)
            if (filters.max_amount) queryParams.append('max_amount', filters.max_amount)
            if (filters.customer_email) queryParams.append('customer_email', filters.customer_email)
            if (filters.payment_method_type) queryParams.append('payment_method_type', filters.payment_method_type)
            if (filters.refunded !== undefined) queryParams.append('refunded', filters.refunded)
            if (filters.order_by) queryParams.append('order_by', filters.order_by)
            if (filters.order_direction) queryParams.append('order_direction', filters.order_direction)
            if (filters.per_page) queryParams.append('per_page', filters.per_page)
            if (filters.page) queryParams.append('page', filters.page)

            const response = await api.get(`/stripe/payments?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return response.data
        } catch (error) {
            console.error('Error fetching payments:', error)
            throw error
        }
    },

    // Sync payments from Stripe
    syncPayments: async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await api.get('/stripe/payments/sync', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return response.data
        } catch (error) {
            console.error('Error syncing payments:', error)
            throw error
        }
    },

    // Get payment details
    getPaymentDetails: async (paymentId) => {
        try {
            const token = localStorage.getItem('token')
            const response = await api.get(`/stripe/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return response.data
        } catch (error) {
            console.error('Error fetching payment details:', error)
            throw error
        }
    },

    // Refund a payment
    refundPayment: async (paymentId, { amount, reason }) => {
        try {
            const response = await api.post(`/stripe/payments/${paymentId}/refund`, {
                amount: amount ? parseFloat(amount) : undefined,
                reason: reason || 'requested_by_customer'
            })
            return response.data
        } catch (error) {
            console.error('Error processing refund:', error)
            throw error
        }
    },

    // Get list of prestataires
    async getPrestataires() {
        try {
            const response = await api.get('/prestataires')
            return response.data
        } catch (error) {
            console.error('Error fetching prestataires:', error)
            throw error
        }
    },

    // Get list of partners
    async getPartners() {
        try {
            const response = await api.get('/partners')
            return response.data
        } catch (error) {
            console.error('Error fetching partners:', error)
            throw error
        }
    },

    // Create a direct payment
    createPayment: async (data) => {
        try {
            const response = await api.post('/stripe/payments', {
                amount: parseFloat(data.amount),
                currency: data.currency || 'eur',
                recipient_type: data.recipient_type, // 'prestataire' or 'partner'
                recipient_id: data.recipient_id,
                description: data.description,
                metadata: {
                    recipient_type: data.recipient_type,
                    recipient_id: data.recipient_id,
                    ...data.metadata
                }
            })
            return response.data
        } catch (error) {
            console.error('Error creating payment:', error)
            throw error
        }
    }
} 