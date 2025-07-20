'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function ServiceDetailsStep({ onNext, onBack, initialData }) {
  const [formData, setFormData] = useState({
    date: initialData?.date || '',
    time: initialData?.time || '',
    description: initialData?.description || '',
    images: initialData?.images || []
  })
  const [error, setError] = useState('')
  const [previewUrls, setPreviewUrls] = useState(() => {
    // Initialize preview URLs from initial data if available
    if (initialData?.images?.length) {
      return initialData.images.map(image => ({
        url: typeof image === 'string' ? image : image.url,
        file: image.file || null,
        isInitial: true
      }))
    }
    return []
  })

  // Cleanup function for blob URLs
  useEffect(() => {
    return () => {
      previewUrls.forEach(preview => {
        if (preview?.url?.startsWith('blob:') && !preview.isInitial) {
          URL.revokeObjectURL(preview.url)
        }
      })
    }
  }, [])

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files)
    const currentImages = previewUrls.filter(img => img?.url)
    
    if (currentImages.length + files.length > 5) {
      setError('Vous ne pouvez télécharger que 5 images maximum')
      return
    }

    try {
      setError('')
      const newImages = files.map(file => ({
        url: URL.createObjectURL(file),
        file: file,
        isInitial: false
      }))
      
      setPreviewUrls(prev => [...prev, ...newImages])
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }))

    } catch (error) {
      console.error('Error handling images:', error)
      setError(`Erreur lors du traitement des images: ${error.message}`)
    }
  }

  const removeImage = (index) => {
    try {
      const imageToRemove = previewUrls[index]
      
      // Only revoke blob URL if it's not an initial image
      if (imageToRemove?.url?.startsWith('blob:') && !imageToRemove.isInitial) {
        URL.revokeObjectURL(imageToRemove.url)
      }

      // Update state
      setPreviewUrls(prev => prev.filter((_, i) => i !== index))
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }))
    } catch (error) {
      console.error('Error removing image:', error)
      setError(`Erreur lors de la suppression de l'image: ${error.message}`)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!formData.date || !formData.time || !formData.description.trim()) {
      setError('Veuillez remplir tous les champs')
      return
    }

    // Clean up the images data before submitting
    const cleanedImages = formData.images.map(image => {
      if (typeof image === 'string') return image
      return {
        url: image.url,
        file: image.file
      }
    })

    onNext({
      ...formData,
      images: cleanedImages
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const today = new Date()
  const minDate = today.toISOString().split('T')[0]

  const ImagePreviews = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {previewUrls.map((preview, index) => {
        if (!preview?.url) return null
        
        return (
          <div key={index} className="relative group aspect-square">
            <Image
              src={preview.url}
              alt={`Preview ${index + 1}`}
              fill
              className="object-cover rounded-lg"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {error && (
          <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Détails de l'intervention</h3>
            <p className="mt-1 text-sm text-gray-500">
              Veuillez remplir les informations concernant l'intervention souhaitée.
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date d'intervention<span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative rounded-md shadow-sm flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={minDate}
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setFormData(prev => ({
                        ...prev,
                        date: today
                      }));
                    }}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Aujourd'hui
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  Heure d'intervention<span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description<span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm text-black"
                  placeholder="Décrivez le service requis..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Images
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Télécharger des images</span>
                        <input
                          id="images"
                          name="images"
                          type="file"
                          multiple
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 5 images</p>
                  </div>
                </div>

                {previewUrls.map((preview, index) => (
                  preview?.url ? (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200 transform hover:scale-110"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg hover:from-blue-700 hover:to-blue-600 shadow-sm transition-all duration-150"
            >
              Continuer
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
