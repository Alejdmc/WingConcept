import './globals.css'
import AppShell from '@/components/layout/AppShell'
import SessionProvider from '@/components/providers/SessionProvider'
import { LanguageProvider } from '@/context/LanguageContext'
import { CartProvider } from '@/context/CartContext'

export const metadata = { title: 'Wing Concept' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <SessionProvider>
            <CartProvider>
              <AppShell>{children}</AppShell>
            </CartProvider>
          </SessionProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}