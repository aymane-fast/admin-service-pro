import api from '@/api'

// Helper function
const generateRandomPassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        password += charset[randomIndex]
    }
    return password
}

// Create the API object
const prestatairesApi = {
    async fetchPrestataires(mailPartner = null) {
        try {
            console.log('Fetching prestataires...') // Debug log
            const response = await api.get('/prestataires', {
                params: { mail_partner: mailPartner }
            })
            console.log('Prestataires response:', response.data) // Debug log
            return response.data.data
        } catch (error) {
            console.error('Error fetching prestataires:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            })
            throw error
        }
    },

    async createPrestataire(prestataireData) {
        try {
            console.log('Creating prestataire with data:', prestataireData)
            
            const password = generateRandomPassword()
            
            
            
            // Then create prestataire
            const prestataireResponse = await api.post('/prestataires', {
                first_name: prestataireData.firstName,
                last_name: prestataireData.lastName,
                email: prestataireData.email,
                phone_number: prestataireData.phone,
                address: prestataireData.address,
                zip_code: prestataireData.postalCode,
                city: prestataireData.city,
                companyName: prestataireData.companyName,
                commission_percentage: prestataireData.commission
            })
            
            console.log('Prestataire created:', prestataireResponse.data)
            // Create user first
            const userResponse = await api.post('/register', {
                first_name: prestataireData.firstName,
                last_name: prestataireData.lastName,
                email: prestataireData.email,
                password: password,
                password_confirmation: password,
                role: 'prestataire'
            })
            console.log('User created:', userResponse.data)
            
            return { ...prestataireResponse.data, password }
        } catch (error) {
            console.error('Error creating prestataire:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            })
            throw error
        }
    },

    async getPrestataire(id) {
        try {
            const response = await api.get(`/prestataires/${id}`)
            return response.data.data
        } catch (error) {
            console.error('Error fetching prestataire:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                prestataireId: id
            })
            throw error
        }
    },

    async updatePrestataire(id, prestataireData) {
        try {
            const response = await api.put(`/prestataires/${id}`, {
                first_name: prestataireData.firstName,
                last_name: prestataireData.lastName,
                email: prestataireData.email,
                phone_number: prestataireData.phone_number,
                zip_code: prestataireData.zip_code,
                address: prestataireData.address
            })
            return response.data.data
        } catch (error) {
            console.error('Error updating prestataire:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                prestataireId: id
            })
            throw error
        }
    },

    async resetPrestatairePassword(id) {
        try {
            console.log('Resetting password for prestataire ID:', id)
            const newPassword = generateRandomPassword()
            
            // Use the admin endpoint for changing user passwords
            const response = await api.post(`/users/${id}/change-password`, {
                password: newPassword,
                password_confirmation: newPassword
            })
            
            console.log('Password reset successful:', response.data)
            console.log('Generated password:', newPassword) // Log the password for debugging
            
            return { 
                success: true, 
                message: 'Mot de passe réinitialisé avec succès',
                password: newPassword // Ensure we're returning the correct password
            }
        } catch (error) {
            console.error('Error resetting prestataire password:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            })
            throw error
        }
    },
    
    async adminChangePrestatairePassword(id, password) {
        try {
            console.log('Admin changing password for prestataire ID:', id)
            console.log('New password to set:', password) // Log the password for debugging
            
            const response = await api.post(`/users/${id}/change-password`, {
                password: password,
                password_confirmation: password
            })
            
            console.log('Password change successful:', response.data)
            return { 
                success: true, 
                message: 'Mot de passe modifié avec succès',
                password: password // Ensure we're returning the correct password
            }
        } catch (error) {
            console.error('Error changing prestataire password:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            })
            throw error
        }
    },

    invitePrestataires: async (orderId, prestataireIds) => {
        try {
            const response = await api.post(`/orders/${orderId}/invite`, {
                prestataire_ids: prestataireIds
            })
            return response.data
        } catch (error) {
            console.error('Error inviting prestataires:', error)
            throw error
        }
    }
}

// Export as both named and default export
export { prestatairesApi }
export default prestatairesApi