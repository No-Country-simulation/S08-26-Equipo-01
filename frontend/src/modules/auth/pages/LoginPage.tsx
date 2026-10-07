import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm'
import { PublicAuthLayout } from '../components/PublicAuthLayout'
import type { AccountType } from '../types/auth.types'

interface LoginLocationState {
  from?: {
    pathname?: string
    search?: string
  }
}

const PUBLIC_DESTINATIONS = new Set([
  '/',
  '/login',
  '/register',
  '/resend-verification',
  '/forgot-password',
  '/verify-email',
  '/reset-password',
])

function getAccountHome(accountType: AccountType): string {
  return accountType === 'CUSTOMER' ? '/portal' : '/dashboard'
}

function getDestination(state: unknown, accountType: AccountType): string {
  const candidate = state as LoginLocationState | null
  const pathname = candidate?.from?.pathname
  const accountHome = getAccountHome(accountType)

  if (
    !pathname ||
    !pathname.startsWith('/') ||
    pathname.startsWith('//') ||
    PUBLIC_DESTINATIONS.has(pathname)
  ) {
    return accountHome
  }

  if (accountType === 'CUSTOMER') {
    if (pathname !== '/account' && !pathname.startsWith('/portal')) {
      return accountHome
    }
  } else if (pathname.startsWith('/portal')) {
    return accountHome
  }

  return `${pathname}${candidate?.from?.search ?? ''}`
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <PublicAuthLayout
      eyebrow="Acceso"
      title="Inicia sesión"
      description="Accede a tu espacio de gestión y seguimiento en QualityTrack."
      footer={
        <span>
          ¿No tienes cuenta?{' '}
          <Link
            className="font-semibold text-blue-600 transition hover:text-blue-700"
            to="/register"
          >
            Regístrate
          </Link>
        </span>
      }
      immersive
      lockViewport
    >
      <LoginForm
        onAuthenticated={(accountType) =>
          navigate(getDestination(location.state, accountType), {
            replace: true,
          })
        }
      />
    </PublicAuthLayout>
  )
}
