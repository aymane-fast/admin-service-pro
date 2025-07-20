'use client'
import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { useRouter } from 'next/navigation'
import { emailsApi } from '@/api/emailsAPI'
import ComposeEmailModal from '@/components/ComposeEmailModal'
import Link from 'next/link'

function EmailTable({ emails = [], searchQuery = '', loading = false, onArchive, onMarkAsRead }) {
  const router = useRouter()

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.sender.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-900 rounded-full" role="status" aria-label="loading">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }

  if (!filteredEmails.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium">No emails found</p>
        <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden bg-white rounded-xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmails.map((email) => (
              <tr 
                key={email.id} 
                className={`hover:bg-gray-50 transition-colors cursor-pointer ${!email.read ? 'font-medium' : ''}`}
                onClick={() => router.push(`/inbox/${email.id}`)}
              >
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    email.read 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {email.read ? 'Read' : 'New'}
                  </span>
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                      {email.sender.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm text-gray-900">{email.sender}</div>
                      <div className="text-xs text-gray-500">{email.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{email.subject}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{email.preview}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(email.date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      onArchive(email.id)
                    }}
                    className="text-gray-400 hover:text-gray-500 mx-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </button>
                  {!email.read && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        onMarkAsRead(email.id)
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                      </svg>
                    </button>
                  )}
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const Pagination = ({ currentPage, setCurrentPage, totalEmails, emailsPerPage }) => {
  const totalPages = Math.ceil(totalEmails / emailsPerPage)
  
  if (totalPages <= 1) return null
  
  // Function to get page numbers to display
  const getPageNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || 
          (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }
    
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    }
    
    return rangeWithDots
  }

  return (
    <div className="mt-4 flex items-center justify-between px-4 py-3 bg-white border border-gray-200 sm:px-6 rounded-xl">
      {/* Mobile version remains the same */}
      <div className="flex justify-between sm:hidden w-full">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Précédent
        </button>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
      {/* Desktop version with updated pagination */}
      <div className="hidden sm:flex sm:items-center sm:justify-between w-full">
        <div>
          <p className="text-sm text-gray-700">
            Affichage de{' '}
            <span className="font-medium">{((currentPage - 1) * emailsPerPage) + 1}</span>
            {' '}à{' '}
            <span className="font-medium">
              {Math.min(currentPage * emailsPerPage, totalEmails)}
            </span>
            {' '}sur{' '}
            <span className="font-medium">{totalEmails}</span>
            {' '}emails
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="sr-only">Précédent</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            {getPageNumbers().map((pageNumber, i) => (
              pageNumber === '...' ? (
                <span
                  key={`dots-${i}`}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              ) : (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === pageNumber
                      ? 'z-10 bg-[#205D9E] border-[#205D9E] text-white'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              )
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="sr-only">Suivant</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default function Inbox() {
  const [searchQuery, setSearchQuery] = useState('')
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [needsGmailSetup, setNeedsGmailSetup] = useState(false)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [lastEmailId, setLastEmailId] = useState(null)
  const [hasNewEmails, setHasNewEmails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalEmails, setTotalEmails] = useState(0)
  const emailsPerPage = 10

  const loadEmails = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true)
      setError(null)

      // Check Gmail configuration first
      const configResponse = await emailsApi.getGmailConfig()
      console.log('Gmail config response:', configResponse)
      
      if (!configResponse.data?.length || !configResponse.data[0].is_active) {
        setNeedsGmailSetup(true)
        setError('Gmail integration needs to be configured')
        setLoading(false)
        return
      }

      // Fetch emails with pagination
      const response = await emailsApi.fetchEmails({
        limit: emailsPerPage,
        page: currentPage,
        query: searchQuery
      })
      
      // Check if we have new emails
      if (isPolling && response.data.length > 0) {
        const newestEmailId = response.data[0].id
        if (lastEmailId && newestEmailId !== lastEmailId) {
          // Play notification sound
          const audio = new Audio('/notification.mp3') // Add a notification sound file to your public folder
          audio.play().catch(console.error) // Catch error in case autoplay is blocked
          setHasNewEmails(true)
        }
        setLastEmailId(newestEmailId)
      }

      setEmails(Array.isArray(response.data) ? response.data : [])
      setTotalEmails(response.total || 0)

    } catch (error) {
      console.error('Failed to fetch emails:', error)
      // Check for any Gmail API errors
      if (error.response?.data?.error === 'invalid_client' || 
          error.response?.data?.error_description?.includes('OAuth') ||
          error.message?.includes('Gmail') ||
          error.response?.status === 401) {
        setNeedsGmailSetup(true)
        setError('La configuration Gmail est invalide. Veuillez vérifier vos identifiants dans les paramètres.')
        return
      }
      setError(
        error.response?.data?.message || 
        error.message || 
        'Impossible de charger les emails'
      )
      setEmails([])
    } finally {
      if (!isPolling) setLoading(false)
    }
  }, [searchQuery, lastEmailId, currentPage, emailsPerPage])

  useEffect(() => {
    loadEmails()
    
    // Remove the polling interval
    // No auto-reload functionality
    
    // Cleanup function can be empty since we're not setting up any interval
    return () => {}
  }, [loadEmails]) // Keep loadEmails in dependency array

  // Add handlers for email actions
  const handleArchive = async (emailId) => {
    try {
      await emailsApi.archiveEmail(emailId)
      // Remove the email from the list
      setEmails(emails.filter(email => email.id !== emailId))
    } catch (error) {
      console.error('Failed to archive email:', error)
      // Show error toast or message
    }
  }

  const handleMarkAsRead = async (emailId) => {
    try {
      await emailsApi.markAsRead(emailId)
      // Update the email in the list
      setEmails(emails.map(email => 
        email.id === emailId 
          ? { ...email, read: true }
          : email
      ))
    } catch (error) {
      console.error('Failed to mark email as read:', error)
      // Show error toast or message
    }
  }

  // Add a loading indicator at the component level
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <div className="flex-1 w-full lg:w-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-900 rounded-full">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (needsGmailSetup || 
      error?.includes('Gmail') || 
      error?.includes('configuration') || 
      error?.includes('OAuth')) {
    return (
      <div className="flex min-h-screen bg-[#F8F9FF]">
        <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:z-0 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        </div>
        
        <div className="flex-1 w-full lg:w-auto">
          <div className="p-4 sm:p-6 space-y-6">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm">
              <svg 
                className="w-16 h-16 text-gray-400 mb-4" 
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
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Configuration Gmail requise
              </h3>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                Les identifiants Gmail configurés sont invalides ou manquants. 
                Veuillez vérifier et mettre à jour vos identifiants API Gmail dans les paramètres.
              </p>
              <Link
                href="/settings"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#205D9E] hover:bg-[#184b82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg 
                  className="w-5 h-5 mr-2" 
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
                </svg>
                Configurer Gmail
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
          
          <div className="bg-[#205D9E] rounded-xl shadow-sm">
            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="w-full sm:w-96">
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-white/25 text-white placeholder-white/75 border-0 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-white/50 focus:outline-none"
                      placeholder="Search emails..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      <svg className="w-5 h-5 text-white/75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="inline-flex items-center justify-center gap-2 bg-white/25 text-white px-4 py-2.5 rounded-lg hover:bg-white/30 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span>Archive</span>
                  </button>
                  <button 
                    className="inline-flex items-center justify-center gap-2 bg-white text-[#205D9E] px-4 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
                    onClick={() => setIsComposeOpen(true)}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Compose</span>
                  </button>
                  {hasNewEmails && (
                    <button
                      onClick={() => {
                        loadEmails()
                        setHasNewEmails(false)
                      }}
                      className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Nouveaux emails disponibles
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <EmailTable 
                emails={emails} 
                searchQuery={searchQuery}
                loading={loading}
                onArchive={handleArchive}
                onMarkAsRead={handleMarkAsRead}
              />
              <Pagination 
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalEmails={totalEmails}
                emailsPerPage={emailsPerPage}
              />
            </div>
          )}
        </div>
      </div>

      <ComposeEmailModal 
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </div>
  )
} 