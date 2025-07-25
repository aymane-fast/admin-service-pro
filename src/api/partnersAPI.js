import api from '../api'
import axios from 'axios'

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

const partnersApi = {
    async fetchPartners() {
        try {
            const response = await api.get('/partners')
            return response.data.data
        } catch (error) {
            console.error('Error fetching partners:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            })
            throw error
        }
    },

    async createPartner(partnerData) {
        try {
            console.log('Creating partner with data:', partnerData)
            const password = generateRandomPassword()
            
            // First create the user
            let userResponse;
            try {
                userResponse = await api.post('/register', {
                    first_name: partnerData.first_name,
                    last_name: partnerData.last_name,
                    name: partnerData.name,
                    email: partnerData.email,
                    password: password,
                    password_confirmation: password,
                    role: 'partner'
                })
                console.log('User created:', userResponse.data)
            } catch (error) {
                // Check if it's an email already exists error
                if (error.response?.status === 422 && 
                    error.response?.data?.errors?.email?.[0]?.includes('already')) {
                    throw {
                        response: error.response,
                        status: 422,
                        message: "Cette adresse email est déjà utilisée"
                    }
                }
                console.error('User creation failed:', error.response?.data)
                throw {
                    ...error,
                    message: error.response?.data?.message || 'Failed to create user account'
                }
            }

            // Then create the partner with exact field names from API response
            try {
                const partnerResponse = await api.post('/partners', {
                    first_name: partnerData.first_name,
                    last_name: partnerData.last_name,
                    name: partnerData.name,
                    email: partnerData.email,
                    commission: partnerData.commission,
                    phone: partnerData.phone,
                    zip_code: partnerData.zip_code,
                    address: partnerData.address,
                    city: partnerData.city
                })
                console.log('Partner created:', partnerResponse.data)

                return {
                    ...partnerResponse.data,
                    user: userResponse.data.data,
                    generatedPassword: password
                }
            } catch (error) {
                // If partner creation fails, we should handle the orphaned user
                console.error('Partner creation failed:', error.response?.data)
                throw {
                    ...error,
                    message: error.response?.data?.message || 'Failed to create partner profile'
                }
            }
        } catch (error) {
            console.error('Error creating partner:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            })
            throw error
        }
    },

    async getPartner(id) {
        try {
            const response = await api.get(`/partners/${id}`)
            return response.data.data
        } catch (error) {
            console.error('Error fetching partner:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                partnerId: id
            })
            throw error
        }
    },

    async updatePartner(id, partnerData) {
        try {
            const response = await api.put(`/partners/${id}`, {
                ...partnerData
            })
            return response.data.data
        } catch (error) {
            console.error('Error updating partner:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                partnerId: id
            })
            throw error
        }
    },

    async resetPartnerPassword(id) {
        try {
            console.log('Resetting password for partner ID:', id)
            const newPassword = generateRandomPassword()
            
            // Use the admin endpoint for changing user passwords
            const response = await api.post(`/users/${id}/change-password`, {
                password: newPassword,
                password_confirmation: newPassword
            })
            
            console.log('Password reset successful:', response.data)
            console.log('Generated password:', newPassword)
            
            return { 
                success: true, 
                message: 'Mot de passe réinitialisé avec succès',
                password: newPassword
            }
        } catch (error) {
            console.error('Error resetting partner password:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            })
            throw error
        }
    },
    
    async adminChangePartnerPassword(id, password) {
        try {
            console.log('Admin changing password for partner ID:', id)
            console.log('New password to set:', password)
            
            const response = await api.post(`/users/${id}/change-password`, {
                password: password,
                password_confirmation: password
            })
            
            console.log('Password change successful:', response.data)
            return { 
                success: true, 
                message: 'Mot de passe modifié avec succès',
                password: password
            }
        } catch (error) {
            console.error('Error changing partner password:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            })
            throw error
        }
    }
}

export const createPartner = async (partnerData) => {
    try {
        const token = localStorage.getItem('token')
        const password = generateRandomPassword()

        // First, register the user
        const userResponse = await axios.post(`${API_URL}/register`, {
            first_name: partnerData.first_name,
            last_name: partnerData.last_name,
            email: partnerData.email,
            password: password,
            password_confirmation: password,
            role: 'partner'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        // Then, create the partner
        const partnerResponse = await axios.post(`${API_URL}/partners`, {
            name: partnerData.name,
            email: partnerData.email,
            commission: partnerData.commission,
            phone: partnerData.phone,
            address: partnerData.address,
            zip_code: partnerData.zip_code,
            city: partnerData.city
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        return {
            ...partnerResponse.data,
            generatedPassword: password
        }
    } catch (error) {
        console.error('Error creating partner:', error)
        if (error.response?.data?.errors) {
            const errorMessage = Object.values(error.response.data.errors)
                .flat()
                .join(', ')
            throw new Error(errorMessage)
        }
        throw error
    }
}

export { partnersApi }
export default partnersApi
