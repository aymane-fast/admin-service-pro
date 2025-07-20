'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { emailsApi } from '@/api/emailsAPI'

export default function EmailDetail() {
  const params = useParams()
  const router = useRouter()
  const [email, setEmail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const loadEmail = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await emailsApi.getEmail(params.id)
        setEmail(data)
        
        // Mark as read if not already read
        if (!data.read) {
          await emailsApi.markAsRead(params.id)
        }
      } catch (error) {
        console.error('Failed to fetch email:', error)
        setError(
          error.response?.data?.message || 
          error.message || 
          'Failed to load email'
        )
      } finally {
        setLoading(false)
      }
    }

    loadEmail()
  }, [params.id])

  const handleArchive = async () => {
    try {
      await emailsApi.archiveEmail(params.id)
      router.push('/inbox')
    } catch (error) {
      console.error('Failed to archive email:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <div className="flex-1 w-full lg:w-auto">
          <div className="p-4 sm:p-6">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-900 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

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
        <div className="p-4 sm:p-6">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          ) : email && (
            <div className="bg-white rounded-xl shadow-sm">
              {/* Email Header */}
              <div className="border-b border-gray-200">
                <div className="px-6 py-4">
                  <h1 className="text-xl font-semibold text-gray-900 mb-4">
                    {email.subject}
                  </h1>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      {/* From */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-lg">
                          {email.sender.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{email.sender}</div>
                          <div className="text-sm text-gray-500">{email.email}</div>
                        </div>
                      </div>
                      
                      {/* To */}
                      <div className="text-sm text-gray-600 ml-13">
                        <span className="font-medium">To:</span> {email.to}
                      </div>
                      
                      {/* CC (if present) */}
                      {email.cc && (
                        <div className="text-sm text-gray-600 ml-13">
                          <span className="font-medium">Cc:</span> {email.cc}
                        </div>
                      )}
                      
                      {/* Date */}
                      <div className="text-sm text-gray-500 mt-2">
                        {new Date(email.date).toLocaleString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push('/inbox')}
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Back to Inbox"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                      </button>
                      <button
                        onClick={handleArchive}
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Archive"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="px-6 py-4">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: email.body }}
                />
              </div>

              {/* Attachments */}
              {email.attachments?.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <h2 className="text-sm font-medium text-gray-900 mb-3">
                    Attachments ({email.attachments.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {email.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        download={attachment.filename}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(attachment.size / 1024).toFixed(1)} KB • {attachment.mimeType}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 