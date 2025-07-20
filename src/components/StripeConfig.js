import { useState, useEffect } from 'react'
import { stripeApi } from '@/api/stripeAPI'
import { useRouter } from 'next/navigation'

export default function StripeConfig() {
  const router = useRouter()
  const [publishableKey, setPublishableKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [currentConfig, setCurrentConfig] = useState(null)
  const [testResult, setTestResult] = useState(null)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check for token
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Authentication required. Please log in again.')
          router.push('/login')
          return
        }

        const response = await stripeApi.getStripeConfig()
        if (response.data?.length > 0) {
          const config = response.data[0]
          setCurrentConfig(config)
          setPublishableKey(config.publishable_key || '')
          setWebhookSecret(config.webhook_secret || '')
          // Don't set secret key as it's sensitive
        }
      } catch (error) {
        console.error('Failed to load Stripe config:', error)
        if (error.response?.status === 401) {
          setError('Authentication expired. Please log in again.')
          router.push('/login')
          return
        }
        setError('Failed to load current configuration')
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous states
    setError(null)
    setSuccess(null)

    // Check for token
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Authentication required. Please log in again.')
      router.push('/login')
      return
    }

    // Validate required fields
    if (!publishableKey.trim()) {
      setError('Publishable Key is required')
      return
    }

    // For new configuration, secret key is required
    if (!currentConfig && !secretKey.trim()) {
      setError('Secret Key is required for new configuration')
      return
    }

    try {
      setSaving(true)

      // Create config object with required fields
      const config = {
        publishable_key: publishableKey.trim(),
        secret_key: secretKey.trim() // Always send the secret key if provided
      }

      // Only add webhook_secret if it has a value
      if (webhookSecret.trim()) {
        config.webhook_secret = webhookSecret.trim()
      }

      const result = await stripeApi.saveStripeConfig(config)
      
      if (result.success) {
        setSuccess('Configuration saved successfully')
        setSecretKey('') // Clear sensitive data
        
        // Update current config to reflect that we now have a saved configuration
        if (!currentConfig) {
          setCurrentConfig({ 
            publishable_key: publishableKey,
            is_active: true
          })
        }
      } else {
        setError('Failed to save configuration: ' + (result.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to save Stripe config:', error)
      if (error.response?.status === 401) {
        setError('Authentication expired. Please log in again.')
        router.push('/login')
        return
      }
      // Display validation errors from the API if available
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Failed to save configuration. Please check your input and try again.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    try {
      // Check for token
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication required. Please log in again.')
        router.push('/login')
        return
      }

      setTesting(true)
      setError(null)
      setTestResult(null)

      const response = await stripeApi.testStripeConnection()
      setTestResult(response)
      setSuccess('Stripe connection test successful')
    } catch (error) {
      console.error('Failed to test Stripe connection:', error)
      if (error.response?.status === 401) {
        setError('Authentication expired. Please log in again.')
        router.push('/login')
        return
      }
      setError(error.response?.data?.message || 'Failed to test Stripe connection')
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-900 rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      {testResult && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <div className="font-medium">Connection Test Results:</div>
          <div className="mt-1 text-sm">
            Balance: {testResult.data.balance.map(b => 
              `${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`
            ).join(', ')}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Publishable Key
            </label>
            <input
              type="text"
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="pk_test_..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secret Key
            </label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={currentConfig ? '••••••••' : 'sk_test_...'}
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
              Webhook Secret (Optional)
            </label>
            <input
              type="password"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="whsec_..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={testConnection}
            disabled={testing || saving}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {testing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Testing...
              </>
            ) : 'Test Connection'}
          </button>
          <button
            type="submit"
            disabled={saving || testing}
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
            ) : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  )
} 