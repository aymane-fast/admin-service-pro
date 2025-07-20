import api from '../api'

export const fetchOrders = async () => {
    try {
        const response = await api.get('/orders')
        const data = response.data.data
        
        // Ensure we have an array of orders
        if (!Array.isArray(data)) {
            console.warn('fetchOrders: Expected array but got:', typeof data)
            return []
        }
        
        // Sort orders by date (latest first)
        const sortedOrders = [...data].sort((a, b) => {
            // First try to sort by created_at date
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
            
            if (dateA !== dateB) return dateB - dateA
            
            // If created_at dates are the same, try intervention date
            const interventionDateA = a.date_intervention ? new Date(a.date_intervention).getTime() : 0
            const interventionDateB = b.date_intervention ? new Date(b.date_intervention).getTime() : 0
            
            if (interventionDateA !== interventionDateB) return interventionDateB - interventionDateA
            
            // If all dates are the same, sort by ID (higher ID is usually more recent)
            return (b.id || 0) - (a.id || 0)
        })
        
        console.log(`fetchOrders: Retrieved ${sortedOrders.length} orders, sorted with latest first`)
        return sortedOrders
    } catch (error) {
        console.error('Error fetching orders:', error)
        return []
    }
}

export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', {
      client_id: orderData.client_id,
      date: orderData.date,
      time: orderData.time,
      description: orderData.description,
      partner_id: orderData.partner_id,
      prestataire_id: orderData.prestataire_id,
      prestataire_percentage: orderData.prestataire_percentage,
      images: orderData.images
    })
    return response.data
  } catch (error) {
    throw error
  }
}
