'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShoppingCartIcon, UserIcon, MagnifyingGlassIcon,
  Bars3Icon, XMarkIcon, ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { useState, useRef, useEffect, FormEvent } from 'react'

const CATEGORIES = [
  { slug: 'frutas-verduras', name: 'Frutas y Verduras', icon: '🍅' },
  { slug: 'lacteos-huevos', name: 'Lácteos y Huevos', icon: '🥛' },
  { slug: 'aceites-conservas', name: 'Aceites y Conservas', icon: '🫙' },
  { slug: 'panaderia-cereales', name: 'Panadería y Cereales', icon: '🍞' },
  { slug: 'carnes-embutidos', name: 'Carnes y Embutidos', icon: '🥩' },
  { slug: 'vinos-bebidas', name: 'Vinos y Bebidas', icon: '🍷' },
]

export function Header() {
  const router = useRouter()
  const itemCount = useCartStore(s => s.itemCount)
  const { isAuthenticated, user, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [query, setQuery] = useState('')
  const catRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/productos?buscar=${encodeURIComponent(query.trim())}`)
      setMobileOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      {/* Top bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🌿</span>
            <div className="hidden sm:block">
              <span className="font-bold text-gray-900 text-sm leading-none block">Mercado Productor</span>
              <span className="text-[10px] text-brand-600 font-medium">Del campo a tu mesa</span>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tomates, aceite de oliva, queso..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Categories dropdown */}
            <div className="relative" ref={catRef}>
              <button
                onClick={() => setCatOpen(v => !v)}
                className="btn-ghost text-sm gap-1"
              >
                Categorías
                <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
              </button>
              {catOpen && (
                <div className="absolute left-0 top-full mt-1 w-52 rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
                  {CATEGORIES.map(c => (
                    <Link
                      key={c.slug}
                      href={`/productos?categoria=${c.slug}`}
                      onClick={() => setCatOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span>{c.icon}</span>
                      {c.name}
                    </Link>
                  ))}
                  <div className="mt-1 border-t border-gray-100 pt-1">
                    <Link
                      href="/productos"
                      onClick={() => setCatOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
                    >
                      Ver todos los productos →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/productores" className="btn-ghost text-sm">Productores</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {/* User */}
            {isAuthenticated ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserOpen(v => !v)}
                  className="btn-ghost p-2 flex items-center gap-1.5"
                >
                  <div className="h-7 w-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <ChevronDownIcon className="h-3 w-3 hidden sm:block" />
                </button>
                {userOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
                    <div className="border-b border-gray-100 px-3 py-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{user?.firstName}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <Link href="/cuenta" onClick={() => setUserOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Mi cuenta</Link>
                    <Link href="/cuenta/pedidos" onClick={() => setUserOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Mis pedidos</Link>
                    <button
                      onClick={() => { logout(); setUserOpen(false) }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1">
                <Link href="/auth/login" className="btn-ghost text-sm px-3">Entrar</Link>
                <Link href="/auth/register" className="btn-primary text-sm px-3 py-2">Registro</Link>
              </div>
            )}

            {/* Cart */}
            <Link href="/carrito" className="relative p-2 rounded-lg hover:bg-gray-100 transition">
              <ShoppingCartIcon className="h-5 w-5 text-gray-600" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 min-w-[1.1rem] items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white px-1 animate-in zoom-in duration-200">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="btn-ghost p-2 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menú"
            >
              {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="input pl-9"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-0.5">
              <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Categorías</p>
              {CATEGORIES.map(c => (
                <Link key={c.slug} href={`/productos?categoria=${c.slug}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  <span>{c.icon}</span>{c.name}
                </Link>
              ))}
              <div className="my-2 border-t border-gray-100" />
              <Link href="/productores" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Productores
              </Link>
              {!isAuthenticated ? (
                <div className="flex gap-2 mt-2">
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-sm py-2">Entrar</Link>
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 text-sm py-2">Registro</Link>
                </div>
              ) : (
                <>
                  <Link href="/cuenta" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Mi cuenta</Link>
                  <button onClick={() => { logout(); setMobileOpen(false) }} className="rounded-lg px-3 py-2.5 text-sm text-left text-red-600 hover:bg-red-50">Cerrar sesión</button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
