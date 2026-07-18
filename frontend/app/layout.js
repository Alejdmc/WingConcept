import './globals.css'
import AppShell from '@/components/layout/AppShell'
import SessionProvider from '@/components/providers/SessionProvider'
import ChunkLoadRecovery from '@/components/providers/ChunkLoadRecovery'
import { LanguageProvider } from '@/context/LanguageContext'
import { CartProvider } from '@/context/CartContext'

export const metadata = { title: 'Wing Concept' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <ChunkLoadRecovery>
            <SessionProvider>
              <CartProvider>
                <AppShell>{children}</AppShell>
              </CartProvider>
            </SessionProvider>
          </ChunkLoadRecovery>
        </LanguageProvider>
      </body>
    </html>
  )
}