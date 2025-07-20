'use client';

import { logoutFromSubdomain } from '../utils/auth';

export default function LogoutButton() {
    const handleLogout = async () => {
        await logoutFromSubdomain();
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
        >
            Logout
        </button>
    );
}
