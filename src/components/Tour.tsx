import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useHotkeys } from '../hotkeys'
import { hasSeenTour, markTourSeen } from '../storage'

// First-time walkthrough: dims the screen, spotlights one control at a time and
// explains it in a small black tooltip. Controls opt in with a data-tour="id"
// attribute; steps whose control is not on screen are skipped.

export interface TourStep {
  target: string
  text: string
}

const TIP_WIDTH = 300
const GAP = 12
const PAD = 6

const find = (id: string) => document.querySelector<HTMLElement>(`[data-tour="${id}"]`)

export function Tour({ name, steps }: { name: string; steps: TourStep[] }) {
  const [active, setActive] = useState<TourStep[] | null>(null)

  // Wait until the screen has rendered, then keep only steps whose control exists.
  useEffect(() => {
    if (hasSeenTour(name)) return
    const t = window.setTimeout(() => {
      const present = steps.filter((s) => find(s.target))
      if (present.length) setActive(present)
    }, 300)
    return () => window.clearTimeout(t)
  }, [name, steps])

  if (!active) return null
  return (
    <TourOverlay
      steps={active}
      onDone={() => {
        markTourSeen(name)
        setActive(null)
      }}
    />
  )
}

/** Mounted only while the tour is showing, so it pauses the screen's keyboard shortcuts just for that time. */
function TourOverlay({ steps, onDone }: { steps: TourStep[]; onDone: () => void }) {
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const step = steps[index]

  const measure = useCallback(() => {
    const el = find(step.target)
    setRect(el ? el.getBoundingClientRect() : null)
  }, [step])

  useLayoutEffect(() => {
    find(step.target)?.scrollIntoView({ block: 'center', inline: 'nearest' })
    measure()
  }, [step, measure])

  useEffect(() => {
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [step, measure])

  const finish = onDone

  function next() {
    if (index + 1 < steps.length) setIndex(index + 1)
    else finish()
  }

  useHotkeys(
    (key) => {
      if (key === 'Escape') finish()
      else if (key === 'Enter' || key === 'ArrowRight') next()
      return true
    },
    { capture: true },
  )

  if (!rect) return null

  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(TIP_WIDTH, vw - 24)
  const centerX = rect.left + rect.width / 2
  const left = Math.min(Math.max(centerX - width / 2, 12), vw - width - 12)
  const below = rect.bottom + PAD + GAP + 150 < vh || rect.top < 170
  const arrowX = Math.min(Math.max(centerX - left, 18), width - 18)
  const last = index === steps.length - 1

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-live="polite" aria-label="Quick tour">
      {/* Spotlight: a hole around the control, with everything else dimmed. */}
      <div
        className="pointer-events-none fixed rounded-2xl ring-4 ring-white/80 transition-all duration-200"
        style={{
          top: rect.top - PAD,
          left: rect.left - PAD,
          width: rect.width + PAD * 2,
          height: rect.height + PAD * 2,
          boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.6)',
        }}
      />
      <div
        className="fixed rounded-2xl bg-black p-4 text-white shadow-2xl"
        style={{
          width,
          left,
          ...(below ? { top: rect.bottom + PAD + GAP } : { bottom: vh - rect.top + PAD + GAP }),
        }}
      >
        <span
          className="absolute h-3 w-3 rotate-45 bg-black"
          style={{ left: arrowX - 6, ...(below ? { top: -6 } : { bottom: -6 }) }}
          aria-hidden
        />
        <p className="font-bold leading-snug">{step.text}</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">
            {index + 1} of {steps.length}
          </span>
          {!last && (
            <button type="button" onClick={finish} className="ml-auto text-sm font-bold text-slate-400 hover:text-white">
              Skip
            </button>
          )}
          <button
            type="button"
            onClick={next}
            autoFocus
            className={`${last ? 'ml-auto' : ''} rounded-xl bg-white px-4 py-1.5 text-sm font-extrabold text-black hover:bg-slate-200`}
          >
            {last ? 'Got it' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
