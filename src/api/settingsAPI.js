import api from '../api'

export const settingsApi = {
  fetchSettings: async () => {
    try {
      const response = await api.get('/settings')
      // Ensure we return an array, even if empty
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching settings:', error)
      throw error
    }
  },
  // ... other methods
} 