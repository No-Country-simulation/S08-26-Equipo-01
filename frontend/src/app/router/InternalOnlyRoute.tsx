import { Navigate, Outlet } from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'

export function InternalOnlyRoute() {
  const session = useSessionStore((state) => state.session)

  if (session?.user.accountType === 'CUSTOMER') {
    return <Navigate to="/portal" replace />
  }

  return <Outlet />
}
