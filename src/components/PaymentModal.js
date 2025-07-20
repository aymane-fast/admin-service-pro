'use client';
import { useState } from 'react';
import { stripeApi } from '@/api/stripeAPI';

export default function PaymentModal({ isOpen, onClose, prestataires = [], partners = [], onPaymentCreated }) {
  const [selectedType, setSelectedType] = useState('prestataire');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('eur');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await stripeApi.createPayment({
        amount: parseFloat(amount),
        currency,
        recipient_type: selectedType,
        recipient_id: selectedRecipient.id,
        description,
        metadata: {
          description
        }
      });

      if (response.success) {
        setSuccess('Paiement créé avec succès');
        setTimeout(() => {
          onClose();
          if (onPaymentCreated) {
            onPaymentCreated();
          }
          // Reset form
          setAmount('');
          setSelectedRecipient('');
          setDescription('');
          setSuccess('');
        }, 2000);
      } else {
        setError('Échec de la création du paiement');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      setError('Une erreur est survenue lors de la création du paiement');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const recipients = selectedType === 'prestataire' ? prestataires : partners;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Nouveau paiement
              </h3>
            </div>

            {error && (
              <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type de destinataire
                </label>
                <select
                  id="type"
                  name="type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setSelectedRecipient('');
                  }}
                >
                  <option value="prestataire">Prestataire</option>
                  <option value="partner">Partenaire</option>
                </select>
              </div>

              <div>
                <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">
                  Destinataire
                </label>
                <select
                  id="recipient"
                  name="recipient"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedRecipient ? selectedRecipient.id : ''}
                  onChange={(e) => {
                    const recipient = recipients.find(r => r.id === parseInt(e.target.value));
                    setSelectedRecipient(recipient || '');
                  }}
                >
                  <option value="">Sélectionnez un destinataire</option>
                  {recipients.map((recipient) => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.name} ({recipient.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Montant
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="amount"
                    id="amount"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <label htmlFor="currency" className="sr-only">
                      Currency
                    </label>
                    <select
                      id="currency"
                      name="currency"
                      className="focus:ring-blue-500 focus:border-blue-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="eur">EUR</option>
                      <option value="usd">USD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="description"
                    id="description"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Description du paiement"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                  disabled={loading || !selectedRecipient || !amount || !description}
                >
                  {loading ? 'Création en cours...' : 'Créer le paiement'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={onClose}
                  disabled={loading}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
