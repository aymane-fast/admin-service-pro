import api from '../api'

export const createServiceOrder = async (data) => {
  try {
    // Filter out null values from images array
    const images = (data.images || []).filter(image => image != null)
    
    const requestData = {
      client_id: data.client_id,
      partner_id: data.partner_id,
      date_intervention: data.date_intervention,
      heure_intervention: data.heure_intervention,
      description: data.description,
      images: images // Send only valid image paths
    };

    const response = await api.post('/orders', requestData);
    return response.data;
  } catch (error) {
    console.error('Service Order API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      error: error.message
    });
    throw error;
  }
}

export const fetchServiceOrders = async () => {
  try {
    const response = await api.get('/orders')
    
    // Get the data from the response
    let orders = response.data
    
    // Handle different response formats
    if (orders && orders.data && Array.isArray(orders.data)) {
      orders = orders.data
    } else if (!Array.isArray(orders)) {
      orders = []
    }
    
    // Sort orders by date with the latest first
    orders.sort((a, b) => {
      // First try to sort by created_at date
      const dateA = a.created_at ? new Date(a.created_at) : null
      const dateB = b.created_at ? new Date(b.created_at) : null
      
      // If both have created_at dates, compare them
      if (dateA && dateB) {
        return dateB - dateA // Latest first
      }
      
      // Fall back to date_intervention if created_at is not available
      const interventionDateA = a.date_intervention ? new Date(a.date_intervention) : null
      const interventionDateB = b.date_intervention ? new Date(b.date_intervention) : null
      
      if (interventionDateA && interventionDateB) {
        return interventionDateB - interventionDateA // Latest first
      }
      
      // If no dates are available, sort by ID (assuming higher IDs are newer)
      return (b.id || 0) - (a.id || 0)
    })
    
    console.log(`Fetched ${orders.length} orders, sorted with latest first`)
    return orders
  } catch (error) {
    console.error('Error fetching service orders:', error)
    throw error
  }
}

export const getOrderById = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching order:', error)
    throw error
  }
}

export const updateServiceOrder = async (id, data) => {
  try {
    const response = await api.put(`/orders/${id}`, data)
    return response.data
  } catch (error) {
    console.error('Error updating service order:', error)
    throw error
  }
}

export const updateOrderPrice = async (id, price) => {
  try {
    const response = await api.patch(`/orders/${id}`, { price: parseFloat(price) })
    return response.data
  } catch (error) {
    console.error('Error updating order price:', error)
    throw error
  }
}

export const deleteServiceOrder = async (id) => {
  try {
    const response = await api.delete(`/orders/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getPrestataire = async (id) => {
  try {
    const response = await api.get(`/prestataires/${id}`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching prestataire:', error)
    throw error
  }
}
