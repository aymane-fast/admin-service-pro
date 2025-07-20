'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import StatsCards from '@/components/StatsCards'
import InterventionsTable from '@/components/InterventionsTable'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, Area } from 'recharts'
import api from '@/api'

const stats = [
  {
    title: 'chiffre d affaire',
    value: '2935 euro',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="#205D9E" fill="none" strokeWidth="1.5">
        <path d="M4 4h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
        <path d="M4 14h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z" />
      </svg>
    )
  },
  {
    title: 'nombre de OS',
    value: '2935',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="#205D9E" fill="none" strokeWidth="1.5">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: 'Plage de dates',
    value: '03/12/2024',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" stroke="#205D9E" fill="none" strokeWidth="1.5">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  }
]

const interventions = [
  {
    id: '00001',
    client: 'Talha Ahmed',
    description: 'Une mauvaise connexion peut provoquer des lumié',
    prestataire: 'Serkouh',
    entreprise: 'DevSinc',
    prix: '2,458',
    date: '24.jan.2021'
  },
  {
    id: '00002',
    client: 'Alan Jones',
    description: 'Une mauvaise connexion peut provoquer des lumié',
    prestataire: 'Serkouh',
    entreprise: 'DevSinc',
    prix: '1,485',
    date: '12.juin.2021'
  },
  {
    id: '00003',
    client: 'Alan Jones',
    description: 'Une mauvaise connexion peut provoquer des lumié',
    prestataire: 'Serkouh',
    entreprise: 'DigitalLogix',
    prix: '1,024',
    date: '5.jan.2021'
  },
  {
    id: '00004',
    client: 'Talha Ahmed',
    description: 'Une mauvaise connexion peut provoquer des lumié',
    prestataire: 'Serkouh',
    entreprise: 'DigitalLogix',
    prix: '858',
    date: '7.mars.2021'
  },
  {
    id: '00005',
    client: 'Alan Jones',
    description: 'Une mauvaise connexion peut provoquer des lumié',
    prestataire: 'Serkouh',
    entreprise: 'DigitalLogix',
    prix: '258',
    date: '17.déc.2021'
  }
]

const processThirtyDayTrend = (thirtyDayTrend) => {
  if (!thirtyDayTrend?.daily_data) return [];
  
  // Get all orders to calculate historical data
  const allOrders = thirtyDayTrend.orders_list || [];
  const dailyData = new Map();

  // Process all orders to get historical data
  allOrders.forEach(order => {
    const date = order.creation_date.split('T')[0];
    if (!dailyData.has(date)) {
      dailyData.set(date, {
        date,
        revenue: parseFloat(order.price || 0),
        orders: 1,
        completed: order.status === 'completed' ? 1 : 0,
        in_progress: order.status === 'in_progress' ? 1 : 0,
        total_value: parseFloat(order.price || 0)
      });
    } else {
      const current = dailyData.get(date);
      dailyData.set(date, {
        ...current,
        revenue: current.revenue + parseFloat(order.price || 0),
        orders: current.orders + 1,
        completed: current.completed + (order.status === 'completed' ? 1 : 0),
        in_progress: current.in_progress + (order.status === 'in_progress' ? 1 : 0),
        total_value: current.total_value + parseFloat(order.price || 0)
      });
    }
  });

  // Convert the daily_data object to array and merge with historical data
  return Object.values(thirtyDayTrend.daily_data)
    .map(day => {
      const historicalData = dailyData.get(day.date) || {
        revenue: 0,
        orders: 0,
        completed: 0,
        in_progress: 0,
        total_value: 0
      };

      return {
        date: day.date,
        revenue: parseFloat(day.revenue.total) || historicalData.revenue,
        orders: day.orders.count || historicalData.orders,
        completed: day.orders.completed || historicalData.completed,
        in_progress: day.orders.in_progress || historicalData.in_progress,
        total_value: parseFloat(day.orders.total_value) || historicalData.total_value
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await api.get('/stats')
        if (response.data.status === 'success') {
          setStats(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        setError('Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Transform data for charts
  const paymentMethodData = stats?.payments.by_payment_method.map(method => ({
    name: method.payment_method === 'credit_card' ? 'Carte bancaire' :
          method.payment_method === 'cash' ? 'Espèces' : 'Virement',
    value: parseFloat(method.total_amount)
  })) || []

  const entityTypeData = stats?.payments.by_entity_type.map(entity => ({
    name: entity.entity_type === 'client' ? 'Clients' :
          entity.entity_type === 'prestataire' ? 'Prestataires' : 'Partenaires',
    value: parseFloat(entity.total_amount)
  })) || []

  const orderStatusData = [
    { name: 'En cours', value: stats?.orders.in_progress_count || 0 },
    { name: 'Terminé', value: stats?.orders.completed_count || 0 },
    { name: 'Annulé', value: stats?.orders.cancelled_count || 0 }
  ]

  const revenueTrendData = processThirtyDayTrend(stats?.thirty_day_trend);

  const COLORS = [
    '#205D9E', // Primary blue
    '#34C759', // Success green
    '#FF9500', // Warning orange
    '#FF3B30'  // Danger red
  ];

  const PAYMENT_METHOD_COLORS = {
    credit_card: '#205D9E',  // Blue for credit card
    cash: '#34C759',         // Green for cash
    transfer: '#FF9500'      // Orange for transfer
  };

  const ENTITY_TYPE_COLORS = {
    client: '#205D9E',       // Blue for clients
    prestataire: '#34C759',  // Green for prestataires
    partner: '#FF9500'       // Orange for partners
  };

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
      <div className={`fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 lg:h-screen transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full lg:w-auto overflow-x-hidden">
        <div className="p-4 lg:p-8 bg-white border-b border-gray-200">
          <Header 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          
          {loading ? (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 mt-8">
              {error}
            </div>
          ) : (
            <>
              {/* Quick Actions Section */}
              <div className="bg-[#205D9E] rounded-xl p-4 lg:p-6 mb-6 lg:mb-8">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                  <h1 className="text-xl lg:text-2xl font-bold text-white">Tableau de bord</h1>
                  <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                    <Link
                      href="/clients/create"
                      className="inline-flex items-center justify-center px-4 py-2 bg-white text-[#205D9E] rounded-lg hover:bg-opacity-90 transition-colors text-sm lg:text-base"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span className="hidden sm:inline">Nouveau client</span>
                      <span className="sm:hidden">Client</span>
                    </Link>
                    <Link
                      href="/service-orders/create"
                      className="inline-flex items-center justify-center px-4 py-2 bg-white text-[#205D9E] rounded-lg hover:bg-opacity-90 transition-colors text-sm lg:text-base"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="hidden sm:inline">Nouvelle commande</span>
                      <span className="sm:hidden">Commande</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                {/* Orders Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 text-sm">Commandes</h3>
                    <span className="p-2 bg-blue-50 rounded-lg">
                      <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.orders.total_count || 0}</p>
                  <p className="text-gray-500 text-sm mt-2">Valeur totale: {parseFloat(stats?.orders.total_value || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
                </div>

                {/* Clients Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 text-sm">Clients</h3>
                    <span className="p-2 bg-green-50 rounded-lg">
                      <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.entity_counts.clients || 0}</p>
                  <p className="text-gray-500 text-sm mt-2">Total clients actifs</p>
                </div>

                {/* Prestataires Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 text-sm">Prestataires</h3>
                    <span className="p-2 bg-purple-50 rounded-lg">
                      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.entity_counts.prestataires || 0}</p>
                  <p className="text-gray-500 text-sm mt-2">Total prestataires actifs</p>
                </div>

                {/* Partners Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 text-sm">Partenaires</h3>
                    <span className="p-2 bg-yellow-50 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.entity_counts.partners || 0}</p>
                  <p className="text-gray-500 text-sm mt-2">Total partenaires actifs</p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
                {/* Payment Methods Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Méthodes de paiement</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentMethodData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {paymentMethodData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={PAYMENT_METHOD_COLORS[entry.name] || COLORS[index % COLORS.length]}
                              stroke="none"
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                          }}
                        />
                        <Legend 
                          verticalAlign="middle" 
                          align="right"
                          layout="vertical"
                          iconType="circle"
                          formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Entity Type Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution des paiements</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={entityTypeData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `${value}€`}
                        />
                        <Tooltip
                          formatter={(value) => value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)'
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[8, 8, 0, 0]}
                        >
                          {entityTypeData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`}
                              fill={`url(#colorGradient${index})`}
                            />
                          ))}
                        </Bar>
                        <defs>
                          {entityTypeData.map((entry, index) => (
                            <linearGradient 
                              key={`gradient${index}`}
                              id={`colorGradient${index}`} 
                              x1="0" 
                              y1="0" 
                              x2="0" 
                              y2="1"
                            >
                              <stop 
                                offset="0%" 
                                stopColor={ENTITY_TYPE_COLORS[entry.name.toLowerCase()] || COLORS[index % COLORS.length]} 
                                stopOpacity={0.8}
                              />
                              <stop 
                                offset="100%" 
                                stopColor={ENTITY_TYPE_COLORS[entry.name.toLowerCase()] || COLORS[index % COLORS.length]} 
                                stopOpacity={0.3}
                              />
                            </linearGradient>
                          ))}
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Order Status */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut des commandes</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {orderStatusData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                              stroke="none"
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                        />
                        <Legend 
                          verticalAlign="middle" 
                          align="right"
                          layout="vertical"
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Revenue Trend */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendance des revenus et commandes (30 derniers jours)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={revenueTrendData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { 
                            day: 'numeric',
                            month: 'short'
                          })}
                          interval={4}
                        />
                        <YAxis 
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `${value}€`}
                        />
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `${value} OS`}
                        />
                        <Tooltip 
                          formatter={(value, name) => {
                            switch(name) {
                              case "Revenus":
                                return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
                              case "Commandes":
                                return `${value} commandes`;
                              case "Terminées":
                                return `${value} terminées`;
                              case "En cours":
                                return `${value} en cours`;
                              default:
                                return value;
                            }
                          }}
                          labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                        />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="revenue" 
                          name="Revenus" 
                          stroke="#205D9E" 
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#205D9E" }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="orders" 
                          name="Commandes" 
                          stroke="#82ca9d" 
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#82ca9d" }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="completed" 
                          name="Terminées" 
                          stroke="#4CAF50" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 3, fill: "#4CAF50" }}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="in_progress" 
                          name="En cours" 
                          stroke="#FFC107" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 3, fill: "#FFC107" }}
                        />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          fill="url(#colorRevenue)"
                          fillOpacity={0.1}
                        />
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#205D9E" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#205D9E" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 lg:p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Ordres récents</h3>
                </div>
                <div className="overflow-x-auto">
                  <InterventionsTable searchQuery={searchQuery} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
