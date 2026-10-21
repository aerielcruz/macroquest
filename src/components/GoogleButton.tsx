import { useEffect, useRef, useState } from 'react'

// Minimal typing for Google Identity Services (https://developers.google.com/identity/gsi/web).
interface Gsi {
  accounts: {
    id: {
      initialize(opts: { client_id: string; callback: (r: { credential: string }) => void }): void
      renderButton(el: HTMLElement, opts: Record<string, unknown>): void
    }
  }
}
declare global {
  interface Window {
    google?: Gsi
  }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client'
let gsiLoading: Promise<void> | null = null

function loadGsi() {
  gsiLoading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = GSI_SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      gsiLoading = null
      reject(new Error('Could not load Google sign-in'))
    }
    document.head.appendChild(s)
  })
  return gsiLoading
}

export function GoogleButton({ clientId, onCredential }: { clientId: string; onCredential: (credential: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const callback = useRef(onCredential)
  callback.current = onCredential
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadGsi()
      .then(() => {
        if (cancelled || !ref.current || !window.google) return
        window.google.accounts.id.initialize({ client_id: clientId, callback: (r) => callback.current(r.credential) })
        window.google.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with' })
      })
      .catch((e: Error) => setError(e.message))
    return () => {
      cancelled = true
    }
  }, [clientId])

  return error ? <p className="text-sm text-rose-600">{error}</p> : <div ref={ref} className="flex min-h-11 justify-center" />
}
