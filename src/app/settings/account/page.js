'use client'
import { useState } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import SettingsSidebar from '@/components/SettingsSidebar'
import { PublicResetPasswordModal as ResetPasswordModal } from '@/components/ResetPasswordModal';

export default function AccountSettings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Main Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-4 sm:p-6 space-y-6">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          <div className="bg-white rounded-xl shadow-sm">
            <div className="bg-[#205D9E] p-4 sm:p-6 rounded-t-xl">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Account Settings</h2>
              <p className="text-sm text-blue-100 mt-1">Manage your account preferences and personal information</p>
            </div>

            <div className="flex min-h-[calc(100vh-16rem)]">
              {/* Settings Sidebar - Inside Card */}
              <div className="border-r border-gray-100">
                <SettingsSidebar />
              </div>

              {/* Settings Content */}
              <div className="flex-1 px-8 py-6">
                <div className="max-w-2xl space-y-8">
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900">Account Security</h3>
                    <p className="text-sm text-gray-500 mt-1">Change your password or reset it if you forgot it.</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-6 py-8 flex flex-col gap-6">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
                      onClick={() => setShowChangePassword(true)}
                    >
                      Change Password
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-200 text-blue-700 rounded-lg hover:bg-gray-300 w-full sm:w-auto"
                      onClick={() => setShowResetModal(true)}
                    >
                      Reset Password (Forgot?)
                    </button>
                  </div>
                  {showChangePassword && <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />}
                  <ResetPasswordModal isOpen={showResetModal} onClose={() => setShowResetModal(false)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'Error changing password');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700" placeholder="Enter current password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700" placeholder="Enter new password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700" placeholder="Confirm new password" />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {message && <div className="text-green-600 text-sm">{message}</div>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">{loading ? 'Changing...' : 'Change Password'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 