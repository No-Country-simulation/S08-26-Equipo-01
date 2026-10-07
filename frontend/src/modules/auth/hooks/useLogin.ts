import { useMutation } from '@tanstack/react-query'
import { authenticate } from '../api/auth.api'
import { useSessionStore } from '../store/sessionStore'

export function useLogin() {
  const setSession = useSessionStore((state) => state.setSession)

  return useMutation({
    mutationFn: authenticate,
    onSuccess: setSession,
  })
}
