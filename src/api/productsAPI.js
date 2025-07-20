import api from '../api'

export const productsApi = {
    // Fetch all products
    fetchProducts: async () => {
        try {
            console.log('Fetching products from:', api.defaults.baseURL + '/products')
            
            const response = await api.get('/products')
            console.log('Raw API response:', response)
            
            // Check if we have data
            if (!response.data) {
                console.warn('No data in response:', response)
                return []
            }

            // Handle different response formats
            let products
            if (response.data.data) {
                products = response.data.data
            } else if (Array.isArray(response.data)) {
                products = response.data
            } else {
                console.warn('Unexpected data format:', response.data)
                products = []
            }

            console.log('Processed products:', products)
            return products

        } catch (error) {
            console.error('Products API Error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            })
            throw error
        }
    },

    // Create a new product
    createProduct: async (productData) => {
        try {
            const response = await api.post('/products', {
                name: productData.name,
                description: productData.description,
                price: productData.price
            })
            return response.data
        } catch (error) {
            console.error('Error creating product:', error)
            throw error
        }
    },

    // Get a single product by ID
    getProduct: async (id) => {
        try {
            const response = await api.get(`/products/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching product:', error)
            throw error
        }
    },

    // Update a product
    updateProduct: async (id, productData) => {
        try {
            const response = await api.put(`/products/${id}`, {
                name: productData.name,
                description: productData.description,
                price: productData.price
            })
            return response.data
        } catch (error) {
            console.error('Error updating product:', error)
            throw error
        }
    },

    // Delete a product
    deleteProduct: async (id) => {
        try {
            const response = await api.delete(`/products/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting product:', error)
            throw error
        }
    }
}
