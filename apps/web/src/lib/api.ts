import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

// Attach token from localStorage on client
if (typeof window !== 'undefined') {
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('mp_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    const sessionId = getOrCreateSessionId()
    config.headers['x-session-id'] = sessionId
    return config
  })
}

function getOrCreateSessionId(): string {
  let sid = localStorage.getItem('mp_session')
  if (!sid) {
    sid = crypto.randomUUID()
    localStorage.setItem('mp_session', sid)
  }
  return sid
}

// ─── Server-side fetchers (para Server Components) ────────────────────────────

// Para recursos únicos: devuelve json.data
async function serverFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const json = await res.json()
  return json.data as T
}

// Para listas paginadas: el servidor devuelve { success, data: [], meta: {} }
// y paginated() hace spread → json ya tiene data y meta en el nivel raíz
async function serverFetchList<T>(path: string): Promise<{ data: T[]; meta: any }> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const json = await res.json()
  // El response paginado tiene la forma: { success, data: [], meta: {} }
  return { data: json.data ?? [], meta: json.meta ?? {} }
}

// ─── API helpers ──────────────────────────────────────────────────────────────
export const api = {
  products: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      return serverFetchList<any>(`/products${qs}`)
    },
    getBySlug: (slug: string) => serverFetch<any>(`/products/${slug}`),
  },
  vendors: {
    list: () => serverFetchList<any>('/vendors'),
    getBySlug: (slug: string) => serverFetch<any>(`/vendors/${slug}`),
  },
  categories: {
    list: () => serverFetch<any[]>('/categories'),
  },
}
