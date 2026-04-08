import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AdminProviders } from './providers'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { AdminHeader } from '@/components/layout/AdminHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Admin — Mercado Productor', template: '%s | Admin MP' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.className}>
      <body>
        <AdminProviders>
          <div className="flex h-screen overflow-hidden">
            <AdminSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <AdminHeader />
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </div>
          </div>
        </AdminProviders>
      </body>
    </html>
  )
}
