'use client'

import { useState, useEffect } from 'react'
import { orderInvitationsApi } from '@/api/orderInvitationsAPI'
import { prestatairesApi } from '@/api/prestatairesAPI'
import Select from 'react-select'

export default function PrestatairesInvitationStep({ orderId, onComplete }) {
  const [prestataires, setPrestataires] = useState([])
  const [selectedPrestataires, setSelectedPrestataires] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    loadPrestataires()
    if (orderId) {
      loadInvitations()
    }
  }, [orderId])

  const loadPrestataires = async () => {
    try {
      const response = await prestatairesApi.getPrestataires()
      setPrestataires(response.data)
    } catch (err) {
      setError('Failed to load prestataires')
      console.error(err)
    }
  }

  const loadInvitations = async () => {
    try {
      const response = await orderInvitationsApi.getOrderInvitations(orderId)
      setInvitations(response.data)
    } catch (err) {
      setError('Failed to load invitations')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const prestatairesOptions = prestataires.map(prestataire => ({
    value: prestataire.id.toString(),
    label: `${prestataire.first_name} ${prestataire.last_name}`,
    email: prestataire.email,
    specialties: prestataire.specialties ? prestataire.specialties.split(',') : []
  }))

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: '50px',
      background: 'white',
      borderColor: '#E5E7EB',
      '&:hover': {
        borderColor: '#205D9E',
      },
      boxShadow: 'none',
    }),
    option: (base, state) => ({
      ...base,
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      background: state.isSelected ? '#205D9E' : state.isFocused ? '#EFF6FF' : 'white',
      color: state.isSelected ? 'white' : '#111827',
      '&:active': {
        background: '#205D9E',
      },
    }),
    multiValue: (base) => ({
      ...base,
      background: '#EFF6FF',
      borderRadius: '6px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#205D9E',
      fontWeight: '500',
      padding: '4px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#205D9E',
      ':hover': {
        background: '#DBEAFE',
        color: '#1E40AF',
      },
    }),
  }

  const CustomOption = ({ children, ...props }) => {
    const { email, specialties } = props.data
    return (
      <div {...props.innerProps}>
        <div className="font-medium">{children}</div>
        <div className="text-sm text-gray-500">{email}</div>
        {specialties && (
          <div className="flex flex-wrap gap-1 mt-1">
            {specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
              >
                {specialty}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  const handleChange = (selected) => {
    setSelectedPrestataires(selected || [])
  }

  const handleSubmit = async () => {
    if (selectedPrestataires.length === 0) {
      setError('Please select at least one prestataire')
      return
    }

    setInviting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await orderInvitationsApi.invitePrestataires(orderId, selectedPrestataires.map(s => s.value))
      setSuccess('Invitations sent successfully')
      setSelectedPrestataires([])
      await loadInvitations()

      if (response.warnings) {
        setError(`Some invitations could not be sent: ${response.warnings.message}`)
      }
    } catch (err) {
      setError('Failed to send invitations')
      console.error(err)
    } finally {
      setInviting(false)
    }
  }

  const handleSelectPrestataire = async (prestataireId) => {
    setSelecting(true)
    setError(null)
    setSuccess(null)

    try {
      await orderInvitationsApi.selectPrestataire(orderId, prestataireId)
      setSuccess('Prestataire selected successfully')
      onComplete()
    } catch (err) {
      setError('Failed to select prestataire')
      console.error(err)
    } finally {
      setSelecting(false)
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
    <div className="space-y-6 p-6">
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

      {/* Prestataires Selection Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Select Prestataires</h3>
          <p className="mt-2 text-sm text-gray-600">
            Choose one or more prestataires from the list below.
          </p>
        </div>
        <div className="p-6">
          <Select
            isMulti
            name="prestataires"
            options={prestatairesOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select prestataires..."
            value={selectedPrestataires}
            onChange={handleChange}
            styles={customStyles}
            components={{
              Option: CustomOption
            }}
          />
          
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedPrestataires.length} prestataire{selectedPrestataires.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-3">
              {selectedPrestataires.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedPrestataires([])}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={selectedPrestataires.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#205D9E] hover:bg-[#184b82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invitations Status Section */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium">Invitations Status</h3>
            <p className="mt-1 text-sm text-gray-500">
              Track the status of sent invitations and select a prestataire
            </p>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prestataire
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Date
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.map(invitation => (
                    <tr key={invitation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {`${invitation.prestataire.first_name} ${invitation.prestataire.last_name}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invitation.prestataire.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          invitation.status === 'refused' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invitation.responded_at ? new Date(invitation.responded_at).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {invitation.status === 'accepted' && (
                          <button
                            onClick={() => handleSelectPrestataire(invitation.prestataire.id)}
                            disabled={selecting}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-[#205D9E] hover:bg-[#184b82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {selecting ? 'Selecting...' : 'Select Prestataire'}
                          </button>
                        )}
                        {invitation.status === 'refused' && invitation.refusal_reason && (
                          <span className="text-sm text-gray-500" title={invitation.refusal_reason}>
                            Reason: {invitation.refusal_reason}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 