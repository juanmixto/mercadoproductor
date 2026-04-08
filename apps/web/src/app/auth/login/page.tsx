'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { apiClient } from '@/lib/api'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore(s => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiClient.post('/auth/login', { email, password })
      const { user, token } = res.data.data
      login(user, token)
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900">
            <span className="text-3xl">🌿</span>
            Mercado Productor
          </Link>
          <p className="mt-2 text-sm text-gray-500">Bienvenido de nuevo</p>
        </div>

        <div className="card p-6">
          <h1 className="mb-6 text-xl font-bold text-gray-900">Iniciar sesión</h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Contraseña</label>
                <Link href="/auth/reset" className="text-xs text-brand-600 hover:text-brand-700">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            ¿Primera vez?{' '}
            <Link href="/auth/register" className="font-medium text-brand-600 hover:text-brand-700">
              Crear una cuenta
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Credenciales de prueba</p>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span className="text-gray-400">Cliente:</span>
              <code>cliente@test.com / cliente1234</code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Productor:</span>
              <code>productor@test.com / productor1234</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
