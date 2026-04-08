import axios from 'axios'

export const adminApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

if (typeof window !== 'undefined') {
  adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('mp_admin_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })
}
