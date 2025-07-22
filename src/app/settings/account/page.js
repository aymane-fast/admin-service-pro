'use client'
import { useState } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import SettingsSidebar from '@/components/SettingsSidebar'
import { PublicResetPasswordModal } from '@/components/ResetPasswordModal';

export default function AccountSettings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

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
              <h2 className="text-lg sm:text-xl font-semibold text-white">Settings</h2>
              <p className="text-sm text-blue-100 mt-1">Manage your application settings</p>
            </div>

            <div className="flex min-h-[calc(100vh-16rem)]">
              {/* Settings Sidebar - Inside Card */}
              <div className="border-r border-gray-100">
                <SettingsSidebar />
              </div>

              {/* Settings Content */}
              <div className="flex-1 px-8 py-6">
                <div className="max-w-2xl">
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900">Account Settings </h3>
                    <p className="text-sm text-gray-500 mt-1">Manage your account preferences and personal information</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg px-6 py-8 text-center">
                    <svg 
                      className="w-12 h-12 mx-auto text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 48 48"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M32 14a8 8 0 11-16 0 8 8 0 0116 0zm-8 12c-9.941 0-18 8.059-18 18h36c0-9.941-8.059-18-18-18z"
                      />
                    </svg>
                    <h3 className="mt-4 text-sm font-medium text-gray-900">Account Settings Coming Soon</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      We're working on adding account management features.
                      Check back soon for updates.
                    </p>
                    <button
                      className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      onClick={() => setShowResetModal(true)}
                    >
                      Reset Password
                    </button>
                  </div>
                  <PublicResetPasswordModal isOpen={showResetModal} onClose={() => setShowResetModal(false)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 