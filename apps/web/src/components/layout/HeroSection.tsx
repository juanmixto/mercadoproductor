import Link from 'next/link'

const STATS = [
  { value: '150+', label: 'Productores activos' },
  { value: '2.400+', label: 'Productos ecológicos' },
  { value: '4.8★', label: 'Valoración media' },
  { value: 'km0', label: 'Proximidad garantizada' },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-earth-800">
      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-200">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Productos de proximidad
            </div>

            <h1 className="mb-5 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Del campo a tu mesa,<br />
              <span className="text-brand-300">sin intermediarios</span>
            </h1>

            <p className="mb-8 text-lg text-brand-100/80 leading-relaxed">
              Compra directamente a pequeños productores locales.
              Productos frescos, ecológicos y llenos de historia. Cada compra
              apoya a una familia agricultora.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/productos"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-brand-900 transition hover:bg-brand-50 shadow-lg"
              >
                Explorar productos
              </Link>
              <Link
                href="/productores"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/20"
              >
                Conocer productores
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map(s => (
              <div
                key={s.label}
                className="rounded-2xl bg-white/10 p-5 text-center backdrop-blur-sm border border-white/10"
              >
                <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
                <p className="text-sm text-brand-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/5 to-transparent" />
    </section>
  )
}
