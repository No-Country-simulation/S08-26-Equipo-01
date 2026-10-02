import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isSessionActive, useSessionStore } from '@/modules/auth'

export function ProtectedRoute() {
  const location = useLocation()
  const session = useSessionStore((state) => state.session)

  if (!session || !isSessionActive(session)) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
          },
        }}
      />
    )
  }

  return <Outlet />
}
