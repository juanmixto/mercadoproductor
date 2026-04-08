import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { VendorProviders } from './providers'
import { VendorSidebar } from '@/components/layout/VendorSidebar'
import { VendorHeader } from '@/components/layout/VendorHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Portal Productor — Mercado Productor', template: '%s | Portal Productor' },
}

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.className}>
      <body>
        <VendorProviders>
          <div className="flex h-screen overflow-hidden">
            <VendorSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <VendorHeader />
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
        </VendorProviders>
      </body>
    </html>
  )
}
