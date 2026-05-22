import './globals.css'
import TopBar from '@/components/layout/TopBar'
import Navbar from '@/components/layout/Navbar'

export const metadata = { title: 'Wing Concept' }

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <TopBar />
        <Navbar />
        {children}
      </body>
    </html>
  )
}