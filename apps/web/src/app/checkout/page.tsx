'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckoutAddressForm } from '@/components/cart/CheckoutAddressForm'
import { CheckoutSummary } from '@/components/cart/CheckoutSummary'
import { useCart } from '@/hooks/useCart'
import { apiClient } from '@/lib/api'

type Step = 'address' | 'review' | 'processing'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart } = useCart()
  const [step, setStep] = useState<Step>('address')
  const [addresses, setAddresses] = useState<{ shipping: unknown; billing: unknown } | null>(null)

  async function handlePlaceOrder() {
    if (!addresses) return
    setStep('processing')
    try {
      const { data } = await apiClient.post('/orders', {
        shippingAddress: addresses.shipping,
        billingAddress: addresses.billing,
      })
      router.push(`/cuenta/pedidos/${data.data.orderId}?nuevo=1`)
    } catch {
      setStep('review')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Steps indicator */}
      <div className="mb-8 flex items-center gap-4 text-sm">
        {['Dirección', 'Revisar', 'Confirmado'].map((label, i) => {
          const stepIdx = ['address', 'review', 'processing'].indexOf(step)
          return (
            <div key={label} className="flex items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                i <= stepIdx ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{i + 1}</span>
              <span className={i <= stepIdx ? 'font-medium text-gray-900' : 'text-gray-400'}>{label}</span>
              {i < 2 && <span className="text-gray-300">—</span>}
            </div>
          )
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {step === 'address' && (
            <CheckoutAddressForm
              onSubmit={(data) => {
                setAddresses(data)
                setStep('review')
              }}
            />
          )}
          {step === 'review' && (
            <div className="card p-6 space-y-6">
              <h2 className="text-xl font-semibold">Revisa tu pedido</h2>
              <p className="text-gray-500 text-sm">
                Al confirmar, se creará tu pedido y los productores recibirán una notificación.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStep('address')} className="btn-secondary">
                  Editar dirección
                </button>
                <button onClick={handlePlaceOrder} className="btn-primary">
                  Confirmar pedido
                </button>
              </div>
            </div>
          )}
          {step === 'processing' && (
            <div className="card p-12 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
              <p className="text-gray-600">Procesando tu pedido...</p>
            </div>
          )}
        </div>

        <div className="shrink-0">
          {cart && <CheckoutSummary cart={cart} />}
        </div>
      </div>
    </div>
  )
}
