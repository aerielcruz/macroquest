import { useEffect, useRef } from 'react'

/**
 * Listens for key presses while the component is mounted. Return true from the
 * handler to mark the key as handled, which also stops a focused button from
 * clicking itself. Typing in a text box is left alone.
 *
 * With `capture`, the handler runs before every other hotkey and swallows all keys,
 * which lets a dialog pause the screen behind it.
 */
export function useHotkeys(handler: (key: string) => boolean | void, { capture = false } = {}) {
  const latest = useRef(handler)
  useEffect(() => {
    latest.current = handler
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (latest.current(e.key)) e.preventDefault()
      if (capture) e.stopImmediatePropagation()
    }
    window.addEventListener('keydown', onKey, { capture })
    return () => window.removeEventListener('keydown', onKey, { capture })
  }, [capture])
}
