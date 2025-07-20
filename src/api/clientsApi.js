import api from '../api'

export const fetchClients = async () => {
    try {
        const response = await api.get('/clients')
        return response.data.data
    } catch (error) {
        console.error('Error fetching clients:', error)
        throw error
    }
}

export const createClient = async (clientData) => {
    try {
        const response = await api.post('/clients', {
            first_name: clientData.firstName,
            last_name: clientData.lastName,
            type: clientData.type,
            phone_number: clientData.phone,
            address: clientData.address,
            profile_pic_path: null,
            zip_code: clientData.postalCode,
            city: clientData.city,
            email: clientData.email,
            entreprise_name: clientData.entreprise_name
        })
        return response.data
    } catch (error) {
        console.error('Error creating client:', error)
        throw error
    }
}

export const getClient = async (id) => {
    try {
        const response = await api.get(`/clients/${id}`)
        return response.data.data
    } catch (error) {
        console.error('Error fetching client:', error)
        throw error
    }
}

export const updateClient = async (id, clientData) => {
    try {
        const response = await api.put(`/clients/${id}`, {
            first_name: clientData.firstName,
            last_name: clientData.lastName,
            type: clientData.type,
            phone_number: clientData.phone,
            address: clientData.address,
            profile_pic_path: null,
            zip_code: clientData.postalCode,
            email: clientData.email,
            entreprise_name: clientData.entreprise_name
        })
        return response.data
    } catch (error) {
        console.error('Error updating client:', error)
        throw error
    }
}
