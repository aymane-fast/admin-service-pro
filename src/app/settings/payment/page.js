'use client'
import { useState } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import SettingsSidebar from '@/components/SettingsSidebar'
import StripeConfig from '@/components/StripeConfig'
export default function PaymentSettings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
                    <h3 className="text-xl font-semibold text-gray-900">Payment Settings</h3>
                    <p className="text-sm text-gray-500 mt-1">Configure your payment and billing preferences</p>
                  </div>

                    <StripeConfig />
                  {/* <div className="bg-gray-50 rounded-lg px-6 py-8 text-center">
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
                        d="M6 20h36M12 30h2m8 0h2M8 40h32a4 4 0 004-4V16a4 4 0 00-4-4H8a4 4 0 00-4 4v20a4 4 0 004 4z"
                      />
                    </svg>
                    <h3 className="mt-4 text-sm font-medium text-gray-900">Payment Settings Coming Soon</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      We're working on adding payment and billing configuration options.
                      Check back soon for updates.
                    </p>
                  </div> */}
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 