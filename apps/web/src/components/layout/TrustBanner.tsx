const features = [
  { icon: '✅', title: 'Productores verificados', desc: 'Revisamos y aprobamos cada productor personalmente' },
  { icon: '🌱', title: 'Certificación ecológica', desc: 'Priorizamos productos con certificación ECO-ES' },
  { icon: '📦', title: 'Entrega unificada', desc: 'Un solo pedido aunque compres a varios productores' },
  { icon: '🛡️', title: 'Compra garantizada', desc: 'Reclamaciones y devoluciones resueltas en 48h' },
]

export function TrustBanner() {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {features.map(f => (
            <div key={f.title} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 hover:border-brand-200 hover:bg-brand-50/30 transition">
              <span className="text-xl shrink-0">{f.icon}</span>
              <div>
                <p className="text-xs font-semibold text-gray-900">{f.title}</p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
