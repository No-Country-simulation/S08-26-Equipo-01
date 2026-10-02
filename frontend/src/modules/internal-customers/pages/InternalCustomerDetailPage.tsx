import { useNavigate, useParams } from 'react-router-dom'
import { JobCaseTable } from '@/modules/job-cases'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { CompactBackButton } from '@/shared/components/navigation/CompactBackButton'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import { InternalCustomerMembers } from '../components/InternalCustomerMembers'
import { useInternalCustomer } from '../hooks/useInternalCustomers'
import {
  formatInternalCustomerDate,
  getInternalCustomerLocation,
  getInternalCustomerStatusPresentation,
} from '../model/internalCustomerPresenter'

function parseCustomerId(value: string | undefined): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function InternalCustomerDetailPage() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const validId = parseCustomerId(customerId)
  const query = useInternalCustomer(validId)

  if (validId === null) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={new Error('El identificador del cliente no es válido.')}
          title="Cliente no válido"
        />
      </PageContainer>
    )
  }

  if (query.isPending) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando cliente…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState error={query.error} title="No pudimos cargar el cliente" />
      </PageContainer>
    )
  }

  const { customer, members, jobCases } = query.data
  const status = getInternalCustomerStatusPresentation(customer.status)

  return (
    <PageContainer className="py-4 lg:py-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
        <div className="px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
                <SidebarNavIcon name="customers" className="h-4 w-4" />
              </span>

              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                  Cliente
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-[20px] font-bold tracking-tight text-slate-950">
                    {customer.name}
                  </h1>
                  <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
                    {status.label}
                  </Badge>
                </div>
                <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500">
                  Contexto comercial y operativo de la empresa dentro de QualityTrack.
                </p>
              </div>
            </div>

            <CompactBackButton
              label="Volver a clientes"
              onClick={() => navigate('/customers')}
            />
          </div>

          <div className="mt-4 grid border-t border-slate-200/80 pt-3 sm:grid-cols-4">
            <div className="py-1 sm:pr-4">
              <p className="text-[8px] font-medium text-slate-400">Miembros activos</p>
              <p className="mt-0.5 text-[16px] font-bold text-slate-950">
                {customer.activeMembers}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">
                Expedientes abiertos
              </p>
              <p className="mt-0.5 text-[16px] font-bold text-amber-700">
                {customer.openCases}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">Completados</p>
              <p className="mt-0.5 text-[16px] font-bold text-emerald-700">
                {customer.completedCases}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:pl-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">Cancelados</p>
              <p className="mt-0.5 text-[16px] font-bold text-slate-700">
                {customer.cancelledCases}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_minmax(340px,0.82fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.32)]">
          <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/55 px-4 py-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Información administrativa
            </p>
            <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
              Datos de empresa
            </h2>
          </div>

          <dl className="grid gap-x-6 gap-y-3 px-4 py-3.5 sm:grid-cols-2">
            <div>
              <dt className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                RFC
              </dt>
              <dd className="mt-1 text-[10px] text-slate-700">
                {customer.rfc || 'Sin registrar'}
              </dd>
            </div>
            <div>
              <dt className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                Ubicación
              </dt>
              <dd className="mt-1 text-[10px] text-slate-700">
                {getInternalCustomerLocation(customer)}
              </dd>
            </div>
            <div>
              <dt className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                Correo administrativo
              </dt>
              <dd className="mt-1 break-all text-[10px] text-slate-700">
                {customer.administrativeEmail || 'Sin registrar'}
              </dd>
            </div>
            <div>
              <dt className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                Teléfono
              </dt>
              <dd className="mt-1 text-[10px] text-slate-700">
                {customer.phone || 'Sin registrar'}
              </dd>
            </div>
            <div>
              <dt className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                Sitio web
              </dt>
              <dd className="mt-1 break-all text-[10px] text-slate-700">
                {customer.website || 'Sin registrar'}
              </dd>
            </div>
            <div>
              <dt className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                Registrada
              </dt>
              <dd className="mt-1 text-[10px] text-slate-700">
                {formatInternalCustomerDate(customer.createdAt)}
              </dd>
            </div>
          </dl>
        </section>

        <InternalCustomerMembers members={members} />
      </div>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
        <div className="flex items-center justify-between gap-4 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/55 px-4 py-3 sm:px-5">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Flujo comercial
            </p>
            <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
              Expedientes de la empresa
            </h2>
          </div>
          <span className="text-[8px] font-medium text-slate-400">
            {jobCases.length} en total
          </span>
        </div>

        {jobCases.length > 0 ? (
          <JobCaseTable jobCases={jobCases} />
        ) : (
          <div className="bg-slate-50/35 p-4">
            <EmptyState
              title="Sin expedientes"
              description="Esta empresa todavía no tiene solicitudes convertidas en expediente."
            />
          </div>
        )}
      </section>
    </PageContainer>
  )
}
