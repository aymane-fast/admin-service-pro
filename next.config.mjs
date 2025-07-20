/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'localhost', 
            '127.0.0.1'
            // '720b-192-241-145-160.ngrok-free.app' // Added ngrok domain
        ],
    },
};

export default nextConfig;
