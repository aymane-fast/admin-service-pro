import api from '@/api'

export const fetchOrders = async (orderId) => {
    if (!orderId) {
        throw new Error('Order ID is required')
    }

    try {
        console.log('Making API call to fetch order:', orderId)
        const response = await api.get(`/orders/${orderId}`)
        console.log('API response:', response.data)

        // Ensure we have valid data
        if (!response.data) {
            throw new Error('No data received from server')
        }

        // If the response has a data property, use it, otherwise use the response directly
        const orderData = response.data.data || response.data

        // Ensure client data exists
        if (!orderData.client) {
            console.warn('Warning: Client data missing in order response')
            orderData.client = null
        }

        return orderData
    } catch (error) {
        console.error('API error:', error)
        if (error.response?.status === 404) {
            throw new Error('Ordre de service non trouvé')
        }
        throw error
    }
}

export const fetchPrestataires = async () => {
    try {
        const response = await api.get('/prestataires')
        return response.data.data
    } catch (error) {
        console.error('Error fetching prestataires:', error)
        throw error
    }
}

export const assignPrestataire = async (orderId, prestataireId) => {
    if (!orderId || !prestataireId) {
        throw new Error('ID de l\'ordre et du prestataire sont requis')
    }

    try {
        // First, get the current order data to ensure we have all the information
        const currentOrder = await fetchOrders(orderId)
        
        // Make the assign prestataire request
        const response = await api.post(`/orders/${orderId}/select-prestataire`, {
            prestataire_id: prestataireId
        })

        if (!response.data || !response.data.data) {
            throw new Error('Réponse invalide du serveur')
        }

        // Merge the response data with the current order data to ensure we have all fields
        const orderData = {
            ...currentOrder,
            ...response.data.data,
            client: currentOrder.client, // Ensure client data is preserved
            prestataire: response.data.data.prestataire || null,
            prestataire_id: prestataireId
        }

        if (!orderData.prestataire) {
            console.warn('Warning: Prestataire data missing in response')
        }

        return orderData
    } catch (error) {
        console.error('Error assigning prestataire:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        })
        
        if (error.response?.status === 404) {
            throw new Error('Ordre de service ou prestataire non trouvé')
        } else if (error.response?.status === 403) {
            throw new Error('Non autorisé à assigner ce prestataire')
        } else if (error.response?.data?.message) {
            throw new Error(error.response.data.message)
        } else {
            throw new Error('Erreur lors de l\'assignation du prestataire')
        }
    }
}

export const fetchOrderInvitations = async (orderId) => {
    try {
        console.log('Fetching invitations for order:', orderId)
        const response = await api.get(`/orders/${orderId}/invitations`)
        console.log('Invitations response:', response.data)
        // The API returns { status: "success", data: [...] }
        return response.data.data || []
    } catch (error) {
        console.error('Error fetching invitations:', error)
        return []
    }
}

export const fetchPayments = async (orderId) => {
    try {
        const response = await api.get(`/payments?order_id=${orderId}`)
        return response.data.data
    } catch (error) {
        console.error('Error fetching payments:', error)
        throw error
    }
}

export const fetchQuotes = async (orderId) => {
    try {
        const response = await api.get(`/quotes?order_id=${orderId}`)
        return response.data.data
    } catch (error) {
        throw error
    }
}

export const removePrestataire = async (orderId, reason = null) => {
    if (!orderId) {
        throw new Error('Order ID is required')
    }

    try {
        const response = await api.delete(`/orders/${orderId}/remove-prestataire`, {
            data: { reason }
        })

        if (!response.data) {
            throw new Error('No data received from server')
        }

        return response.data
    } catch (error) {
        console.error('Error removing prestataire:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        })
        
        // Throw a more specific error
        if (error.response?.status === 404) {
            throw new Error('Order not found')
        } else if (error.response?.status === 403) {
            throw new Error('Not authorized to remove prestataire')
        } else if (error.response?.data?.message) {
            throw new Error(error.response.data.message)
        } else {
            throw new Error('Failed to remove prestataire')
        }
    }
}
