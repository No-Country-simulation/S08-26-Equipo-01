import { useEffect } from 'react'

const dialogSelector = '[role="dialog"][aria-modal="true"]'
const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getVisibleDialogs(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(dialogSelector)).filter(
    (dialog) => dialog.getClientRects().length > 0,
  )
}

function getFocusableElements(dialog: HTMLElement): HTMLElement[] {
  return Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) =>
      element.getClientRects().length > 0 &&
      element.getAttribute('aria-hidden') !== 'true',
  )
}

export function DialogFocusManager() {
  useEffect(() => {
    let activeDialog: HTMLElement | null = null
    let returnFocusTo: HTMLElement | null = null

    const focusDialog = (dialog: HTMLElement) => {
      if (!dialog.hasAttribute('tabindex')) dialog.tabIndex = -1

      window.requestAnimationFrame(() => {
        if (!document.body.contains(dialog)) return
        if (dialog.contains(document.activeElement)) return

        const [firstFocusable] = getFocusableElements(dialog)
        ;(firstFocusable ?? dialog).focus()
      })
    }

    const syncDialog = () => {
      const dialogs = getVisibleDialogs()
      const nextDialog = dialogs.at(-1) ?? null

      if (nextDialog === activeDialog) return

      if (nextDialog) {
        if (!activeDialog && document.activeElement instanceof HTMLElement) {
          returnFocusTo = document.activeElement
        }
        activeDialog = nextDialog
        focusDialog(nextDialog)
        return
      }

      activeDialog = null
      const target = returnFocusTo
      returnFocusTo = null
      if (target && document.body.contains(target)) {
        window.requestAnimationFrame(() => target.focus())
      }
    }

    const trapTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !activeDialog) return

      const focusable = getFocusableElements(activeDialog)
      if (focusable.length === 0) {
        event.preventDefault()
        activeDialog.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || active === activeDialog)) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    const observer = new MutationObserver(syncDialog)
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('keydown', trapTabKey, true)
    syncDialog()

    return () => {
      observer.disconnect()
      document.removeEventListener('keydown', trapTabKey, true)
    }
  }, [])

  return null
}
