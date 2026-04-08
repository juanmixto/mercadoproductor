'use client'

import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingBagIcon, HeartIcon, MapPinIcon,
  UserIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline'

export default function CuentaPage() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) router.replace('/auth/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) return null

  const menuItems = [
    {
      href: '/cuenta/pedidos',
      icon: ShoppingBagIcon,
      label: 'Mis pedidos',
      desc: 'Historial y seguimiento de pedidos',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      href: '/cuenta/favoritos',
      icon: HeartIcon,
      label: 'Favoritos',
      desc: 'Productos guardados para después',
      color: 'text-rose-600 bg-rose-50',
    },
    {
      href: '/cuenta/direcciones',
      icon: MapPinIcon,
      label: 'Mis direcciones',
      desc: 'Gestiona tus direcciones de entrega',
      color: 'text-amber-600 bg-amber-50',
    },
    {
      href: '/cuenta/perfil',
      icon: UserIcon,
      label: 'Datos personales',
      desc: 'Nombre, email y contraseña',
      color: 'text-indigo-600 bg-indigo-50',
    },
  ]

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white">
          {user.firstName[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hola, {user.firstName}
          </h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-3">
        {menuItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="card flex items-center gap-4 p-4 hover:border-gray-200 hover:shadow-md transition-all"
          >
            <div className={`rounded-xl p-3 ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-gray-300" />
          </Link>
        ))}
      </div>

      {/* Logout */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        <button
          onClick={() => { logout(); router.push('/') }}
          className="text-sm text-red-500 hover:text-red-700 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
