'use client'

import { useForm } from 'react-hook-form'

interface AddressData {
  name: string
  line1: string
  line2?: string
  city: string
  province: string
  postalCode: string
  country: string
  phone?: string
}

interface FormData {
  shipping: AddressData
  sameAsBilling: boolean
  billing: AddressData
}

interface Props {
  onSubmit: (data: { shipping: AddressData; billing: AddressData }) => void
}

export function CheckoutAddressForm({ onSubmit }: Props) {
  const { register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: { sameAsBilling: true, shipping: { country: 'ES' }, billing: { country: 'ES' } },
  })
  const sameAsBilling = watch('sameAsBilling')

  function onValid(data: FormData) {
    onSubmit({
      shipping: data.shipping,
      billing: data.sameAsBilling ? data.shipping : data.billing,
    })
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-6">
      <div className="card p-6">
        <h2 className="mb-4 text-xl font-semibold">Dirección de envío</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Nombre completo</label>
            <input {...register('shipping.name', { required: true })} className="input" placeholder="María García" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Dirección</label>
            <input {...register('shipping.line1', { required: true })} className="input" placeholder="Calle Mayor 123" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Piso, puerta (opcional)</label>
            <input {...register('shipping.line2')} className="input" placeholder="2º B" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Código postal</label>
            <input {...register('shipping.postalCode', { required: true })} className="input" placeholder="28001" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Ciudad</label>
            <input {...register('shipping.city', { required: true })} className="input" placeholder="Madrid" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Provincia</label>
            <input {...register('shipping.province', { required: true })} className="input" placeholder="Madrid" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
            <input {...register('shipping.phone')} className="input" placeholder="+34 600 000 000" type="tel" />
          </div>
        </div>
      </div>

      <div className="card p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" {...register('sameAsBilling')} className="rounded border-gray-300 text-brand-600" />
          <span className="text-sm text-gray-700">La dirección de facturación es la misma</span>
        </label>
      </div>

      {!sameAsBilling && (
        <div className="card p-6">
          <h2 className="mb-4 text-xl font-semibold">Dirección de facturación</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Nombre completo</label>
              <input {...register('billing.name', { required: !sameAsBilling })} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Dirección</label>
              <input {...register('billing.line1', { required: !sameAsBilling })} className="input" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Código postal</label>
              <input {...register('billing.postalCode', { required: !sameAsBilling })} className="input" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Ciudad</label>
              <input {...register('billing.city', { required: !sameAsBilling })} className="input" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Provincia</label>
              <input {...register('billing.province', { required: !sameAsBilling })} className="input" />
            </div>
          </div>
        </div>
      )}

      <button type="submit" className="btn-primary w-full py-3 text-base">
        Continuar →
      </button>
    </form>
  )
}
