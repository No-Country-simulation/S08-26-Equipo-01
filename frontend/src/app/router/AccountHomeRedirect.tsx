import { Navigate } from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'

export function AccountHomeRedirect() {
  const session = useSessionStore((state) => state.session)

  return (
    <Navigate
      to={session?.user.accountType === 'CUSTOMER' ? '/portal' : '/'}
      replace
    />
  )
}
