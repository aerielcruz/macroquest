import { useSyncExternalStore } from 'react'

// On/off settings remembered in this browser.

function booleanPref(key: string, onChange?: (value: boolean) => void) {
  let value = false
  try {
    value = localStorage.getItem(key) === 'true'
  } catch {
    // Storage blocked: start with the setting off.
  }
  const listeners = new Set<() => void>()
  const subscribe = (l: () => void) => {
    listeners.add(l)
    return () => listeners.delete(l)
  }
  return {
    get: () => value,
    set(next: boolean) {
      value = next
      try {
        localStorage.setItem(key, String(next))
      } catch {
        // Not saved, but still applies for this visit.
      }
      onChange?.(next)
      listeners.forEach((l) => l())
    },
    use: () => useSyncExternalStore(subscribe, () => value, () => value),
  }
}

// Larger text. Tailwind sizes are in rem, so scaling the root font size scales the whole app.
const largeText = booleanPref('macroquest.largeText', (on) => {
  document.documentElement.style.fontSize = on ? '118.75%' : ''
})

export const applyTextSize = () => largeText.set(largeText.get())
export const setLargeText = largeText.set
export const useLargeText = largeText.use

// Researcher preview: every lesson unlocked on this device, and any session used
// while it is on is marked as preview so it stays out of the study data.
// Switched on from the #admin page after the admin key is accepted.
const previewMode = booleanPref('macroquest.previewMode')

export const isPreviewMode = previewMode.get
export const setPreviewMode = previewMode.set
export const usePreviewMode = previewMode.use
