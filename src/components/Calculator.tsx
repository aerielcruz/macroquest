import { useState } from 'react'
import { useHotkeys } from '../hotkeys'
import { play } from '../sound'

// Simple four-function calculator in a bottom drawer. It leaves the top of the
// screen clear so the question stays readable while working something out.

/** Calculator icon: dark body, green screen and a grid of keys with a green equals key. */
export function CalculatorIcon({ className = 'h-6 w-6' }: { className?: string }) {
  const keys = [0, 1, 2].flatMap((row) => [0, 1, 2].map((col) => ({ x: 5.5 + col * 4.5, y: 10.5 + row * 3.8 })))
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="1.5" width="18" height="21" rx="3.5" fill="#334155" />
      <rect x="5.5" y="4" width="13" height="4.5" rx="1.2" fill="#bef264" />
      <rect x="12.5" y="5.5" width="4.5" height="1.5" rx="0.75" fill="#3f6212" />
      {keys.map(({ x, y }, i) =>
        i === 8 ? null : <rect key={i} x={x} y={y} width="3.5" height="2.8" rx="0.8" fill="#f1f5f9" />,
      )}
      <rect x="14.5" y="18.1" width="3.5" height="2.8" rx="0.8" fill="#84cc16" />
    </svg>
  )
}

const OPS = ['+', '−', '×', '÷'] as const
type Op = (typeof OPS)[number]
const isOp = (s: string): s is Op => (OPS as readonly string[]).includes(s)

/** Evaluates "120÷30×75" with × and ÷ before + and −. Returns null if there is nothing to work out. */
function evaluate(expr: string): number | null {
  const tokens = expr.match(/\d+\.?\d*|\.\d+|[+−×÷]/g)
  if (!tokens) return null
  if (isOp(tokens[tokens.length - 1])) tokens.pop()
  if (!tokens.length) return null
  let sum = 0
  let sign = 1
  let term = Number(tokens[0])
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i]
    const n = Number(tokens[i + 1])
    if (op === '×') term *= n
    else if (op === '÷') term /= n
    else {
      sum += sign * term
      sign = op === '+' ? 1 : -1
      term = n
    }
  }
  sum += sign * term
  return Number.isFinite(sum) ? Math.round(sum * 1e6) / 1e6 : null
}

const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 4 })

const KEY_MAP: Record<string, string> = { '*': '×', x: '×', X: '×', '/': '÷', '-': '−', Enter: '=', '=': '=', Backspace: '⌫', Delete: 'C', c: 'C', C: 'C' }

export function Calculator({ onClose }: { onClose: () => void }) {
  const [expr, setExpr] = useState('')
  const [justEvaluated, setJustEvaluated] = useState(false)
  const result = evaluate(expr)

  function press(key: string) {
    play('tap')
    if (key === 'C') {
      setExpr('')
      setJustEvaluated(false)
      return
    }
    if (key === '⌫') {
      setExpr((e) => e.slice(0, -1))
      setJustEvaluated(false)
      return
    }
    if (key === '=') {
      if (result !== null) {
        setExpr(String(result))
        setJustEvaluated(true)
      }
      return
    }
    setExpr((e) => {
      // After "=", a number starts a new sum and an operator carries the result on.
      const base = justEvaluated && !isOp(key) ? '' : e
      const last = base.slice(-1)
      if (isOp(key)) {
        if (!base) return base
        return isOp(last) ? base.slice(0, -1) + key : base + key
      }
      if (key === '.') {
        const current = base.split(/[+−×÷]/).pop() ?? ''
        if (current.includes('.')) return base
        return base + (current === '' ? '0.' : '.')
      }
      return base + key
    })
    setJustEvaluated(false)
  }

  // While open, the keyboard drives the calculator and the lesson behind it waits.
  useHotkeys(
    (key) => {
      if (key === 'Escape') {
        onClose()
        return true
      }
      const mapped = KEY_MAP[key] ?? key
      if (/^[0-9.]$/.test(mapped) || isOp(mapped) || ['=', '⌫', 'C'].includes(mapped)) {
        press(mapped)
        return true
      }
    },
    { capture: true },
  )

  // `color` replaces the default white key colours instead of competing with them.
  const keys: { k: string; cls?: string; color?: string }[] = [
    { k: 'C', cls: 'text-rose-500' },
    { k: '⌫', cls: 'text-slate-500' },
    { k: '÷', cls: 'text-sky-600' },
    { k: '×', cls: 'text-sky-600' },
    { k: '7' },
    { k: '8' },
    { k: '9' },
    { k: '−', cls: 'text-sky-600' },
    { k: '4' },
    { k: '5' },
    { k: '6' },
    { k: '+', cls: 'text-sky-600' },
    { k: '1' },
    { k: '2' },
    { k: '3' },
    { k: '=', cls: 'row-span-2', color: 'border-lime-700 bg-lime-500 text-white hover:bg-lime-400' },
    { k: '0', cls: 'col-span-2' },
    { k: '.' },
  ]

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-xl px-2" role="dialog" aria-label="Calculator">
      <div className="rounded-t-3xl border-2 border-b-0 border-slate-200 bg-white p-4 shadow-[0_-8px_30px_rgba(15,23,42,0.15)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 font-extrabold text-slate-500">
            <CalculatorIcon className="h-5 w-5" />
            Calculator
          </span>
          <button type="button" onClick={onClose} className="text-xl font-bold text-slate-400 hover:text-slate-600" aria-label="Close calculator">
            ✕
          </button>
        </div>
        <div className="mb-3 rounded-2xl bg-slate-100 px-4 py-3 text-right" aria-live="polite">
          <div className="min-h-6 break-all text-lg font-bold text-slate-500">{expr || '0'}</div>
          <div className="text-3xl font-extrabold text-slate-800">{result !== null && !justEvaluated ? `= ${fmt(result)}` : justEvaluated && result !== null ? fmt(result) : ' '}</div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {keys.map(({ k, cls = '', color = 'border-slate-200 bg-white hover:bg-slate-50' }) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              aria-label={k === '=' ? 'Equals' : undefined}
              className={`rounded-2xl border-2 border-b-4 py-3 text-xl font-extrabold transition active:translate-y-0.5 active:border-b-2 ${color} ${cls}`}
            >
              {k}
            </button>
          ))}
        </div>
        <p className="mt-2 hidden text-center text-xs font-bold text-slate-400 sm:block">You can type with your keyboard too. Esc to close.</p>
      </div>
    </div>
  )
}
