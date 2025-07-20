import './globals.css'
import AuthProvider from '../components/AuthProvider'

export const metadata = {
  title: 'Admin',
  description: 'Service Management Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
