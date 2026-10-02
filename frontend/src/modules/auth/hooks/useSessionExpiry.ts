import { useEffect } from 'react'
import { useSessionStore } from '../store/sessionStore'

export function useSessionExpiry() {
  const session = useSessionStore((state) => state.session)
  const clearSession = useSessionStore((state) => state.clearSession)

  useEffect(() => {
    if (!session) return

    const remaining = session.expiresAt - Date.now()

    if (remaining <= 0) {
      clearSession()
      return
    }

    const timeoutId = window.setTimeout(clearSession, remaining)

    return () => window.clearTimeout(timeoutId)
  }, [clearSession, session])
}
