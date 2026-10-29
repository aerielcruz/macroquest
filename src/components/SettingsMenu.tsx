import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useHotkeys } from '../hotkeys'
import { setLargeText, useLargeText } from '../prefs'
import { play, setMuted, useMuted } from '../sound'
import { ConfirmDialog } from './ui'

interface Props {
  /** Shown in the "Start over?" warning so people know what they would lose. */
  progressSummary: string
  onAbout: () => void
  onShowTour: () => void
  onStartOver: () => void
}

/** Gear button in the top right of the lesson map, opening a small settings menu. */
export function SettingsMenu({ progressSummary, onAbout, onShowTour, onStartOver }: Props) {
  const [open, setOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  // Close when tapping anywhere outside the gear button and its menu.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div className="relative" ref={root}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl transition hover:bg-slate-200 ${open ? 'bg-slate-200' : ''}`}
        aria-label="Settings"
        aria-expanded={open}
        aria-haspopup="menu"
        title="Settings"
        data-tour="settings"
      >
        ⚙️
      </button>

      {open && (
        <Menu
          onClose={() => setOpen(false)}
          onAbout={() => {
            setOpen(false)
            onAbout()
          }}
          onShowTour={() => {
            setOpen(false)
            onShowTour()
          }}
          onStartOver={() => {
            setOpen(false)
            setConfirmReset(true)
          }}
        />
      )}

      {/* Rendered on <body>: the header's blurred background would otherwise trap a full-screen overlay inside it. */}
      {confirmReset &&
        createPortal(
        <ConfirmDialog
          title="Start over?"
          confirmLabel="Yes, start over"
          cancelLabel="Keep my progress"
          danger
          onConfirm={() => {
            setConfirmReset(false)
            onStartOver()
          }}
          onCancel={() => setConfirmReset(false)}
        >
          You will go back to the welcome screen and begin again with a new participant code. Your progress so far ({progressSummary}) will be
          lost.
        </ConfirmDialog>,
          document.body,
        )}
    </div>
  )
}

function Menu({
  onClose,
  onAbout,
  onShowTour,
  onStartOver,
}: {
  onClose: () => void
  onAbout: () => void
  onShowTour: () => void
  onStartOver: () => void
}) {
  const large = useLargeText()
  const muted = useMuted()

  useHotkeys(
    (key) => {
      if (key === 'Escape') {
        onClose()
        return true
      }
    },
    { capture: true },
  )

  return (
    <>
      <div role="menu" className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-xl">
        <div className="px-4 pt-3 pb-1 text-xs font-extrabold uppercase tracking-wide text-slate-400">Settings</div>
        <ToggleRow label="Larger text" emoji="🔠" on={large} onChange={setLargeText} />
        <ToggleRow
          label="Sound & vibration"
          emoji="🔊"
          on={!muted}
          onChange={(on) => {
            setMuted(!on)
            if (on) play('tap')
          }}
        />
        <MenuItem emoji="ℹ️" label="About this study" onClick={onAbout} />
        <MenuItem emoji="🧭" label="Show the quick tour again" onClick={onShowTour} />
        <div className="border-t-2 border-slate-100" />
        <MenuItem emoji="↺" label="Start over" onClick={onStartOver} danger />
      </div>
    </>
  )
}

function MenuItem({ emoji, label, onClick, danger = false }: { emoji: string; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left font-bold hover:bg-slate-50 ${danger ? 'text-rose-600' : 'text-slate-700'}`}
    >
      <span className="w-6 text-center text-lg" aria-hidden>
        {emoji}
      </span>
      {label}
    </button>
  )
}

function ToggleRow({ label, emoji, on, onChange }: { label: string; emoji: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex w-full items-center gap-3 px-4 py-3 text-left font-bold text-slate-700 hover:bg-slate-50"
    >
      <span className="w-6 text-center text-lg" aria-hidden>
        {emoji}
      </span>
      <span className="flex-1">{label}</span>
      <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition ${on ? 'bg-lime-500' : 'bg-slate-300'}`} aria-hidden>
        <span className={`h-5 w-5 rounded-full bg-white shadow transition ${on ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  )
}
