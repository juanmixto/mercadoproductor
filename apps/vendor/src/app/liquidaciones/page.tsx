'use client'

import { useQuery } from '@tanstack/react-query'
import { vendorApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT:            { label: 'Borrador',         color: 'bg-gray-100 text-gray-600' },
  PENDING_APPROVAL: { label: 'En revisión',      color: 'bg-yellow-100 text-yellow-700' },
  APPROVED:         { label: 'Aprobada',         color: 'bg-blue-100 text-blue-700' },
  PAID:             { label: 'Pagada',           color: 'bg-green-100 text-green-700' },
  DISPUTED:         { label: 'Disputada',        color: 'bg-red-100 text-red-700' },
}

export default function LiquidacionesPage() {
  const { data: settlements, isLoading } = useQuery({
    queryKey: ['vendor', 'settlements'],
    queryFn: () => vendorApi.get('/settlements/me').then(r => r.data.data),
  })

  const list = Array.isArray(settlements) ? settlements : []

  const totalPaid = list
    .filter((s: any) => s.status === 'PAID')
    .reduce((sum: number, s: any) => sum + Number(s.netPayable), 0)

  const pending = list.filter((s: any) => ['DRAFT', 'PENDING_APPROVAL', 'APPROVED'].includes(s.status))
  const pendingAmount = pending.reduce((sum: number, s: any) => sum + Number(s.netPayable), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis liquidaciones</h1>
        <p className="text-sm text-gray-500 mt-1">Historial de pagos del marketplace</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total cobrado</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatPrice(totalPaid)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pendiente de cobro</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{formatPrice(pendingAmount)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Liquidaciones</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{list.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {['Período', 'Ventas brutas', 'Comisión MP', 'Devoluciones', 'Neto', 'Estado', 'Pago'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-gray-100 animate-pulse" /></td>)}</tr>
                ))
              : list.length === 0
              ? <tr><td colSpan={7} className="py-12 text-center text-gray-400">Sin liquidaciones todavía</td></tr>
              : list.map((s: any) => {
                  const st = STATUS_CONFIG[s.status] ?? { label: s.status, color: 'bg-gray-100' }
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700 text-xs">
                        {formatDate(s.periodFrom)} → {formatDate(s.periodTo)}
                      </td>
                      <td className="px-4 py-3">{formatPrice(s.grossSales)}</td>
                      <td className="px-4 py-3 text-red-600">-{formatPrice(s.commissionTotal)}</td>
                      <td className="px-4 py-3 text-orange-600">
                        {s.refundsDeducted > 0 ? `-${formatPrice(s.refundsDeducted)}` : '—'}
                      </td>
                      <td className="px-4 py-3 font-bold text-green-700">{formatPrice(s.netPayable)}</td>
                      <td className="px-4 py-3"><span className={`badge ${st.color}`}>{st.label}</span></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {s.paidAt ? formatDate(s.paidAt) : s.paymentReference ?? '—'}
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>
      </div>

      {/* Info box */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">¿Cómo funciona el pago?</p>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>Las liquidaciones se generan semanalmente (cada lunes)</li>
          <li>El equipo financiero las revisa y aprueba antes del miércoles</li>
          <li>La transferencia se realiza antes del viernes de la misma semana</li>
          <li>Recibirás un email de confirmación con el detalle del pago</li>
        </ul>
      </div>
    </div>
  )
}
