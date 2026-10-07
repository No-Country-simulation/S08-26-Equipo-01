import { useMemo, useState } from 'react'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import {
  PortalFilterChip,
  PortalSearchField,
  PortalVisibleCountBar,
} from '@/shared/components/portal/PortalListControls'
import { Card } from '@/shared/components/ui/Card'
import { CustomerRequestCard } from '../components/CustomerRequestCard'
import { CustomerRequestsHeader } from '../components/CustomerRequestsHeader'
import { useCustomerPortalContext } from '../hooks/useCustomerPortalContext'
import { useCustomerRequests } from '../hooks/useCustomerRequests'
import type { CustomerRequestStatus } from '../types/customerRequest.types'

type Filter = 'ALL' | CustomerRequestStatus

const filters: Array<{ value: Filter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'UNDER_REVIEW', label: 'Revisión' },
  { value: 'WAITING_CUSTOMER_INFO', label: 'Por responder' },
  { value: 'READY_FOR_QUOTATION', label: 'Cotización' },
  { value: 'IN_PRODUCTION', label: 'Producción' },
  { value: 'COMPLETED', label: 'Completadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
]

export function CustomerRequestsPage() {
  const { customer } = useCustomerPortalContext()
  const query = useCustomerRequests(customer.customerId)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('ALL')
  const canCreate = customer.role !== 'VIEWER'

  const visibleRequests = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase('es-MX')

    return (query.data ?? []).filter((request) => {
      const matchesFilter =
        filter === 'ALL' || request.jobCase.status === filter
      const matchesSearch =
        !normalized ||
        [
          request.requestNumber,
          request.customerReference,
          request.title,
          request.jobCase.caseNumber,
        ].some((value) =>
          value?.toLocaleLowerCase('es-MX').includes(normalized),
        )

      return matchesFilter && matchesSearch
    })
  }, [filter, query.data, search])

  if (query.isPending) {
    return (
      <PageContainer className="py-3">
        <LoadingState label="Cargando solicitudes…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer className="py-3">
        <ErrorState
          error={query.error}
          title="No pudimos cargar tus solicitudes"
        />
      </PageContainer>
    )
  }

  const total = query.data.length
  const waitingResponse = query.data.filter(
    (request) => request.jobCase.status === 'WAITING_CUSTOMER_INFO',
  ).length
  const inProduction = query.data.filter(
    (request) => request.jobCase.status === 'IN_PRODUCTION',
  ).length

  const filterCount = (value: Filter) =>
    value === 'ALL'
      ? total
      : query.data.filter((request) => request.jobCase.status === value).length

  const hasFilters = filter !== 'ALL' || search.length > 0

  return (
    <PageContainer className="py-3">
      <CustomerRequestsHeader
        customerId={customer.customerId}
        customerName={customer.customerName}
        total={total}
        waitingResponse={waitingResponse}
        inProduction={inProduction}
        canCreate={canCreate}
      />

      <section className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-2.5 sm:px-5">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Solicitudes registradas
              </p>
              <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
                Seguimiento de trabajos
              </h2>
            </div>

            <PortalSearchField
              label="Buscar solicitudes"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por folio, referencia o proyecto…"
            />
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {filters.map((item) => (
              <PortalFilterChip
                key={item.value}
                active={filter === item.value}
                label={item.label}
                count={filterCount(item.value)}
                onClick={() => setFilter(item.value)}
              />
            ))}
          </div>
        </div>

        <PortalVisibleCountBar
          count={visibleRequests.length}
          singular="solicitud visible"
          plural="solicitudes visibles"
          action={
            hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setFilter('ALL')
                  setSearch('')
                }}
                className="text-[8px] font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Limpiar filtros
              </button>
            ) : null
          }
        />

        <div className="bg-slate-50/25 p-3 sm:p-3.5">
          {visibleRequests.length > 0 ? (
            <div className="space-y-2.5">
              {visibleRequests.map((request) => (
                <CustomerRequestCard
                  key={request.id}
                  customerId={customer.customerId}
                  request={request}
                />
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden p-4 shadow-none">
              <EmptyState
                title={
                  query.data.length === 0
                    ? 'Todavía no hay solicitudes'
                    : 'No hay solicitudes que coincidan'
                }
                description={
                  query.data.length === 0
                    ? canCreate
                      ? 'Crea una solicitud para iniciar un nuevo trabajo con el equipo.'
                      : 'Aún no hay trabajos registrados para esta empresa.'
                    : 'Prueba con otro folio, proyecto o filtro.'
                }
              />
            </Card>
          )}
        </div>
      </section>
    </PageContainer>
  )
}
