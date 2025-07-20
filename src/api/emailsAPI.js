import api from '../api'

// Helper function to generate a professional HTML email template for credentials
export const generateCredentialsEmailTemplate = (userData, role) => {
  const roleText = role === 'partner' ? 'Partenaire' : 'Prestataire';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vos identifiants ServicePro</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.5;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
        }
        
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .email-header {
          background-color: #1e40af;
          padding: 30px;
          text-align: center;
        }
        
        .email-header img {
          height: 50px;
        }
        
        .email-body {
          padding: 30px;
        }
        
        .email-footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        
        h1 {
          color: #1e3a8a;
          font-size: 24px;
          margin-top: 0;
          margin-bottom: 20px;
        }
        
        p {
          margin-bottom: 16px;
        }
        
        .credentials-box {
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .credentials-item {
          margin-bottom: 10px;
        }
        
        .credentials-label {
          font-weight: bold;
          color: #4b5563;
        }
        
        .credentials-value {
          font-family: monospace;
          background-color: #fff;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          display: block;
          margin-top: 5px;
        }
        
        .login-button {
          display: inline-block;
          background-color: #1e40af;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: bold;
          margin-top: 10px;
        }
        
        .note {
          font-size: 14px;
          color: #6b7280;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <img src="https://service-pro-admin-master.vercel.app/assets/logo-vertigo.b6dd3a74.svg" alt="ServicePro Logo">
        </div>
        
        <div class="email-body">
          <h1>Bienvenue chez ServicePro !</h1>
          
          <p>Bonjour ${userData.first_name} ${userData.last_name},</p>
          
          <p>Nous sommes ravis de vous accueillir en tant que ${roleText} sur la plateforme ServicePro. Votre compte a été créé avec succès.</p>
          
          <p>Voici vos identifiants de connexion :</p>
          
          <div class="credentials-box">
            <div class="credentials-item">
              <div class="credentials-label">Email :</div>
              <div class="credentials-value">${userData.email}</div>
            </div>
            
            <div class="credentials-item">
              <div class="credentials-label">Mot de passe :</div>
              <div class="credentials-value">${userData.password}</div>
            </div>
          </div>
          
          <p>Pour vous connecter à votre compte, cliquez sur le bouton ci-dessous :</p>
          
          <div style="text-align: center;">
            <a href="https://service-pro-admin-master.vercel.app/" class="login-button">Se connecter</a>
          </div>
          
          <p class="note">Note : Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe après votre première connexion.</p>
        </div>
        
        <div class="email-footer">
          <p>© ${new Date().getFullYear()} ServicePro. Tous droits réservés.</p>
          <p>Ce message est automatique, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const emailsApi = {
    // Fetch Gmail messages
    fetchEmails: async (params = {}) => {
        try {
            const { limit = 10, page = 1, query = '' } = params
            console.log('Fetching emails with params:', params)
            
            const response = await api.get('/gmail/messages', {
                params: { 
                  limit, 
                  page,
                  query 
                }
            })
            
            console.log('Raw email response:', response)

            if (!response.data || !response.data.data) {
                console.warn('Invalid response format:', response)
                return []
            }

            // Transform the API response to match our UI format
            const emails = response.data.data.map(email => ({
                id: email.id,
                sender: email.from ? email.from.split('<')[0].trim() : 'Unknown', // Extract name
                email: email.from ? (email.from.match(/<(.+)>/)?.[1] || email.from) : '', // Extract email
                subject: email.subject,
                preview: email.snippet,
                date: email.date,
                read: !email.labelIds?.includes('UNREAD')
            }))

            console.log('Transformed emails:', emails)
            return {
              data: emails,
              total: response.data.total || emails.length,
              page: response.data.page || page,
            }

        } catch (error) {
            console.error('Error fetching emails:', error, {
                config: error.config,
                response: error.response?.data,
                status: error.response?.status
            })
            throw error
        }
    },

    // Mark email as read
    markAsRead: async (id) => {
        try {
            const response = await api.get(`/gmail/messages/${id}`)
            return response.data
        } catch (error) {
            console.error('Error marking email as read:', error)
            throw error
        }
    },

    // Archive email
    archiveEmail: async (id) => {
        try {
            const response = await api.post(`/gmail/messages/${id}/archive`)
            return response.data
        } catch (error) {
            console.error('Error archiving email:', error)
            throw error
        }
    },

    // Get Gmail configuration status
    getGmailConfig: async () => {
        try {
            const response = await api.get('/gmail/configs')
            return response.data
        } catch (error) {
            console.error('Error fetching Gmail config:', error)
            throw error
        }
    },

    // Get a single email
    getEmail: async (id) => {
        try {
            const response = await api.get(`/gmail/messages/${id}`)
            const email = response.data.data
            
            // Transform the API response to match our UI format
            return {
                id: email.id,
                threadId: email.threadId,
                sender: email.from.split('<')[0].trim(),
                email: email.from.match(/<(.+)>/)?.[1] || email.from,
                to: email.to,
                cc: email.cc,
                subject: email.subject,
                body: email.body.html || email.body.plain, // Prefer HTML content
                date: email.date,
                read: !email.labelIds?.includes('UNREAD'),
                attachments: email.attachments?.map(attachment => ({
                    id: attachment.id,
                    filename: attachment.filename,
                    size: attachment.size,
                    mimeType: attachment.mimeType,
                    url: `/api/gmail/messages/${id}/attachments/${attachment.id}`
                })) || []
            }
        } catch (error) {
            console.error('Error fetching email:', error)
            throw error
        }
    },

    // Send email
    sendEmail: async (formData) => {
        try {
            const response = await api.post('/gmail/messages/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            return response.data
        } catch (error) {
            console.error('Error sending email:', error)
            throw error
        }
    },
    
    // Send credentials email
    sendCredentialsEmail: async (userData, role) => {
        try {
            const htmlContent = generateCredentialsEmailTemplate(userData, role);
            
            const formData = new FormData();
            formData.append('to', userData.email);
            formData.append('subject', `Vos identifiants de connexion ServicePro - ${role === 'partner' ? 'Partenaire' : 'Prestataire'}`);
            formData.append('body', htmlContent);
            formData.append('isHtml', 'true');
            
            const response = await api.post('/gmail/messages/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Error sending credentials email:', error);
            throw error;
        }
    },

    // Save Gmail configuration
    saveGmailConfig: async (config) => {
        try {
            const response = await api.post('/gmail/config', config)
            return response.data
        } catch (error) {
            console.error('Error saving Gmail config:', error)
            throw error
        }
    },
} 