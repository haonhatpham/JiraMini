import { useEffect, useRef } from 'react'

type KeyboardShortcutOptions = {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  ctrlOrMetaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  enabled?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
  ignoreEditable?: boolean
  onKeyDown: (event: KeyboardEvent) => void
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()

  return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select'
}

function normalizeKey(key: string): string {
  return key.toLowerCase()
}

export function useKeyboardShortcut({
  key,
  ctrlKey = false,
  metaKey = false,
  ctrlOrMetaKey = false,
  shiftKey = false,
  altKey = false,
  enabled = true,
  preventDefault = true,
  stopPropagation = false,
  ignoreEditable = true,
  onKeyDown
}: KeyboardShortcutOptions) {
  const onKeyDownRef = useRef(onKeyDown)

  useEffect(() => {
    onKeyDownRef.current = onKeyDown
  }, [onKeyDown])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const expectedKey = normalizeKey(key)

    const handleKeyDown = (event: KeyboardEvent) => {
      const modifierMatches = ctrlOrMetaKey
        ? event.ctrlKey || event.metaKey
        : event.ctrlKey === ctrlKey && event.metaKey === metaKey

      if (
        normalizeKey(event.key) !== expectedKey ||
        !modifierMatches ||
        event.shiftKey !== shiftKey ||
        event.altKey !== altKey
      ) {
        return
      }

      if (ignoreEditable && isEditableTarget(event.target)) {
        return
      }

      if (preventDefault) {
        event.preventDefault()
      }

      if (stopPropagation) {
        event.stopPropagation()
      }

      onKeyDownRef.current(event)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [altKey, ctrlKey, ctrlOrMetaKey, enabled, ignoreEditable, key, metaKey, preventDefault, shiftKey, stopPropagation])
}
