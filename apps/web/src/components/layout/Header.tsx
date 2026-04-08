'use client'

import Link from 'next/link'
import { ShoppingCartIcon, UserIcon, MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { useState } from 'react'

export function Header() {
  const itemCount = useCartStore(s => s.itemCount)
  const { isAuthenticated, user } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🌿</span>
            <span className="font-bold text-gray-900 hidden sm:block">Mercado Productor</span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar productos, productores..."
                className="input pl-9 py-2 bg-gray-50"
              />
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/productos" className="btn-ghost text-sm">Productos</Link>
            <Link href="/productores" className="btn-ghost text-sm">Productores</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link href="/cuenta" className="btn-ghost p-2">
                <UserIcon className="h-5 w-5" />
                <span className="sr-only">{user?.firstName}</span>
              </Link>
            ) : (
              <Link href="/auth/login" className="btn-ghost text-sm hidden sm:flex">
                Entrar
              </Link>
            )}

            <Link href="/carrito" className="btn-ghost relative p-2">
              <ShoppingCartIcon className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            <button
              className="btn-ghost p-2 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="border-t border-gray-100 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              <Link href="/productos" className="btn-ghost justify-start" onClick={() => setMobileOpen(false)}>
                Productos
              </Link>
              <Link href="/productores" className="btn-ghost justify-start" onClick={() => setMobileOpen(false)}>
                Productores
              </Link>
              {!isAuthenticated && (
                <Link href="/auth/login" className="btn-ghost justify-start" onClick={() => setMobileOpen(false)}>
                  Iniciar sesión
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
