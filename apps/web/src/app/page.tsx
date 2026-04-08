import { HeroSection } from '@/components/layout/HeroSection'
import { CategoryGrid } from '@/components/product/CategoryGrid'
import { FeaturedProducts } from '@/components/product/FeaturedProducts'
import { VendorShowcase } from '@/components/vendor/VendorShowcase'
import { TrustBanner } from '@/components/layout/TrustBanner'
import Link from 'next/link'
import { Suspense } from 'react'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBanner />

      {/* Categorías */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">¿Qué buscas hoy?</h2>
            <p className="text-sm text-gray-500 mt-0.5">Productos organizados por tipo</p>
          </div>
          <Link href="/productos" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Ver todo →
          </Link>
        </div>
        <CategoryGrid />
      </section>

      {/* Cómo funciona */}
      <HowItWorks />

      {/* Productos destacados */}
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Productos de temporada</h2>
              <p className="text-sm text-gray-500 mt-0.5">Frescos, ecológicos, llegados esta semana</p>
            </div>
            <Link href="/productos" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Ver todos →
            </Link>
          </div>
          <Suspense fallback={<ProductSkeleton />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* Productores */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Nuestros productores</h2>
          <p className="text-sm text-gray-500 mt-0.5">Conoce a las personas que cultivan lo que comes</p>
        </div>
        <VendorShowcase />
      </section>

      {/* CTA Productor */}
      <section className="bg-brand-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-brand-300 text-sm font-semibold uppercase tracking-wider mb-3">¿Eres productor?</p>
          <h2 className="text-3xl font-bold text-white mb-4">Vende directamente a tu cliente</h2>
          <p className="text-brand-200 mb-8 max-w-lg mx-auto">
            Sin intermediarios. Tú pones el precio, nosotros gestionamos los pedidos,
            cobros y logística. Comisión del 12%.
          </p>
          <Link
            href="/vendedores/registro"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-brand-900 hover:bg-brand-50 transition shadow-lg"
          >
            Únete como productor
          </Link>
        </div>
      </section>
    </>
  )
}

function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: '🔍',
      title: 'Explora y elige',
      desc: 'Navega entre más de 2.400 productos de productores verificados de toda España.',
    },
    {
      number: '02',
      icon: '🛒',
      title: 'Un solo carrito',
      desc: 'Añade productos de distintos productores. Un solo pedido, un solo pago.',
    },
    {
      number: '03',
      icon: '🚜',
      title: 'Los productores preparan',
      desc: 'Cada productor prepara tu pedido con mimo. Te avisamos en cada paso.',
    },
    {
      number: '04',
      icon: '📦',
      title: 'Lo recibes en casa',
      desc: 'Entrega unificada en tu domicilio. Siempre con garantía de satisfacción.',
    },
  ]

  return (
    <section className="py-16 border-y border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900">¿Cómo funciona?</h2>
          <p className="text-gray-500 mt-2">Comprar es simple. En 4 pasos.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="absolute top-8 left-[calc(50%+2rem)] right-[-calc(50%-2rem)] hidden h-px bg-gray-200 lg:block" />
              )}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-3xl">
                {step.icon}
              </div>
              <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">{step.number}</p>
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card animate-pulse overflow-hidden">
          <div className="aspect-[4/3] bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-3 w-1/3 rounded bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-8 w-full rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  )
}
