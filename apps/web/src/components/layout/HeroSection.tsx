import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-earth-800">
      <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-300">
            Productos de proximidad
          </p>
          <h1 className="mb-6 text-5xl font-bold leading-tight text-white sm:text-6xl">
            Del campo a tu mesa,<br />
            <span className="text-brand-300">sin intermediarios</span>
          </h1>
          <p className="mb-8 text-xl text-brand-100/80">
            Compra directamente a pequeños productores locales. Productos frescos, ecológicos y llenos de historia.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/productos" className="btn-primary bg-white text-brand-900 hover:bg-brand-50 text-base px-6 py-3">
              Explorar productos
            </Link>
            <Link href="/productores" className="btn-secondary border-white/30 text-white hover:bg-white/10 text-base px-6 py-3">
              Conocer productores
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
