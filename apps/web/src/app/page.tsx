import { HeroSection } from '@/components/layout/HeroSection'
import { CategoryGrid } from '@/components/product/CategoryGrid'
import { FeaturedProducts } from '@/components/product/FeaturedProducts'
import { VendorShowcase } from '@/components/vendor/VendorShowcase'
import { TrustBanner } from '@/components/layout/TrustBanner'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBanner />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">Compra por categoría</h2>
        <CategoryGrid />
      </section>
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">Productos destacados</h2>
          <FeaturedProducts />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Nuestros productores</h2>
        <p className="mb-8 text-gray-500">Conoce a las personas que cultivan lo que comes</p>
        <VendorShowcase />
      </section>
    </>
  )
}
