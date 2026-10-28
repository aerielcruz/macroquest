import { useSyncExternalStore } from 'react'

// Larger text setting, remembered in this browser. Tailwind sizes are in rem, so
// scaling the root font size scales the whole app.

const LARGE_TEXT_KEY = 'macroquest.largeText'

let largeText = read()
const listeners = new Set<() => void>()

function read() {
  try {
    return localStorage.getItem(LARGE_TEXT_KEY) === 'true'
  } catch {
    return false
  }
}

export function applyTextSize() {
  document.documentElement.style.fontSize = largeText ? '118.75%' : ''
}

export function setLargeText(value: boolean) {
  largeText = value
  try {
    localStorage.setItem(LARGE_TEXT_KEY, String(value))
  } catch {
    // Not saved, but still applies for this visit.
  }
  applyTextSize()
  listeners.forEach((l) => l())
}

export function useLargeText() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => largeText,
  )
}
