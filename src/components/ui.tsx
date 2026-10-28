import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useHotkeys } from '../hotkeys'
import { setLargeText, useLargeText } from '../prefs'
import { XP_PER_LEVEL, levelFor } from '../scoring'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-lime-500 text-white border-lime-700 hover:bg-lime-400',
  secondary: 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50',
  danger: 'bg-rose-500 text-white border-rose-700 hover:bg-rose-400',
  ghost: 'bg-transparent text-slate-500 border-transparent hover:text-slate-700 shadow-none',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' }) {
  const sizing = size === 'sm' ? 'rounded-xl px-3 py-1.5 text-sm' : 'rounded-2xl px-5 py-3'
  return (
    <button
      {...props}
      className={`${sizing} border-b-4 font-extrabold uppercase tracking-wide transition active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0 ${VARIANTS[variant]} ${className}`}
    />
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border-2 border-slate-200 bg-white p-6 ${className}`}>{children}</div>
}

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`h-4 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}>
      <div
        className="h-full rounded-full bg-lime-500 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  )
}

export function XpBadge({ xp }: { xp: number }) {
  const level = levelFor(xp)
  const into = xp % XP_PER_LEVEL
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="whitespace-nowrap rounded-xl bg-amber-100 px-3 py-1 text-sm font-extrabold text-amber-700">⭐ {xp} XP</span>
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-sm font-extrabold text-sky-700">Lv {level}</span>
        <div className="h-2 w-12 overflow-hidden rounded-full bg-slate-200 sm:w-20">
          <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${into}%` }} />
        </div>
      </div>
    </div>
  )
}

export function Screen({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 py-6">{children}</div>
}

export function Mascot({ mood = 'happy', size = 'text-6xl' }: { mood?: 'happy' | 'think' | 'cheer'; size?: string }) {
  const face = { happy: '🥑', think: '🤔', cheer: '🎉' }[mood]
  return <div className={`${size} select-none`} aria-hidden>{face}</div>
}

export function TextSizeButton() {
  const large = useLargeText()
  const label = large ? 'Use normal text size' : 'Use larger text'
  return (
    <button
      type="button"
      onClick={() => setLargeText(!large)}
      className={`whitespace-nowrap rounded-lg px-1 font-extrabold hover:text-slate-600 ${large ? 'text-sky-600' : 'text-slate-400'}`}
      aria-label={label}
      aria-pressed={large}
      title={label}
    >
      <span className="text-sm">A</span>
      <span className="text-lg">A</span>
    </button>
  )
}

/** Yes/no question over the current screen. Esc or the highlighted button picks the safe option. */
export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  cancelLabel,
  danger = false,
  onConfirm,
  onCancel,
}: {
  title: string
  children: ReactNode
  confirmLabel: string
  cancelLabel: string
  /** Shows the confirm button in red, for actions that lose something. */
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  useHotkeys(
    (key) => {
      if (key === 'Escape') {
        onCancel()
        return true
      }
    },
    { capture: true },
  )
  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <Card className="w-full max-w-sm text-center">
        <Mascot mood="think" size="text-5xl" />
        <h2 id="confirm-title" className="mt-2 text-xl font-extrabold">
          {title}
        </h2>
        <p className="mt-1 text-slate-500">{children}</p>
        <Button className="mt-5 w-full" onClick={onCancel} autoFocus>
          {cancelLabel}
        </Button>
        <Button variant="ghost" className={`mt-2 w-full ${danger ? 'text-rose-500 hover:text-rose-600' : ''}`} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </Card>
    </div>
  )
}
