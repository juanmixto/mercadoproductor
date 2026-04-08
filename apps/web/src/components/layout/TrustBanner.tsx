const features = [
  { icon: '🚜', title: 'Productores verificados', desc: 'Revisamos y aprobamos cada productor personalmente' },
  { icon: '🌱', title: 'Productos ecológicos', desc: 'Priorizamos certificaciones eco y agricultura sostenible' },
  { icon: '📦', title: 'Entrega unificada', desc: 'Un solo pedido aunque compres a varios productores' },
  { icon: '🛡️', title: 'Compra protegida', desc: 'Incidencias y devoluciones gestionadas por nosotros' },
]

export function TrustBanner() {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {features.map(f => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
