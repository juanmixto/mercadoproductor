import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Mercado Productor — Productos del campo a tu mesa',
    template: '%s | Mercado Productor',
  },
  description: 'Compra directamente a pequeños productores locales. Productos frescos, ecológicos y de proximidad.',
  keywords: ['productos ecológicos', 'km0', 'productores locales', 'mercado online', 'agricultura ecológica'],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Mercado Productor',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
