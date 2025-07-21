'use client';

import { AUTH_ENDPOINTS, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../api';
import { safeLocalStorage } from './tokenHandler';

/**
 * Performs API logout and cleans up local storage
 */
export async function logoutFromAPI(token) {
    try {
        await fetch(AUTH_ENDPOINTS.LOGOUT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Logout API error:', error);
    }
}

/**
 * Clears all auth-related data from local storage
 */
export function clearAuthStorage() {
    const storage = safeLocalStorage();
    storage.removeItem(AUTH_TOKEN_KEY);
    storage.removeItem(AUTH_USER_KEY);
}

/**
 * Performs complete logout from subdomain
 * - Calls logout API
 * - Clears local storage
 * - Redirects to main login app with logout signal
 */
export async function logoutFromSubdomain() {
    try {
        const storage = safeLocalStorage();
        const token = storage.getItem(AUTH_TOKEN_KEY);
        if (token) {
            await logoutFromAPI(token);
        }
        clearAuthStorage();
        
        window.location.href = `${process.env.NEXT_PUBLIC_ADMIN_URL}/?logout=true`;
        // window.location.href = 'http://localhost:3001/?logout=true';
    } catch (error) {
        console.error('Logout error:', error);
        // Still clear storage and redirect even if API call fails
        clearAuthStorage();
        window.location.href = `${process.env.NEXT_PUBLIC_ADMIN_URL}/?logout=true`;
        // window.location.href = 'http://localhost:3001/?logout=true';
    }
}

/**
 * Check if the current URL indicates a logout redirect
 */
export function isLogoutRedirect() {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('logout') === 'true';
}

/**
 * Handle logout redirect in main login app
 * Clears local storage if logout parameter is present
 */
export function handleLogoutRedirect() {
    if (isLogoutRedirect()) {
        clearAuthStorage();
    }
}

/**
 * HOC to wrap pages that require authentication
 */
export function withAuth(WrappedComponent) {
    return function AuthenticatedComponent(props) {
        useEffect(() => {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) {
                // window.location.href = 'https://service-pro-admin-master.vercel.app/login'; // commented out for local dev
                window.location.href = `${process.env.NEXT_PUBLIC_ADMIN_URL}/login`;
            }
        }, []);

        return <WrappedComponent {...props} />;
    };
}
