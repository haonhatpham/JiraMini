import { useEffect, type RefObject } from 'react'

type UseFocusTrapOptions = {
  open: boolean
  containerRef: RefObject<HTMLElement | null>
  initialFocusRef?: RefObject<HTMLElement | null>
  restoreFocus?: boolean
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute('hidden') && element.offsetParent !== null
  )
}

export function useFocusTrap({ open, containerRef, initialFocusRef, restoreFocus = true }: UseFocusTrapOptions) {
  useEffect(() => {
    if (!open) {
      return
    }

    const container = containerRef.current
    const previouslyFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null

    if (!container) {
      return
    }

    const focusTarget =
      initialFocusRef?.current ??
      container.querySelector<HTMLElement>('[data-autofocus]') ??
      getFocusableElements(container)[0] ??
      container
    const timeoutId = window.setTimeout(() => {
      focusTarget.focus()
    }, 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return
      }

      const focusableElements = getFocusableElements(container)

      if (focusableElements.length === 0) {
        event.preventDefault()
        container.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
        return
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(timeoutId)
      container.removeEventListener('keydown', handleKeyDown)

      if (restoreFocus && previouslyFocusedElement?.isConnected) {
        previouslyFocusedElement.focus()
      }
    }
  }, [containerRef, initialFocusRef, open, restoreFocus])
}
