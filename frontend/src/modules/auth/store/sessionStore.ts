import { create } from 'zustand'
import { authSessionSchema, isSessionActive } from '../model/session'
import type { AuthSession } from '../types/auth.types'

const SESSION_STORAGE_KEY = 'qualitytrack.auth.session'

interface SessionState {
  session: AuthSession | null
  setSession: (session: AuthSession) => void
  clearSession: () => void
}

function removeStoredSession() {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // Storage may be unavailable in restricted browser contexts.
  }
}

function readStoredSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)

    if (!raw) return null

    const parsed = authSessionSchema.safeParse(JSON.parse(raw))

    if (!parsed.success || !isSessionActive(parsed.data)) {
      removeStoredSession()
      return null
    }

    return parsed.data
  } catch {
    removeStoredSession()
    return null
  }
}

function persistSession(session: AuthSession) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // The in-memory session still works when browser storage is unavailable.
  }
}

export const useSessionStore = create<SessionState>((set) => ({
  session: readStoredSession(),
  setSession: (session) => {
    persistSession(session)
    set({ session })
  },
  clearSession: () => {
    removeStoredSession()
    set({ session: null })
  },
}))

export function getCurrentSession(): AuthSession | null {
  return useSessionStore.getState().session
}

export function clearCurrentSession() {
  useSessionStore.getState().clearSession()
}
