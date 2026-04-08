'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { vendorApi } from '@/lib/api'
import { useState } from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

// Profile completion score
function getCompletionSteps(vendor: any) {
  return [
    { label: 'Nombre del negocio', done: !!vendor?.displayName },
    { label: 'Descripción', done: !!vendor?.description && vendor.description.length > 30 },
    { label: 'Localización', done: !!vendor?.location },
    { label: 'Foto de perfil', done: !!vendor?.logoUrl },
    { label: 'Cuenta bancaria', done: !!vendor?.iban },
    { label: 'Horario de pedidos', done: !!vendor?.orderCutoffTime },
  ]
}

export default function PerfilPage() {
  const qc = useQueryClient()
  const [saved, setSaved] = useState(false)

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor-profile'],
    queryFn: () => vendorApi.get('/vendors/me').then(r => r.data.data),
  })

  const { register, handleSubmit, formState: { isDirty } } = useForm({ values: vendor })

  const update = useMutation({
    mutationFn: (data: any) => vendorApi.patch('/vendors/me', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-profile'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  const steps = getCompletionSteps(vendor)
  const completedCount = steps.filter(s => s.done).length
  const completionPct = Math.round((completedCount / steps.length) * 100)

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-gray-100" />)}
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <p className="text-sm text-gray-500 mt-0.5">Esta información es visible para los clientes en la tienda</p>
      </div>

      {/* Status + completion */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Account status */}
        <div className="card p-4 flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full shrink-0 ${vendor?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-500'}`} />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {vendor?.status === 'ACTIVE' ? 'Cuenta activa' : `Estado: ${vendor?.status}`}
            </p>
            <p className="text-xs text-gray-500">
              {vendor?.status === 'ACTIVE' ? 'Visible en la tienda y recibiendo pedidos' : 'Pendiente de revisión por el equipo'}
            </p>
          </div>
        </div>

        {/* Completion */}
        <div className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Perfil completado</p>
            <p className="text-sm font-bold text-brand-600">{completionPct}%</p>
          </div>
          <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-1">
            {steps.map(step => (
              <div key={step.label} className={`flex items-center gap-1.5 text-xs ${step.done ? 'text-gray-500' : 'text-amber-600'}`}>
                <span>{step.done ? '✓' : '○'}</span>
                {step.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(d => update.mutate(d))} className="space-y-5">
        {/* Info pública */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Información pública</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Nombre del negocio *</label>
              <input {...register('displayName')} className="input" placeholder="Huerta Los Olivos" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Descripción *
                <span className="ml-1 text-xs font-normal text-gray-400">Cuéntanos tu historia (mín. 30 caracteres)</span>
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="input resize-none"
                placeholder="Somos productores ecológicos desde 1985 en el corazón de Andalucía..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Localización</label>
              <input {...register('location')} className="input" placeholder="Sevilla, Andalucía" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Región de origen</label>
              <input {...register('originRegion')} className="input" placeholder="Andalucía" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Sitio web</label>
              <input {...register('website')} className="input" type="url" placeholder="https://..." />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email de contacto</label>
              <input {...register('publicEmail')} className="input" type="email" />
            </div>
          </div>
        </div>

        {/* Configuración de pedidos */}
        <div className="card p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-gray-900">Configuración de pedidos</h2>
            <p className="text-xs text-gray-400 mt-0.5">Define cuándo y cómo recibes pedidos</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Hora de corte</label>
              <input {...register('orderCutoffTime')} className="input" type="time" />
              <p className="mt-1 text-xs text-gray-400">Pedidos después de esta hora → siguiente jornada</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Días de preparación</label>
              <input {...register('preparationDays')} className="input" type="number" min={0} max={10} />
              <p className="mt-1 text-xs text-gray-400">Días hábiles para preparar un pedido</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Pedido mínimo (€)</label>
              <input {...register('minOrderAmount')} className="input" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Envío gratis a partir de (€)</label>
              <input {...register('freeShippingAbove')} className="input" type="number" step="0.01" placeholder="0.00" />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between">
          {saved && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircleIcon className="h-4 w-4" />
              Cambios guardados
            </div>
          )}
          <div className="ml-auto flex gap-3">
            <button
              type="submit"
              disabled={update.isPending || !isDirty}
              className="btn-primary px-8 disabled:opacity-50"
            >
              {update.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>

      {/* Bank info — read only */}
      <div className="card p-6 space-y-3">
        <div>
          <h2 className="font-semibold text-gray-900">Datos bancarios</h2>
          <p className="text-xs text-gray-400 mt-0.5">Para modificar contacta con soporte@mercadoproductor.com</p>
        </div>
        <div className="grid gap-2 rounded-xl bg-gray-50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">IBAN</span>
            <span className="font-mono font-medium text-gray-700">
              {vendor?.iban ? `ES•• •••• •••• •••• ${vendor.iban.slice(-4)}` : <span className="text-amber-600 text-xs">No configurado</span>}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Titular</span>
            <span className="text-gray-700">{vendor?.bankAccountName ?? '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Comisión</span>
            <span className="text-gray-700">{vendor?.commissionRate ? `${(vendor.commissionRate * 100).toFixed(0)}%` : '12%'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
