import { useMutation } from '@tanstack/react-query'
import { authenticateDemo } from '../api/auth.api'
import { useSessionStore } from '../store/sessionStore'
import type { AccountType } from '../types/auth.types'

export function useDemoLogin() {
  const setSession = useSessionStore((state) => state.setSession)

  return useMutation({
    mutationFn: (accountType: AccountType) => authenticateDemo(accountType),
    onSuccess: setSession,
  })
}
