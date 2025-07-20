'use client'

import { useState } from 'react'
import Select from 'react-select'

export default function PrestatairesSelectionStep({ onComplete }) {
  const [selectedPrestataires, setSelectedPrestataires] = useState([])

  // Example prestataires data - replace with your actual data source
  const prestatairesOptions = [
    { value: '1', label: 'John Doe', email: 'john@example.com', specialties: ['Plumbing', 'Electrical'] },
    { value: '2', label: 'Jane Smith', email: 'jane@example.com', specialties: ['Carpentry'] },
    { value: '3', label: 'Mike Johnson', email: 'mike@example.com', specialties: ['Painting', 'Decoration'] },
    { value: '4', label: 'Sarah Wilson', email: 'sarah@example.com', specialties: ['Gardening'] },
  ]

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
      <div {...props.innerProps} className="py-2 px-3 hover:bg-gray-100 cursor-pointer">
        <div className="font-medium">{children}</div>
        <div className="text-sm text-gray-500">{email}</div>
        {specialties && specialties.length > 0 && (
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

  const handleSubmit = () => {
    if (selectedPrestataires.length === 0) {
      alert('Please select at least one prestataire')
      return
    }
    // Here you would handle the selected prestataires
    console.log('Selected prestataires:', selectedPrestataires)
    onComplete(selectedPrestataires)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Select Prestataires</h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose one or more prestataires who will handle this order.
          </p>
          
          <div className="mt-4">
            <Select
              isMulti
              name="prestataires"
              options={prestatairesOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Search and select prestataires..."
              value={selectedPrestataires}
              onChange={handleChange}
              styles={customStyles}
              components={{
                Option: CustomOption
              }}
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedPrestataires.length} prestataire{selectedPrestataires.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-3">
              {selectedPrestataires.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedPrestataires([])}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={selectedPrestataires.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#205D9E] hover:bg-[#184b82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 