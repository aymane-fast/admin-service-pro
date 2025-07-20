'use client'
import { useState } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import EnterprisesTable from '@/components/EnterprisesTable'
import Link from 'next/link'

export default function Enterprises() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full lg:w-auto">
        <div className="p-4 sm:p-6 space-y-6">
          <Header 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            toggleSidebar={toggleSidebar}
          />

          <div className="bg-white rounded-xl shadow-sm">
            <div className="bg-blue-900 p-4 sm:p-6 rounded-t-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 sm:w-6 h-5 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Liste des entreprises partenaire
                  </h2>
                </div>
                <Link
                  href="/partners/create"
                  className="inline-flex items-center justify-center gap-2 bg-green-500/25 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-green-500/30 transition-colors text-sm sm:text-base"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="hidden sm:inline">Créer un partenaire</span>
                  <span className="sm:hidden">Créer</span>
                </Link>
              </div>
            </div>

            <EnterprisesTable searchQuery={searchQuery} />
          </div>
        </div>
      </div>
    </div>
  )
}



