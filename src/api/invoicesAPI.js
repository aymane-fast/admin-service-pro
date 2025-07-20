import api from '../api'

const invoicesApi = {
    async getInvoices() {
        try {
            console.log('Fetching all invoices (accepted quotes)...')
            const response = await api.get('/quotes')
            console.log('Raw invoices response:', response.data)
            
            // Handle different response formats
            let quotes = []
            if (Array.isArray(response.data)) {
                console.log(`Found ${response.data.length} quotes in direct array response`)
                quotes = response.data
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                console.log(`Found ${response.data.data.length} quotes in response.data.data`)
                quotes = response.data.data
            } else {
                console.warn('Unexpected quotes response format:', response.data)
                quotes = []
            }
            
            // Filter only accepted quotes (which are considered invoices)
            const acceptedQuotes = quotes.filter(quote => quote.status === 'accepted')
            console.log(`Found ${acceptedQuotes.length} accepted quotes (invoices)`)
            
            return acceptedQuotes
        } catch (error) {
            console.error('Error fetching invoices:', error)
            throw error
        }
    },

    async getInvoice(id) {
        try {
            console.log(`Fetching invoice (quote) with ID: ${id}`)
            const response = await api.get(`/quotes/${id}`)
            console.log(`Invoice data received for ID ${id}:`, response.data)
            
            // Handle different response formats
            let invoiceData = null
            if (response.data && response.data.data) {
                invoiceData = response.data.data
            } else {
                invoiceData = response.data
            }
            
            if (!invoiceData) {
                console.warn(`No invoice data found for ID ${id}`)
                throw new Error(`Invoice with ID ${id} not found`)
            }
            
            return invoiceData
        } catch (error) {
            console.error(`Error fetching invoice ${id}:`, error)
            throw error
        }
    },

    async getPayments(orderId) {
        try {
            console.log(`Fetching payments for order ID: ${orderId}`)
            const response = await api.get('/payments')
            console.log('Raw payments response:', response.data)
            
            // Ensure we have an array to filter
            let paymentsArray = []
            if (Array.isArray(response.data)) {
                paymentsArray = response.data
            } else if (response.data && response.data.payments && Array.isArray(response.data.payments)) {
                paymentsArray = response.data.payments
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                paymentsArray = response.data.data
            } else {
                console.warn('Unexpected payments response format:', response.data)
            }
            
            // Filter payments by order_id
            const filteredPayments = paymentsArray.filter(payment => 
                Number(payment.order_id) === Number(orderId)
            )
            
            console.log(`Found ${filteredPayments.length} payments for order ID ${orderId}`)
            return filteredPayments
        } catch (error) {
            console.error(`Error fetching payments for order ${orderId}:`, error)
            throw error
        }
    },

    async addPayment(orderId, paymentData) {
        try {
            console.log(`Adding payment for order ID ${orderId}:`, paymentData)
            
            const data = {
                order_id: orderId,
                client_id: paymentData.client_id,
                amount: paymentData.amount,
                payment_type: paymentData.payment_method, // API expects: cash or virement
                payment_date: paymentData.payment_date
            }
            
            console.log('Formatted payment data:', data)
            const response = await api.post('/payments', data)
            console.log('Payment creation response:', response.data)

            // After adding payment, calculate and update payment status
            console.log(`Updating payment status for order ID ${orderId}`)
            await this.updatePaymentStatus(orderId)
            
            return response.data
        } catch (error) {
            if (error.response?.status === 422) {
                console.error('Validation error when adding payment:', error.response.data)
                throw new Error(JSON.stringify(error.response.data.errors))
            }
            console.error(`Error adding payment for order ${orderId}:`, error)
            throw error
        }
    },

    async updatePaymentStatus(quoteId) {
        try {
            console.log(`Updating payment status for quote ID ${quoteId}`)
            
            // Get quote and payments data
            const [quote, payments] = await Promise.all([
                this.getInvoice(quoteId),
                this.getPayments(quoteId)
            ])
            
            // Calculate total paid amount
            const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
            const totalAmount = Number(quote.calculations?.total || quote.total || 0)
            
            console.log(`Quote ${quoteId} - Total amount: ${totalAmount}, Total paid: ${totalPaid}`)
            
            // Determine payment status
            let paymentStatus = 'pending'
            if (totalPaid >= totalAmount) {
                paymentStatus = 'paid'
            } else if (totalPaid > 0) {
                paymentStatus = 'partial'
            }
            
            console.log(`Setting payment status for quote ${quoteId} to: ${paymentStatus}`)
            
            // Update quote payment status
            const updateResponse = await api.patch(`/quotes/${quoteId}`, {
                payment_status: paymentStatus
            })
            
            console.log(`Payment status update response:`, updateResponse.data)
            return paymentStatus
        } catch (error) {
            console.error(`Error updating payment status for quote ${quoteId}:`, error)
            throw error
        }
    },

    async downloadInvoice(id) {
        try {
            console.log(`Downloading invoice for ID: ${id}`)
            const response = await api.get(`/quotes/${id}/download`, {
                responseType: 'blob'
            })
            
            // Create blob URL and trigger download
            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `facture-${id}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            
            console.log(`Invoice ${id} downloaded successfully`)
            return true
        } catch (error) {
            console.error(`Error downloading invoice ${id}:`, error)
            throw error
        }
    }
}

export default invoicesApi
