import { Navigate, Outlet } from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'

export function CustomerOnlyRoute() {
  const session = useSessionStore((state) => state.session)

  if (session?.user.accountType === 'INTERNAL') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
