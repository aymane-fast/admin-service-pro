'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { emailsApi } from '@/api/emailsAPI'
import StripeConfig from '@/components/StripeConfig'
import SettingsSidebar from '@/components/SettingsSidebar'
import { usePathname } from 'next/navigation'

export default function Settings() {
  const pathname = usePathname()
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [redirectUri, setRedirectUri] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentConfig, setCurrentConfig] = useState(null)
 
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await emailsApi.getGmailConfig()
        if (response.data?.length > 0) {
          const config = response.data[0]
          setCurrentConfig(config)
          setClientId(config.client_id || '')
          setRedirectUri(config.redirect_uri || '')
          // Don't set client secret as it's sensitive
        }
      } catch (error) {
        console.error('Failed to load Gmail config:', error)
        setError('Failed to load current configuration')
      } finally {
        setLoading(false)
      }
    }

    if (pathname === '/settings') {
      loadConfig()
    }
  }, [pathname])

  useEffect(() => {
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous states
    setError(null)
    setSuccess(null)

    // Validate all required fields
    if (!clientId.trim()) {
      setError('Client ID is required')
      return
    }

    if (!redirectUri.trim()) {
      setError('Redirect URI is required')
      return
    }

    // For new configuration, client secret is required
    if (!currentConfig && !clientSecret.trim()) {
      setError('Client Secret is required for new configuration')
      return
    }

    try {
      setSaving(true)

      const config = {
        client_id: clientId.trim(),
        redirect_uri: redirectUri.trim()
      }

      // Only include client_secret if it's provided or it's a new configuration
      if (clientSecret.trim()) {
        config.client_secret = clientSecret.trim()
      }

      await emailsApi.saveGmailConfig(config)
      setSuccess('Configuration saved successfully')
      setClientSecret('') // Clear sensitive data
    } catch (error) {
      console.error('Failed to save Gmail config:', error)
      setError(error.response?.data?.message || 'Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

 




  const renderContent = () => {
    switch (pathname) {
      case '/settings':
        return (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Gmail API Configuration</h3>
              <p className="text-sm text-gray-500 mt-1">Configure your Gmail API credentials to enable email integration</p>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-900 rounded-full" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {success}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Secret
                    </label>
                    <input
                      type="password"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={currentConfig ? '••••••••' : ''}
                      required={!currentConfig}
                    />
                    {currentConfig && (
                      <p className="mt-1 text-sm text-gray-500">
                        Leave blank to keep existing secret
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Redirect URI
                    </label>
                    <input
                      type="url"
                      value={redirectUri}
                      onChange={(e) => setRedirectUri(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://your-domain.com/api/gmail/callback"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#205D9E] hover:bg-[#184b82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </>
                    ) : 'Save Gmail Configuration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )
      case '/settings/payment':
        return (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Stripe Configuration</h3>
              <p className="text-sm text-gray-500 mt-1">Configure your Stripe API credentials for payment processing</p>
            </div>
            <StripeConfig />
          </div>
        )
      case '/settings/account':
        return (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Account Settings</h3>
              <p className="text-sm text-gray-500 mt-1">Manage your account preferences and personal information</p>
            </div>
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Account settings are available in the left sidebar.</h3>
              <p className="mt-1 text-sm text-gray-500">Use the sidebar to access account security and password options.</p>
            </div>
          </div>
        )
      case '/settings/notifications':
        return (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Notification Settings</h3>
              <p className="text-sm text-gray-500 mt-1">Manage your notification preferences</p>
            </div>
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Notification settings will be available soon.</h3>
              <p className="mt-1 text-sm text-gray-500">Stay tuned for notification management features.</p>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 w-full lg:w-auto">
        <div className="p-4 sm:p-6 space-y-6">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          <div className="bg-white rounded-xl shadow-sm">
            <div className="bg-[#205D9E] p-4 sm:p-6 rounded-t-xl">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Settings</h2>
              <p className="text-sm text-blue-100 mt-1">Configure your application settings</p>
            </div>

            <div className="flex min-h-[calc(100vh-16rem)]">
              {/* Settings Sidebar - Inside Card */}
              <div className="border-r border-gray-100">
                <SettingsSidebar />
              </div>

              {/* Settings Content */}
              <div className="flex-1 px-8 py-6">
                <div className="max-w-2xl">
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 