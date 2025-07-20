'use client'
import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import AgentTable from '@/components/AgentTable'

const agents = [
  {
    id: '00001',
    nom: 'Zahid Khan',
    prenom: 'Vénus',
    email: 'zahid@gmail.com',
    codeOS: '2220',
    telephone: '22200999990',
    nbAppelRecu: '5',
    dateAppelRecu: '2220',
  },
  {
    id: '00002',
    nom: 'Amina Rahman',
    prenom: 'Luna',
    email: 'amina@gmail.com',
    codeOS: '2230',
    telephone: '22300988880',
    nbAppelRecu: '3',
    dateAppelRecu: '2230',
  },
  {
    id: '00003',
    nom: 'Omar Diallo',
    prenom: 'Sirius',
    email: 'omar@gmail.com',
    codeOS: '2240',
    telephone: '22400777770',
    nbAppelRecu: '7',
    dateAppelRecu: '2240',
  },
  {
    id: '00004',
    nom: 'Fatima Boudiaf',
    prenom: 'Nova',
    email: 'fatima@gmail.com',
    codeOS: '2250',
    telephone: '22500666660',
    nbAppelRecu: '4',
    dateAppelRecu: '2250',
  },
  {
    id: '00005',
    nom: 'Youssef Hamza',
    prenom: 'Orion',
    email: 'youssef@gmail.com',
    codeOS: '2260',
    telephone: '22600555550',
    nbAppelRecu: '6',
    dateAppelRecu: '2260',
  },
];


export default function AgentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          <div className="bg-white rounded-xl shadow-sm">
            <div className="bg-blue-900 p-4 sm:p-6 rounded-t-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 sm:w-6 h-5 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Liste des Agent
                  </h2>
                </div>
                <Link
                  href="/agents/create"
                  className="inline-flex items-center justify-center gap-2 bg-green-500/25 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-500/30 transition-colors text-sm sm:text-base"
                >
                  <svg className="w-4 sm:w-5 h-4 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="whitespace-nowrap">Créer un agent</span>
                </Link>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <AgentTable agents={agents} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
