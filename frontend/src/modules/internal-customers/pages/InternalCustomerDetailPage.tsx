import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { CompactBackButton } from '@/shared/components/navigation/CompactBackButton'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import { InternalCustomerCasesPanel } from '../components/InternalCustomerCasesPanel'
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
      <PageContainer className="py-3">
        <ErrorState
          error={new Error('El identificador del cliente no es válido.')}
          title="Cliente no válido"
        />
      </PageContainer>
    )
  }

  if (query.isPending) {
    return (
      <PageContainer className="py-3">
        <LoadingState label="Cargando cliente…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer className="py-3">
        <ErrorState error={query.error} title="No pudimos cargar el cliente" />
      </PageContainer>
    )
  }

  const { customer, members } = query.data
  const status = getInternalCustomerStatusPresentation(customer.status)
  const totalCases =
    customer.openCases + customer.completedCases + customer.cancelledCases

  return (
    <PageContainer className="py-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-34px_rgba(15,23,42,0.35)]">
        <div className="bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-3.5 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/60">
                <SidebarNavIcon name="customers" className="h-3.5 w-3.5" />
              </span>

              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-blue-600">
                  Cliente · Contexto comercial
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-[18px] font-bold tracking-tight text-slate-950">
                    {customer.name}
                  </h1>
                  <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
                    {status.label}
                  </Badge>
                </div>
                <p className="mt-0.5 max-w-2xl text-[9px] leading-4 text-slate-500">
                  Información administrativa, accesos y avance de sus expedientes en un solo lugar.
                </p>
              </div>
            </div>

            <CompactBackButton
              label="Volver a clientes"
              onClick={() => navigate('/customers')}
            />
          </div>
        </div>

        <div className="grid border-t border-slate-100 bg-slate-50/35 sm:grid-cols-4 sm:divide-x sm:divide-slate-100">
          <CustomerMetric label="Miembros activos" value={customer.activeMembers} />
          <CustomerMetric
            label="Expedientes abiertos"
            value={customer.openCases}
            valueClassName="text-amber-700"
          />
          <CustomerMetric
            label="Completados"
            value={customer.completedCases}
            valueClassName="text-emerald-700"
          />
          <CustomerMetric
            label="Cancelados"
            value={customer.cancelledCases}
            valueClassName="text-slate-600"
          />
        </div>
      </section>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_-32px_rgba(15,23,42,0.3)]">
          <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-2.5">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Información administrativa
              </p>
              <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
                Datos de empresa
              </h2>
            </div>
            <span className="text-[8px] font-medium text-slate-400">
              Perfil corporativo
            </span>
          </div>

          <dl className="grid sm:grid-cols-2">
            <CompanyFact label="RFC" value={customer.rfc || 'Sin registrar'} />
            <CompanyFact
              label="Ubicación"
              value={getInternalCustomerLocation(customer)}
              borderLeft
            />
            <CompanyFact
              label="Correo administrativo"
              value={customer.administrativeEmail || 'Sin registrar'}
              borderTop
            />
            <CompanyFact
              label="Teléfono"
              value={customer.phone || 'Sin registrar'}
              borderLeft
              borderTop
            />
            <CompanyFact
              label="Sitio web"
              value={customer.website || 'Sin registrar'}
              borderTop
            />
            <CompanyFact
              label="Registrada"
              value={formatInternalCustomerDate(customer.createdAt)}
              borderLeft
              borderTop
            />
          </dl>
        </section>

        <InternalCustomerMembers members={members} />
      </div>

      <InternalCustomerCasesPanel customerId={customer.id} totalCases={totalCases} />
    </PageContainer>
  )
}

function CustomerMetric({
  label,
  value,
  valueClassName = 'text-slate-950',
}: {
  label: string
  value: number
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-2 first:border-t-0 sm:block sm:border-t-0 sm:px-4 sm:py-2.5">
      <p className="text-[8px] font-medium text-slate-400">{label}</p>
      <p className={`text-[14px] font-bold tabular-nums sm:mt-0.5 ${valueClassName}`}>
        {value}
      </p>
    </div>
  )
}

function CompanyFact({
  label,
  value,
  borderLeft = false,
  borderTop = false,
}: {
  label: string
  value: string
  borderLeft?: boolean
  borderTop?: boolean
}) {
  return (
    <div
      className={`min-w-0 px-4 py-2.5 ${borderTop ? 'border-t border-slate-100' : ''} ${
        borderLeft ? 'sm:border-l sm:border-slate-100' : ''
      }`}
    >
      <dt className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-[9px] font-medium text-slate-700" title={value}>
        {value}
      </dd>
    </div>
  )
}
