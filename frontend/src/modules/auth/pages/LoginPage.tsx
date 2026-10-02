import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm'
import { PublicAuthLayout } from '../components/PublicAuthLayout'

interface LoginLocationState {
  from?: {
    pathname?: string
    search?: string
  }
}

function getDestination(state: unknown): string {
  const candidate = state as LoginLocationState | null
  const pathname = candidate?.from?.pathname

  if (!pathname || !pathname.startsWith('/') || pathname.startsWith('//')) {
    return '/'
  }

  return `${pathname}${candidate?.from?.search ?? ''}`
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const destination = getDestination(location.state)

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
    >
      <LoginForm
        onAuthenticated={() => navigate(destination, { replace: true })}
      />
    </PublicAuthLayout>
  )
}
