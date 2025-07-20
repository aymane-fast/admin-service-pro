import api from '../api'

export const agentApi = {
    async fetchAgents() {
        try {
            const response = await api.get('/users');
            const agents = response.data.data.filter(user => user.role === 'agent');
            return agents;
        } catch (error) {
            console.error('Error fetching agents:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            throw error;
        }
    },

    async fetchAgentById(id) {
        try {
            const response = await api.get(`/users/${id}`);
            if (response.data.data.role !== 'agent') {
                throw new Error('User is not an agent');
            }
            return response.data.data;
        } catch (error) {
            console.error('Error fetching agent details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            throw error;
        }
    }
}
