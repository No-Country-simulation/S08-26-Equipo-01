import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { AuthResultPanel } from '../components/AuthResultPanel'
import { PublicAuthLayout } from '../components/PublicAuthLayout'
import { useVerifyEmail } from '../hooks/usePublicAuth'
import { getFragmentToken } from '../model/publicToken'

export function VerifyEmailPage() {
  const location = useLocation()
  const token = getFragmentToken(location.hash)
  const mutation = useVerifyEmail()
  const started = useRef(false)

  useEffect(() => {
    if (!token || started.current) return
    started.current = true
    mutation.mutate(token)
  }, [mutation, token])

  if (!token) {
    return (
      <PublicAuthLayout
        eyebrow="Verificación"
        title="Enlace no válido"
        description="No encontramos un token de verificación en este enlace."
        footer={
          <Link
            className="font-semibold text-blue-600 transition hover:text-blue-700"
            to="/resend-verification"
          >
            Solicitar otro enlace
          </Link>
        }
        immersive
      >
        <AuthResultPanel
          compact
          tone="error"
          title="Falta información"
          description="Abre nuevamente el enlace completo recibido por correo."
        />
      </PublicAuthLayout>
    )
  }

  if (mutation.isSuccess) {
    return (
      <PublicAuthLayout
        eyebrow="Verificación"
        title="Correo verificado"
        description="Tu cuenta ya está activa. Al iniciar sesión, QualityTrack comprobará si ya perteneces a una empresa."
        footer={
          <Link className="font-semibold text-blue-600 transition hover:text-blue-700" to="/login">
            Iniciar sesión
          </Link>
        }
        immersive
      >
        <AuthResultPanel
          compact
          tone="success"
          title="Cuenta activada"
          description="Si todavía no perteneces a una empresa, el portal te llevará a crear la primera. Si ya fuiste invitado, entrarás en ese contexto."
        />
      </PublicAuthLayout>
    )
  }

  if (mutation.isError) {
    return (
      <PublicAuthLayout
        eyebrow="Verificación"
        title="No pudimos verificar el correo"
        description="El enlace puede haber expirado, ya haberse utilizado o no ser válido."
        footer={
          <Link
            className="font-semibold text-blue-600 transition hover:text-blue-700"
            to="/resend-verification"
          >
            Solicitar otro enlace
          </Link>
        }
        immersive
      >
        <AuthResultPanel
          compact
          tone="error"
          title="Verificación no completada"
          description={getErrorMessage(mutation.error)}
        />
      </PublicAuthLayout>
    )
  }

  return (
    <PublicAuthLayout
      eyebrow="Verificación"
      title="Verificando tu correo"
      description="Estamos validando el enlace seguro recibido por correo."
      immersive
    >
      <AuthResultPanel
        compact
        title="Un momento"
        description="No cierres esta página mientras completamos la activación."
      />
    </PublicAuthLayout>
  )
}
