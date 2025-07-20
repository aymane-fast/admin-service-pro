import api from '../api'

export const orderInvitationsApi = {
  // Send invitations to multiple prestataires
  invitePrestataires: async (orderId, prestataires) => {
    try {
      const response = await api.post(`/orders/${orderId}/invite`, {
        prestataire_ids: prestataires
      })
      return response.data
    } catch (error) {
      console.error('Error inviting prestataires:', error)
      throw error
    }
  },

  // Get all invitations for an order
  getOrderInvitations: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/invitations`)
      return response.data
    } catch (error) {
      console.error('Error fetching order invitations:', error)
      throw error
    }
  },

  // Select a prestataire for the order
  selectPrestataire: async (orderId, prestataire_id) => {
    try {
      const response = await api.post(`/orders/${orderId}/select-prestataire`, {
        prestataire_id
      })
      return response.data
    } catch (error) {
      console.error('Error selecting prestataire:', error)
      throw error
    }
  }
} 