import { useQueryClient } from '@tanstack/react-query'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { clearCurrentSession } from '@/modules/auth'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { Badge, type BadgeProps } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { CustomerCompanyOnboarding } from '../components/CustomerCompanyOnboarding'
import { useCustomerContexts } from '../hooks/useCustomerContexts'
import {
  formatCustomerCompanyDate,
  getCustomerRoleLabel,
} from '../model/customerCompanyPresenter'
import type { CustomerMembershipRole } from '../types/customerPortal.types'

const roleDescriptions: Record<CustomerMembershipRole, string> = {
  ADMIN: 'Administra la empresa, sus miembros y el flujo de solicitudes.',
  REQUESTER: 'Crea solicitudes y participa en su seguimiento.',
  VIEWER: 'Consulta información y avances sin modificar el flujo.',
}

const roleTones: Record<CustomerMembershipRole, BadgeProps['tone']> = {
  ADMIN: 'info',
  REQUESTER: 'success',
  VIEWER: 'neutral',
}

function PortalEntryHeader({
  onLogout,
  disabled = false,
}: {
  onLogout: () => void
  disabled?: boolean
}) {
  return (
    <header className="shrink-0 border-b border-slate-200/80 bg-white/90 px-5 py-3 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <img
            src="/brand/qualitytrack-mark.svg"
            alt=""
            className="h-8 w-8"
          />
          <div>
            <span className="text-sm font-bold tracking-tight text-slate-950">
              Quality<span className="text-blue-600">Track</span>
            </span>
            <p className="text-[8px] text-slate-400">Portal de cliente</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="!h-7 !px-2.5 !text-[8px]"
          disabled={disabled}
          onClick={onLogout}
        >
          Cerrar sesión
        </Button>
      </div>
    </header>
  )
}

export function CustomerPortalLandingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const query = useCustomerContexts()

  const logout = () => {
    clearCurrentSession()
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  if (query.isPending) {
    return (
      <main className="min-h-screen bg-[#f6f8fc]">
        <PortalEntryHeader onLogout={logout} disabled />
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.3)]">
            <LoadingState label="Cargando tus empresas…" />
          </section>
        </div>
      </main>
    )
  }

  if (query.isError) {
    return (
      <main className="min-h-screen bg-[#f6f8fc]">
        <PortalEntryHeader onLogout={logout} />
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.3)]">
            <ErrorState
              error={query.error}
              title="No pudimos cargar tus empresas"
            />
          </section>
        </div>
      </main>
    )
  }

  const [firstCustomer] = query.data

  if (!firstCustomer) {
    return (
      <CustomerCompanyOnboarding
        onLogout={logout}
        onCreated={(customerId) =>
          navigate(`/portal/${customerId}`, { replace: true })
        }
      />
    )
  }

  if (query.data.length === 1) {
    return <Navigate to={`/portal/${firstCustomer.customerId}`} replace />
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
      <PortalEntryHeader onLogout={logout} />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-5 sm:px-8 lg:min-h-0">
        <section className="shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/75 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.32)]">
          <div className="px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 21V8l8-4 8 4v13" />
                  <path d="M8 21v-5h8v5" />
                  <path d="M8 10h.01M12 10h.01M16 10h.01M8 13h.01M12 13h.01M16 13h.01" />
                </svg>
              </div>

              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                  Contexto de trabajo
                </p>
                <h1 className="mt-0.5 text-[20px] font-bold tracking-tight text-slate-950">
                  Selecciona una empresa
                </h1>
                <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500">
                  Tu cuenta pertenece a más de una empresa. Elige con cuál
                  quieres trabajar para abrir su portal, solicitudes y seguimiento.
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-slate-200/80 pt-3">
              <span className="text-[13px] font-bold text-slate-950">
                {query.data.length}
              </span>
              <span className="text-[9px] font-medium text-slate-500">
                empresas disponibles
              </span>
            </div>
          </div>
        </section>

        <section className="mt-4 min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_44px_-36px_rgba(15,23,42,0.32)]">
          <div className="border-b border-slate-200 bg-slate-50/60 px-4 py-2.5 sm:px-5">
            <p className="text-[9px] font-semibold text-slate-700">
              Tus accesos
            </p>
            <p className="mt-0.5 text-[8px] text-slate-400">
              Cada empresa conserva sus propios miembros, permisos y operación.
            </p>
          </div>

          <div className="h-full overflow-y-auto bg-slate-50/25 p-3.5 sm:p-4">
            <div className="grid gap-3 md:grid-cols-2">
              {query.data.map((customer) => (
                <Link
                  key={customer.customerId}
                  to={`/portal/${customer.customerId}`}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_-28px_rgba(15,23,42,0.38)] transition hover:border-blue-200 hover:shadow-[0_14px_34px_-26px_rgba(37,99,235,0.3)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-[2px] bg-blue-500 opacity-0 transition group-hover:opacity-100"
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 21V8l8-4 8 4v13" />
                          <path d="M8 21v-5h8v5" />
                        </svg>
                      </span>

                      <div className="min-w-0">
                        <h2 className="truncate text-[12px] font-semibold text-slate-950">
                          {customer.customerName}
                        </h2>
                        <div className="mt-1.5">
                          <Badge
                            tone={roleTones[customer.role]}
                            className="px-2 py-0.5 text-[8px]"
                          >
                            {getCustomerRoleLabel(customer.role)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-300 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 10h8" />
                        <path d="m11 7 3 3-3 3" />
                      </svg>
                    </span>
                  </div>

                  <p className="mt-3 text-[8px] leading-4 text-slate-500">
                    {roleDescriptions[customer.role]}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-2.5">
                    <span className="text-[8px] text-slate-400">
                      Acceso desde {formatCustomerCompanyDate(customer.joinedAt)}
                    </span>
                    <span className="text-[8px] font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">
                      Abrir portal
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
