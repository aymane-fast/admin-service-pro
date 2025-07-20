'use client'
import Link from 'next/link'

export default function Header({ searchQuery, setSearchQuery, toggleSidebar }) {
  return (
    <div className="flex justify-between items-center bg-white rounded-xl shadow-sm p-4 border-b-[3px] border-[#205D9E] mb-8">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-[#205D9E] hover:text-[#1a4d84] p-2"
          aria-label="Toggle Menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="flex-1">
          <Link
            href="/service-orders/create"
            className="inline-flex items-center justify-center gap-2 bg-[#205D9E] text-white px-4 sm:px-6 py-2.5 rounded-xl hover:bg-[#1a4d84] transition-colors text-sm sm:text-base whitespace-nowrap"
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
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden sm:inline">Créer un ordre de service</span>
            <span className="sm:hidden">Créer OS</span>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
        <Link href="/stripe" className="hover:opacity-80 transition-opacity">
          <img src="/stripe.svg" alt="Stripe" className="h-5 sm:h-6" />
        </Link>
        <Link href="/calls" className="hover:opacity-80 transition-opacity">
          <img src="/ringover.svg" alt="Ringover" className="h-5 sm:h-6" />
        </Link>
        <Link href="/inbox" className="hover:opacity-80 transition-opacity">
          <img src="/gmail.svg" alt="Gmail" className="h-5 sm:h-6" />
        </Link>
        <img src="/profile.svg" alt="Profile" className="h-8 w-8 rounded-full object-cover" />
      </div>
    </div>
  )
}
