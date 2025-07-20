'use client';

import { useEffect, useState } from 'react';
import { getDecryptedTokenFromUrl } from '../utils/tokenHandler';
import { handleLogoutRedirect } from '../utils/auth';
import { AUTH_TOKEN_KEY } from '../api';

/**
 * AuthProvider component for Next.js applications
 * Handles auth token initialization and logout functionality
 */
// const LOGIN_URL = 'https://service-pro-admin-master.vercel.app/login'; 
const LOGIN_URL = 'http://localhost:3001/login';
// const '/login' = 'http://localhost:3001/login';

export default function AuthProvider({ children }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            // Handle logout redirect first
            handleLogoutRedirect();

            // Try to get token from URL
            // var fakeToken = "21|9meSfDKpHF4AUDS8xBdrPeivXN4AW0O4xcpgTbgvc0a4cd9f"
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            
            if (token) {
                // Store the decrypted token
                localStorage.setItem(AUTH_TOKEN_KEY, token);
                setLoading(false);
            } else {
                // Check if we already have a token in storage
                const existingToken = localStorage.getItem(AUTH_TOKEN_KEY);
                if (!existingToken) {
                    // Redirect to login page if no valid token
                    setLoading(false);
                    
                    if(window.location.pathname !== '/login'){
                        // window.location.href = LOGIN_URL;
                        window.location.href = '/login';
                    }

                } 
            }
        } catch (err) {DZZ
            console.error('Auth initialization error:', err);
            // Redirect to login on error
            // window.location.href = LOGIN_URL;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    // Make logout function available globally
    // if (typeof window !== 'undefined') {
    //     window.logoutFromSubdomain = async () => {
    //         clearAuthStorage();
    //         window.location.href = `${window.location.protocol}//${process.env.NEXT_PUBLIC_MAIN_APP_DOMAIN}?logout=true`;
    //     };
    // }

    return children;
}

/**
 * Usage in your Next.js app:
 * 
 * // pages/_app.js
 * import AuthProvider from '../components/AuthProvider';
 * 
 * export default function MyApp({ Component, pageProps }) {
 *   return (
 *     <AuthProvider>
 *       <Component {...pageProps} />
 *     </AuthProvider>
 *   );
 * }
 * 
 * // Then in any component that needs to handle logout:
 * export default function LogoutButton() {
 *   const handleLogout = () => {
 *     window.logoutFromSubdomain();
 *   };
 * 
 *   return (
 *     <button
 *       onClick={handleLogout}
 *       className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
 *     >
 *       Logout
 *     </button>
 *   );
 * }
 */
