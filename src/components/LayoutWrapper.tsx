'use client'
import { usePathname } from 'next/navigation'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth')
  const isDashboardPage = pathname?.startsWith('/dashboard')

  if (isAuthPage || isDashboardPage) {
    return (
      <main className="flex-grow flex flex-col relative">
        {children}
      </main>
    )
  }

  return (
    <>
      <Header />

      <main className="flex-grow">
        {children}
      </main>

      <Footer />
    </>
  )
}
