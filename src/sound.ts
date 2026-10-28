import { useSyncExternalStore } from 'react'

// Sound effects synthesised with the Web Audio API, so there are no audio files to
// load or license. Every sound follows a tap or click, which browsers require before
// audio can play. Phones that support it also get a short vibration. The mute
// setting covers both and is remembered in this browser.

export type Sound = 'tap' | 'correct' | 'close' | 'combo' | 'wrong' | 'complete'

const MUTE_KEY = 'macroquest.muted'

let ctx: AudioContext | null = null
let muted = readMuted()
const listeners = new Set<() => void>()

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true'
  } catch {
    return false
  }
}

function audio(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** One note with a quick attack and smooth fade, starting `at` seconds from now. */
function note(ac: AudioContext, freq: number, at: number, length: number, { type = 'sine' as OscillatorType, volume = 0.2, slideTo = 0 } = {}) {
  const t = ac.currentTime + at
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + length)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  osc.stop(t + length + 0.02)
}

// Note frequencies (Hz)
const C5 = 523.25
const E5 = 659.25
const G5 = 783.99
const A5 = 880
const C6 = 1046.5
const E6 = 1318.5

const SOUNDS: Record<Sound, (ac: AudioContext) => void> = {
  tap: (ac) => note(ac, 900, 0, 0.05, { type: 'triangle', volume: 0.08 }),
  correct: (ac) => {
    note(ac, E5, 0, 0.12, { type: 'triangle' })
    note(ac, A5, 0.09, 0.22, { type: 'triangle' })
  },
  // Same shape as correct but softer and lower: right, just not exact.
  close: (ac) => {
    note(ac, C5, 0, 0.12, { type: 'triangle', volume: 0.15 })
    note(ac, E5, 0.09, 0.22, { type: 'triangle', volume: 0.15 })
  },
  combo: (ac) => {
    note(ac, E5, 0, 0.1, { type: 'triangle' })
    note(ac, A5, 0.08, 0.1, { type: 'triangle' })
    note(ac, E6, 0.16, 0.25, { type: 'triangle', volume: 0.15 })
  },
  wrong: (ac) => {
    note(ac, 260, 0, 0.16, { type: 'square', volume: 0.06 })
    note(ac, 196, 0.13, 0.28, { type: 'square', volume: 0.06, slideTo: 170 })
  },
  complete: (ac) => {
    ;[C5, E5, G5, C6].forEach((f, i) => note(ac, f, i * 0.1, 0.18, { type: 'triangle', volume: 0.18 }))
    note(ac, C6, 0.42, 0.5, { type: 'sine', volume: 0.15 })
    note(ac, E6, 0.42, 0.5, { type: 'sine', volume: 0.1 })
  },
}

// Vibration patterns in milliseconds (buzz, pause, buzz...). Quiet sounds get none.
const BUZZ: Partial<Record<Sound, number[]>> = {
  wrong: [60, 50, 60],
  combo: [20, 40, 20],
  complete: [40, 40, 40, 40, 120],
}

export function play(sound: Sound) {
  if (muted) return
  try {
    const pattern = BUZZ[sound]
    if (pattern && 'vibrate' in navigator) navigator.vibrate(pattern)
    const ac = audio()
    if (ac) SOUNDS[sound](ac)
  } catch {
    // Sound is a nice-to-have; never let it break the lesson.
  }
}

export function setMuted(value: boolean) {
  muted = value
  try {
    localStorage.setItem(MUTE_KEY, String(value))
  } catch {
    // Not saved, but still applies for this visit.
  }
  listeners.forEach((l) => l())
}

/** Current mute setting, re-rendering when it changes. */
export function useMuted() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => muted,
  )
}
