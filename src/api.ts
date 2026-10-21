import type { SessionRecord } from './types'

/**
 * Browser-only mode is the default: progress lives in localStorage and the app never
 * calls the API. Set VITE_USE_SERVER=true in .env (and run `npm run dev:full`) to turn on
 * MongoDB storage and Google sign-in.
 */
export const USE_SERVER = import.meta.env.VITE_USE_SERVER === 'true'

export interface User {
  id: string
  email: string
  name: string
  picture?: string
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'same-origin',
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
  config: () => call<{ googleClientId: string | null }>('/config'),
  me: () => call<{ user: User | null }>('/auth/me'),
  signInWithGoogle: (credential: string) => call<{ user: User }>('/auth/google', { method: 'POST', body: json({ credential }) }),
  signOut: () => call<{ ok: true }>('/auth/logout', { method: 'POST' }),

  getProgress: () => call<{ session: SessionRecord | null }>('/progress'),
  putProgress: (session: SessionRecord) => call<{ ok: true }>('/progress', { method: 'PUT', body: json({ session }) }),

  /** Anonymous study record, saved for every participant. */
  putStudy: (session: SessionRecord) =>
    call<{ ok: true }>(`/study/${encodeURIComponent(session.id)}`, { method: 'PUT', body: json({ session }) }),

  adminSessions: (key: string) => call<{ sessions: SessionRecord[] }>('/admin/sessions', { headers: { 'x-admin-key': key } }),
}
