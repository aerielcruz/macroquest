import type { SessionRecord } from './types'

/**
 * Browser-only mode is the default: progress lives in localStorage and the app never
 * calls the API. Set VITE_USE_SERVER=true in .env (and run `npm run dev:full`) to turn on
 * MongoDB storage and Google sign-in.
 */
export const USE_SERVER = import.meta.env.VITE_USE_SERVER === 'true'

/**
 * Where the API lives. Empty in development (Vite proxies /api to localhost:3001) and when
 * the server also serves the built app. On Render the static site points this at the API
 * service, e.g. https://macroquest-api.onrender.com (a bare host name is fine too).
 */
const RAW_API_URL = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '')
// Render's Blueprint link gives a bare service name (e.g. "macroquest-api"); turn that into its public URL.
function toUrl(v: string) {
  if (!v || /^https?:\/\//.test(v)) return v
  return `https://${v.includes('.') ? v : `${v}.onrender.com`}`
}
const API_BASE = toUrl(RAW_API_URL)

export interface User {
  id: string
  email: string
  name: string
  picture?: string
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    // The API is on another domain when deployed as a separate service.
    credentials: API_BASE ? 'include' : 'same-origin',
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

const json = (body: unknown) => JSON.stringify(body)

export const api = {
  /** Cheap request that wakes the free Render instance if it is asleep. */
  health: () => call<{ ok: true }>('/health'),
  config: () => call<{ googleClientId: string | null }>('/config'),
  me: () => call<{ user: User | null }>('/auth/me'),
  signInWithGoogle: (credential: string) => call<{ user: User }>('/auth/google', { method: 'POST', body: json({ credential }) }),
  signOut: () => call<{ ok: true }>('/auth/logout', { method: 'POST' }),

  getProgress: () => call<{ session: SessionRecord | null }>('/progress'),
  putProgress: (session: SessionRecord) => call<{ ok: true }>('/progress', { method: 'PUT', body: json({ session }) }),
  deleteProgress: () => call<{ ok: true }>('/progress', { method: 'DELETE' }),

  /** Anonymous study record, saved for every participant. */
  putStudy: (session: SessionRecord) =>
    call<{ ok: true }>(`/study/${encodeURIComponent(session.id)}`, { method: 'PUT', body: json({ session }) }),

  adminSessions: (key: string) => call<{ sessions: SessionRecord[] }>('/admin/sessions', { headers: { 'x-admin-key': key } }),
}
