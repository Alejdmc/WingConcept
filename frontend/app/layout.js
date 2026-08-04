import './globals.css'
import { Barlow, Barlow_Condensed, Montserrat } from 'next/font/google'
import AppShell from '@/components/layout/AppShell'
import SessionProvider from '@/components/providers/SessionProvider'
import ChunkLoadRecovery from '@/components/providers/ChunkLoadRecovery'
import { LanguageProvider } from '@/context/LanguageContext'
import { CartProvider } from '@/context/CartContext'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
  display: 'swap',
})

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-barlow',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

export const metadata = { title: 'Wing Concept' }

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${barlow.variable} ${barlowCondensed.variable}`}
    >
      <body className={montserrat.className}>
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
