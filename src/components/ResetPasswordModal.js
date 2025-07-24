import { useState } from 'react'
import { emailsApi } from '@/api/emailsAPI'
import api from '@/api'

export default function ResetPasswordModal({ isOpen, onClose, onReset, onAdminChange, userData, userType }) {
  const [isResetting, setIsResetting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [useManualPassword, setUseManualPassword] = useState(false)
  const [manualPassword, setManualPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

  const validatePassword = () => {
    if (manualPassword.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères')
      return false
    }
    
    if (manualPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas')
      return false
    }
    
    setPasswordError('')
    return true
  }

  const handleReset = async () => {
    setIsResetting(true)
    setError('')
    
    try {
      let result;
      
      if (useManualPassword) {
        if (!validatePassword()) {
          setIsResetting(false)
          return
        }
        
        try {
          // If onAdminChange is provided, use it for admin password change
          if (onAdminChange && userData.id) {
            // Call the admin change function and store the result
            result = await onAdminChange(manualPassword);
            // Make sure we're using the correct password in the result
            if (!result.password) {
              result.password = manualPassword;
            }
          } else {
            // Use the change-password endpoint for user changing their own password
            const response = await api.post('/change-password', {
              current_password: currentPassword,
              password: manualPassword,
              password_confirmation: confirmPassword
            })
            
            result = {
              success: true,
              message: 'Mot de passe modifié avec succès',
              password: manualPassword
            }
          }
        } catch (err) {
          console.error('Error in password change:', err)
          if (err.response?.data?.errors) {
            // Extract validation errors
            const errorMessages = Object.values(err.response.data.errors).flat().join(', ')
            setError(errorMessages || 'Validation error occurred')
          } else {
            setError(err.response?.data?.message || 'Une erreur est survenue lors de la modification du mot de passe')
          }
          setIsResetting(false)
          return
        }
      } else {
        // For automatic password reset
        result = await onReset()
        // Ensure we have a valid result with password
        if (!result || !result.password) {
          throw new Error('No password returned from reset operation');
        }
      }
      
      // Log the password for debugging
      console.log('Password to be displayed and sent:', result.password);
      
      setNewPassword(result.password)
      setResetSuccess(true)
      
      // Send credentials via email
      if (userData.email) {
        try {
          await emailsApi.sendCredentialsEmail({
            first_name: userData.first_name || userData.firstName,
            last_name: userData.last_name || userData.lastName,
            email: userData.email,
            password: result.password
          }, userType)
          setEmailSent(true)
        } catch (emailError) {
          console.error('Error sending credentials email:', emailError)
          setEmailError(true)
        }
      }
    } catch (err) {
      console.error('Password reset error:', err)
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe')
    } finally {
      setIsResetting(false)
    }
  }

  const handleClose = () => {
    setResetSuccess(false)
    setNewPassword('')
    setError('')
    setEmailSent(false)
    setEmailError(false)
    setUseManualPassword(false)
    setManualPassword('')
    setConfirmPassword('')
    setCurrentPassword('')
    setPasswordError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          {!resetSuccess ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {useManualPassword ? 'Définir un nouveau mot de passe' : 'Réinitialiser le mot de passe'}
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600"
                      checked={useManualPassword}
                      onChange={() => setUseManualPassword(!useManualPassword)}
                    />
                    <span className="ml-2 text-gray-700">Définir manuellement le mot de passe</span>
                  </label>
                </div>
                
                {useManualPassword ? (
                  <div className="space-y-4">
                    <p className="text-gray-600 mb-4">
                      Définissez un nouveau mot de passe pour cet utilisateur.
                    </p>
                    
                    {!onAdminChange && (
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Mot de passe actuel
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Entrez le mot de passe actuel"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={manualPassword}
                        onChange={(e) => setManualPassword(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Entrez le nouveau mot de passe"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmer le mot de passe
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Confirmez le nouveau mot de passe"
                      />
                    </div>
                    
                    {passwordError && (
                      <div className="text-sm text-red-600">
                        {passwordError}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 mb-4">
                    Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ? 
                    Un nouveau mot de passe sera généré automatiquement.
                  </p>
                )}
                
                {userData.email && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-blue-700">
                        Le nouveau mot de passe sera envoyé par email à <strong>{userData.email}</strong>
                      </p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {isResetting ? 'Traitement...' : useManualPassword ? 'Définir le mot de passe' : 'Réinitialiser'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Mot de passe {useManualPassword ? 'modifié' : 'réinitialisé'}</h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                
                <p className="text-center text-gray-600 mb-4">
                  Le mot de passe a été {useManualPassword ? 'modifié' : 'réinitialisé'} avec succès.
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-500 mb-2">Nouveau mot de passe :</p>
                  <div className="bg-white border border-gray-300 rounded px-3 py-2 font-mono text-sm break-all">
                    {newPassword}
                  </div>
                </div>
                
                {emailSent && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-sm text-green-700">
                        Les identifiants ont été envoyés par email à <strong>{userData.email}</strong>
                      </p>
                    </div>
                  </div>
                )}
                
                {emailError && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-yellow-500 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-sm text-yellow-700">
                        Le mot de passe a été {useManualPassword ? 'modifié' : 'réinitialisé'}, mais l'envoi par email a échoué. Veuillez noter le mot de passe ci-dessus.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Fermer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 

export function PublicResetPasswordModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Use env variable for backend URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMessage('Check your email for the reset token.');
        setStep(2);
      } else {
        setError(data.message || 'Error requesting reset');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password, password_confirmation: passwordConfirmation }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMessage('Password reset successful!');
        setStep(3);
      } else {
        setError(data.message || 'Error resetting password');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Reset Password</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700" placeholder="Enter your email" />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {message && <div className="text-green-600 text-sm">{message}</div>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">{loading ? 'Sending...' : 'Request Reset'}</button>
              </div>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
                <input type="text" value={token} onChange={e => setToken(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700" placeholder="Enter the token from your email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700" placeholder="New password" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700" placeholder="Confirm new password" />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {message && <div className="text-green-600 text-sm">{message}</div>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">{loading ? 'Resetting...' : 'Reset Password'}</button>
              </div>
            </form>
          )}
          {step === 3 && (
            <div className="text-center">
              <div className="mb-4 text-green-600">{message}</div>
              <button onClick={onClose} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 