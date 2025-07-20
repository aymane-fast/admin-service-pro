'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import ServiceOrdersTable from '@/components/ServiceOrdersTable'
import StatsCards from '@/components/StatsCards'
import { fetchServiceOrders } from '@/api/serviceOrdersApi'
import Link from 'next/link'

export default function ServiceOrders() {
  const [searchQuery, setSearchQuery] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchServiceOrders()
        setOrders(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch orders:', error)
        setError('Failed to load service orders')
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  const stats = orders ? [
    {
      title: 'Total des projets',
      value: Array.isArray(orders) ? orders.length.toString() : '0',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="#205D9E" fill="none" strokeWidth="1.5">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: 'Complet',
      value: Array.isArray(orders) 
        ? orders.filter(order => order?.status === 'Terminé').length.toString()
        : '0',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="#205D9E" fill="none" strokeWidth="1.5">
          <path d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      title: 'Annuler',
      value: Array.isArray(orders)
        ? orders.filter(order => order?.status === 'Desactivé').length.toString()
        : '0',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="#205D9E" fill="none" strokeWidth="1.5">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
  ] : []

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
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
        <div className="p-4 sm:p-6 space-y-6">
          <Header 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            toggleSidebar={toggleSidebar}
          />
          <StatsCards stats={stats} />
          <div className="bg-white rounded-xl shadow-sm">
            <div className="bg-blue-900 p-4 sm:p-6 rounded-t-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Les interventions en cours</h2>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                  <Link
                    href="/clients/create"
                    className="inline-flex items-center justify-center gap-2 bg-white/25 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-white/30 transition-colors text-sm sm:text-base"
                  >
                    <span>Nouveau client</span>
                  </Link>
                  <Link
                    href="/service-orders/create"
                    className="inline-flex items-center justify-center gap-2 bg-white/25 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-white/30 transition-colors text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Créer un ordre de service</span>
                    <span className="sm:hidden">Créer OS</span>
                  </Link>
                </div>
              </div>
            </div>
            <ServiceOrdersTable 
              searchQuery={searchQuery} 
              orders={orders}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
