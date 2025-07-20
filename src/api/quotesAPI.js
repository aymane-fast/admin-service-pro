import api from '../api'

// Add request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const quotesApi = {
  getQuotes: async () => {
    try {
      const response = await api.get('/quotes')
      return response.data
    } catch (error) {
      console.error('Error fetching quotes:', error)
      throw error
    }
  },

  getQuote: async (id) => {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        console.log(`Attempt ${retryCount + 1}: Fetching all quotes...`);
        const response = await api.get('/quotes');
        console.log('API Response:', {
          status: response.status,
          data: response.data,
          headers: response.headers
        });

        if (!response.data) {
          throw new Error('No data in response');
        }

        const quotes = Array.isArray(response.data) ? response.data : [response.data];
        console.log('Parsed quotes:', quotes);

        const parsedId = parseInt(id);
        console.log('Looking for quote with ID:', parsedId);

        const quote = quotes.find(q => q.id === parsedId);
        console.log('Found quote:', quote);

        if (!quote) {
          throw new Error(`Quote with ID ${id} not found`);
        }

        return quote;
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });

        retryCount++;
        if (retryCount === maxRetries) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }
  },

  getQuoteById: async (id) => {
    try {
      const response = await api.get(`/quotes/${id}`)
      console.log('API Response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching quote:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      })
      throw error
    }
  },

  downloadQuote: async (id) => {
    try {
      const response = await api.get(`/quotes/${id}/download`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error downloading quote:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      })
      throw error
    }
  },

  createQuote: async (quoteData) => {
    try {
      console.log('Creating quote with data:', quoteData);
      const response = await api.post('/quotes', quoteData);
      console.log('Quote creation response:', response.data);
      
      // Return the response data directly since it's already in the correct format
      // return response.data;
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  },

  updateQuote: async (id, quoteData) => {
    try {
      console.log("test updatze : " , quoteData);
      
      const response = await api.put(`/quotes/${id}`, quoteData)
      return response.data
    } catch (error) {
      console.error('Error updating quote:', error)
      throw error
    }
  },

  deleteQuote: async (id) => {
    try {
      await api.delete(`/quotes/${id}`)
      return true
    } catch (error) {
      console.error('Error deleting quote:', error)
      throw error
    }
  },

  async acceptQuote(id) {
    try {
      const response = await api.post(`/quotes/${id}/accept`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async refuseQuote(id) {
    try {
      const response = await api.post(`/quotes/${id}/refuse`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  sendQuoteByEmail: async (id, email) => {
    try {
      const response = await api.post(`/quotes/${id}/send`, { email });
      return response.data;
    } catch (error) {
      console.error('Error sending quote by email:', error);
      throw error;
    }
  },
}
