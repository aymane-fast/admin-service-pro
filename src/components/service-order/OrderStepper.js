import { CheckIcon } from '@heroicons/react/24/solid'

export default function OrderStepper({ currentStep }) {
  const steps = [
    { id: 1, name: 'Client', description: 'Sélection du client' },
    { id: 2, name: 'Détails', description: 'Informations du service' },
    { id: 3, name: 'Partenaire', description: 'Choix du partenaire' },
    { id: 4, name: 'Prestataires', description: 'Sélection des prestataires' },
    { id: 5, name: 'Confirmation', description: 'Vérification et envoi' }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute top-6 left-0 w-full h-1 bg-gray-100 rounded-full" />
        
        {/* Active progress bar */}
        <div 
          className="absolute top-6 left-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500 shadow-sm"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className="flex items-center justify-center mb-3">
                {step.id < currentStep ? (
                  // Completed step
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center transition-all duration-500 shadow-lg shadow-blue-100">
                    <CheckIcon className="h-6 w-6 text-white" />
                  </div>
                ) : step.id === currentStep ? (
                  // Current step
                  <div className="w-12 h-12 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center transition-all duration-500 shadow-md">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-400" />
                  </div>
                ) : (
                  // Future step
                  <div className="w-12 h-12 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center transition-all duration-500">
                    <span className="text-sm font-medium text-gray-400">{step.id}</span>
                  </div>
                )}
              </div>
              
              {/* Step label */}
              <div className="flex flex-col items-center">
                <span className={`text-sm font-semibold mb-1 ${
                  step.id <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
                <span className={`text-xs ${
                  step.id <= currentStep ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 