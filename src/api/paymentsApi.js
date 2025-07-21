import api from '@/api';

const paymentsApi = {
  fetchPaymentsOverview: async () => {
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  fetchPaymentDetails: async (id) => {
    try {
      if (!id) throw new Error('Payment ID is required');
      const response = await api.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  },

  // Create payment (works for all types: prestataire, partner, client)
  createPayment: async (data) => {
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments`, {
        direction: data.type === 'client' ? 'received' : 'sent',
        entity_type: data.type,
        entity_id: data.type === 'prestataire' ? data.prestataire_id : 
                  data.type === 'partner' ? data.partner_id : 
                  data.client_id,
        order_id: data.order_id,
        amount: parseFloat(data.amount).toFixed(2),
        payment_method: data.payment_method === 'card' ? 'credit_card' : data.payment_method,
        status: 'completed',
        notes: `Payment for order #${data.order_id}`,
        payment_date: new Date().toISOString().split('.')[0] + 'Z',
        transaction_id: `TX${Date.now()}`
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  // Get payments by order
  getPaymentsByOrder: async (orderId) => {
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments?order_id=${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payments by order:', error);
      throw error;
    }
  }
};

export default paymentsApi;
