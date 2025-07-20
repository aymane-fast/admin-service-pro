'use client'
import { useState } from 'react'
import Image from 'next/image'
import Sidebar from './Sidebar'

export default function MobileHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <>
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Image 
          src="/logo.svg" 
          alt="ServicePro" 
          width={80}
          height={80}
          className="w-auto h-8"
          priority
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Dark overlay */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50">
            <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
} 