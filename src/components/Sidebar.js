'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutFromSubdomain } from '../utils/auth'

export default function Sidebar({ isOpen, closeSidebar }) {
  const pathname = usePathname()

  const isActive = (href) => {
    if (href === '/' || href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard'
    }
    return pathname === href
  }

  const menuItems = [
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5">
          <path d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zM14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5zM4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5zM14 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-5z" />
        </svg>
      ),
      label: 'Tableau de bord',
      href: '/dashboard'
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'Ordre de service',
      href: '/orders'
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'Produit',
      href: '/products'
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5">
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      label: 'Clients',
      href: '/clients'
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      label: 'Prestataire',
      href: '/providers'
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5">
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      label: 'Partenaire',
      href: '/partners'
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'Devis',
      href: '/quotes'
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5">
          <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Factures',
      href: '/invoices'
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5">
          <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      label: 'Paiements',
      href: '/payments'
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      label: 'Agent',
      href: '/agents'
    }
  ]

  const handleLogout = async () => {
    closeSidebar?.();  
    await logoutFromSubdomain();
  };

  return (
    <div className={`w-64 bg-white border-r border-gray-100 flex flex-col h-screen lg:min-h-screen overflow-hidden lg:relative ${
      isOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden lg:flex'
    }`}>
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center justify-center">
          <Image 
            src="/logo.svg" 
            alt="ServicePro" 
            width={100}
            height={100}
            className="rounded-xl w-auto h-auto max-w-[80%] lg:max-w-full"
            priority
          />
        </div>
        
        {/* Close button for mobile */}
        <button
          onClick={closeSidebar}
          className="lg:hidden text-gray-500 hover:text-gray-700"
          aria-label="Close Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActiveItem = isActive(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl mb-1 transition-colors ${
                isActiveItem 
                  ? 'bg-[#205D9E] text-white' 
                  : 'text-gray-600 hover:bg-blue-50'
              }`}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  closeSidebar?.();
                }
              }}
            >
              <span className={isActiveItem ? 'text-white' : 'text-[#205D9E]'}>{item.icon}</span>
              <span className="ml-3 text-sm lg:text-base">{item.label}</span>
            </Link>
          )
        })}
        
        {/* Settings Section - Add this near the bottom of your navigation list */}
        <li className="pt-4 mt-4 border-t border-gray-200">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#205D9E] hover:bg-blue-50 rounded-lg transition-colors"
            onClick={() => closeSidebar?.()}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
            Settings
          </Link>
        </li>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 rounded-xl w-full"
        >
          <svg className="w-5 h-5 text-[#205D9E]" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="ml-3">Se déconnecter</span>
        </button>
      </div>
    </div>
  )
}
