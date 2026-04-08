'use client'

import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { vendorApi } from '@/lib/api'

export default function PerfilPage() {
  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', 'profile'],
    queryFn: () => vendorApi.get('/vendors/me').then(r => r.data.data),
  })

  const { register, handleSubmit } = useForm({ values: vendor })

  async function onSubmit(data: any) {
    await vendorApi.patch('/vendors/me', data)
  }

  if (isLoading) {
    return <div className="space-y-4 animate-pulse">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 rounded-lg bg-gray-100" />)}</div>
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <p className="text-sm text-gray-500 mt-1">Esta información es visible para los clientes en la tienda</p>
      </div>

      {/* Estado */}
      <div className="card p-4 flex items-center gap-3">
        <div className={`h-3 w-3 rounded-full ${vendor?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-500'}`} />
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Estado: {vendor?.status === 'ACTIVE' ? 'Activo' : vendor?.status}
          </p>
          {vendor?.status !== 'ACTIVE' && (
            <p className="text-xs text-gray-500">Tu perfil está siendo revisado por el equipo</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Info pública */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Información pública</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Nombre del negocio</label>
              <input {...register('displayName')} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
              <textarea {...register('description')} rows={4} className="input resize-none" placeholder="Cuéntanos tu historia..." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Localización</label>
              <input {...register('location')} className="input" placeholder="Sevilla, Andalucía" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Región de origen</label>
              <input {...register('originRegion')} className="input" placeholder="Andalucía" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sitio web</label>
              <input {...register('website')} className="input" type="url" placeholder="https://..." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email público</label>
              <input {...register('publicEmail')} className="input" type="email" />
            </div>
          </div>
        </div>

        {/* Configuración de pedidos */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Configuración de pedidos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Hora de corte de pedidos</label>
              <input {...register('orderCutoffTime')} className="input" type="time" />
              <p className="mt-1 text-xs text-gray-400">Pedidos recibidos después de esta hora se procesan al día siguiente</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Días de preparación</label>
              <input {...register('preparationDays')} className="input" type="number" min={0} max={10} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Pedido mínimo (€)</label>
              <input {...register('minOrderAmount')} className="input" type="number" step="0.01" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Envío gratis a partir de (€)</label>
              <input {...register('freeShippingAbove')} className="input" type="number" step="0.01" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary px-8">Guardar cambios</button>
        </div>
      </form>

      {/* Datos bancarios — solo lectura desde aquí */}
      <div className="card p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">Datos bancarios</h2>
        <p className="text-sm text-gray-500">Para modificar tus datos bancarios contacta con el equipo en <strong>soporte@mercadoproductor.com</strong></p>
        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
          <p><span className="text-gray-400">IBAN:</span> {vendor?.iban ? `****${vendor.iban.slice(-4)}` : 'No configurado'}</p>
          <p><span className="text-gray-400">Titular:</span> {vendor?.bankAccountName ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}
