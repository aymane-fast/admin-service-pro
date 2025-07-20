import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SettingsSidebar() {
  const pathname = usePathname()
  
  const settingsMenuItems = [
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      label: 'Gmail API',
      description: 'Email integration settings',
      href: '/settings'
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      label: 'Stripe',
      description: 'Payment configuration',
      href: '/settings/payment'
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Account',
      description: 'Personal information',
      href: '/settings/account'
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      label: 'Notifications',
      description: 'Alert preferences',
      href: '/settings/notifications'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      label: 'WhatsApp',
      description: 'WhatsApp configuration',
      href: '/settings/whatsapp'
    }
  ]

  return (
    <div className="w-64 bg-gray-50 h-full">
      <nav className="p-4 space-y-1">
        {settingsMenuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-start px-3 py-3 rounded-lg transition-all duration-150 ${
                isActive 
                  ? 'bg-white shadow-sm ring-1 ring-gray-100' 
                  : 'hover:bg-white hover:shadow-sm'
              }`}
            >
              <span className={`mt-0.5 ${isActive ? 'text-[#205D9E]' : 'text-gray-500'}`}>
                {item.icon}
              </span>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  isActive ? 'text-[#205D9E]' : 'text-gray-700'
                }`}>
                  {item.label}
                </p>
                <p className={`text-xs mt-0.5 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {item.description}
                </p>
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 