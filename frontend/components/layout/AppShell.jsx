'use client'
import { usePathname } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const HIDE_SHELL_PREFIXES = ['/admin']

export default function AppShell({ children }) {
  const pathname = usePathname()
  const hideShell = HIDE_SHELL_PREFIXES.some((prefix) => pathname?.startsWith(prefix))

  if (hideShell) {
    return children
  }

  return (
    <>
      <TopBar />
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
