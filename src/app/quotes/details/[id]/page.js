'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { quotesApi } from '@/api/quotesAPI'
import { productsApi } from '@/api/productsAPI'
import { fetchClients } from '@/api/clientsApi'
import { fetchOrders } from '@/api/orderDetailsApi'
import QuoteTemplate from '@/components/QuoteTemplate'
import Link from 'next/link'

export default function CreateQuote() {
  const router = useRouter()

  // States for data
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [quote, setQuote] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [clientsData, productsData, ordersData] = await Promise.all([
          fetchClients(),
          productsApi.getAll(),
          fetchOrders(),
        ])
        setClients(clientsData)
        setProducts(productsData)
        setOrders(ordersData)
        setLoading(false)
      } catch (err) {
        setError('Failed to load data.')
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Example save handler
  const handleSave = async () => {
    try {
      await quotesApi.create(quote)
      router.push('/quotes')
    } catch (err) {
      setError('Failed to save quote.')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      <Sidebar />

      <div className="flex-1 w-full lg:w-auto">
        <div className="p-4 sm:p-6">
          <Header />

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Créer un devis</h1>

          {error && <div className="mb-6 text-red-600">{error}</div>}

          {/* Quote form and components here, e.g. */}
          <QuoteTemplate
            clients={clients}
            products={products}
            orders={orders}
            quote={quote}
            setQuote={setQuote}
          />

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-blue-900 text-white hover:bg-blue-800 transition-colors"
            >
              Enregistrer
            </button>
          </div>

          <Link href="/quotes" className="mt-4 inline-block text-blue-600 hover:underline">
            Retour aux devis
          </Link>
        </div>
      </div>
    </div>
  )
}
