import axios from 'axios';

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;

// Auth endpoints and configuration
export const AUTH_ENDPOINTS = {
    LOGIN: `${BASE_URL}/login`,  
    LOGOUT: `${BASE_URL}/logout`,
};

export const AUTH_TOKEN_KEY = 'token';
export const AUTH_USER_KEY = 'user';
export const MAIN_APP_DOMAIN = process.env.NEXT_PUBLIC_ADMIN_URL;

export const API_CONFIG = {
    baseHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withAuth: (token) => ({
        ...API_CONFIG.baseHeaders,
        'Authorization': `Bearer ${token}`
    })
};

// Create an axios instance with default configuration
const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    },
    withCredentials: false
});

// Add request interceptor
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        
        // Ensure headers exist
        if (!config.headers) {
            config.headers = {}
        }
        
        // Add ngrok bypass header
        config.headers['ngrok-skip-browser-warning'] = 'true'
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Log request for debugging
        console.log('Making request:', {
            url: config.url,
            method: config.method,
            headers: config.headers
        })
        
        return config
    },
    error => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
    }
);

// Add response interceptor
api.interceptors.response.use(
    response => {
        if (response.headers['content-type']?.includes('text/html')) {
            console.error('Received HTML response instead of JSON')
            throw new Error('Invalid API response format')
        }
        return response
    },
    error => {
        // Handle specific error cases
        // if (error.response?.status === 401) {
        //     localStorage.removeItem('token')
        //     window.location.href = '/loginonApi'
        //     return Promise.reject(new Error('Unauthorized - Please log in'))
        // }
        
        if (error.message === 'Network Error') {
            console.error('Network Error - Check API connection')
            return Promise.reject(new Error('Unable to connect to API'))
        }

        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        })
        
        return Promise.reject(error)
    }
);

export default api;

// Function to upload a file
export const uploadFile = async (file, type = 'quote') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    
    const response = await api.post('/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return response.data
}
