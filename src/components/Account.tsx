import { useState } from 'react'
import type { User } from '../api'
import { GoogleButton } from './GoogleButton'
import { Button, Card } from './ui'

export interface AccountProps {
  user: User | null
  googleClientId: string | null
  syncError: boolean
  onCredential: (credential: string) => void
  onSignOut: () => void
}

/** Header chip: "Save progress" for guests, avatar and sign-out when signed in. */
export function AccountChip({ user, googleClientId, syncError, onCredential, onSignOut }: AccountProps) {
  const [open, setOpen] = useState(false)

  if (user) {
    return (
      <div className="relative">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-1" aria-label="Account">
          {user.picture ? (
            <img src={user.picture} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-full border-2 border-lime-400" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-500 font-extrabold text-white">
              {user.name[0]}
            </span>
          )}
          <span className={`text-xs font-bold ${syncError ? 'text-amber-600' : 'text-lime-600'}`}>{syncError ? 'Offline' : 'Saved'}</span>
        </button>
        {open && (
          <Card className="absolute right-0 top-11 z-30 w-64 space-y-3 p-4 text-sm shadow-lg">
            <p>
              Signed in as <b>{user.email}</b>. Your progress is saved to your account.
            </p>
            {syncError && <p className="text-amber-700">We could not reach the server, so progress is saved on this device for now.</p>}
            <Button variant="secondary" className="w-full" onClick={onSignOut}>
              Sign out
            </Button>
          </Card>
        )}
      </div>
    )
  }

  if (!googleClientId) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border-2 border-b-4 border-slate-200 bg-white px-2 py-1 text-xs font-extrabold text-sky-600"
      >
        💾 Save progress
      </button>
      {open && (
        <SignInDialog googleClientId={googleClientId} onCredential={onCredential} onClose={() => setOpen(false)} />
      )}
    </>
  )
}

export function SignInDialog({
  googleClientId,
  onCredential,
  onClose,
}: {
  googleClientId: string
  onCredential: (credential: string) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <Card className="space-y-4">
          <h2 className="text-xl font-extrabold">Save your progress</h2>
          <p className="text-slate-600">
            Your progress is already saved on this device. Sign in with Google to keep it in your account and carry on from
            any device.
          </p>
          <p className="text-sm text-slate-500">
            We store your name and email only to save your progress. Your survey answers stay anonymous and are never
            linked to your account.
          </p>
          <GoogleButton
            clientId={googleClientId}
            onCredential={(c) => {
              onCredential(c)
              onClose()
            }}
          />
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Not now
          </Button>
        </Card>
      </div>
    </div>
  )
}
