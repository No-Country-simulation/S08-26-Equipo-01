import { useMemo, useState } from 'react'
import { useCustomerPortalContext } from '@/modules/customer-portal'
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
import { CustomerQuotationCard } from '../components/CustomerQuotationCard'
import { CustomerQuotationsHeader } from '../components/CustomerQuotationsHeader'
import { useCustomerQuotations } from '../hooks/useCustomerQuotations'
import type { CustomerQuotationStatus } from '../types/customerQuotation.types'

type Filter = 'ALL' | CustomerQuotationStatus

const filters: Array<{ value: Filter; label: string }> = [
  { value: 'ALL', label: 'Todas' },
  { value: 'SENT', label: 'Por decidir' },
  { value: 'ADJUSTMENT_REQUESTED', label: 'En ajuste' },
  { value: 'APPROVED', label: 'Aprobadas' },
  { value: 'REJECTED', label: 'Rechazadas' },
  { value: 'EXPIRED', label: 'Vencidas' },
  { value: 'CANCELLED', label: 'Canceladas' },
]

export function CustomerQuotationsPage() {
  const { customer } = useCustomerPortalContext()
  const query = useCustomerQuotations(customer.customerId)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('ALL')

  const visibleQuotations = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase('es-MX')

    return (query.data ?? []).filter((quotation) => {
      const matchesFilter =
        filter === 'ALL' || quotation.customerStatus === filter
      const matchesSearch =
        !normalized ||
        [
          quotation.quotationNumber,
          quotation.caseNumber,
          quotation.requestNumber,
          quotation.requestTitle,
        ].some((value) =>
          value.toLocaleLowerCase('es-MX').includes(normalized),
        )

      return matchesFilter && matchesSearch
    })
  }, [filter, query.data, search])

  if (query.isPending) {
    return (
      <PageContainer className="py-3">
        <LoadingState label="Cargando cotizaciones…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer className="py-3">
        <ErrorState
          error={query.error}
          title="No pudimos cargar tus cotizaciones"
        />
      </PageContainer>
    )
  }

  const total = query.data.length
  const pendingDecision = query.data.filter(
    (quotation) => quotation.customerStatus === 'SENT',
  ).length
  const adjustmentRequested = query.data.filter(
    (quotation) => quotation.customerStatus === 'ADJUSTMENT_REQUESTED',
  ).length
  const approved = query.data.filter(
    (quotation) => quotation.customerStatus === 'APPROVED',
  ).length

  const filterCount = (value: Filter) =>
    value === 'ALL'
      ? total
      : query.data.filter((quotation) => quotation.customerStatus === value)
          .length

  const hasFilters = filter !== 'ALL' || search.length > 0

  return (
    <PageContainer className="py-3">
      <CustomerQuotationsHeader
        customerName={customer.customerName}
        total={total}
        pendingDecision={pendingDecision}
        adjustmentRequested={adjustmentRequested}
        approved={approved}
      />

      <section className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-2.5 sm:px-5">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Propuestas recibidas
              </p>
              <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
                Seguimiento de cotizaciones
              </h2>
            </div>

            <PortalSearchField
              label="Buscar cotizaciones"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por cotización, solicitud o proyecto…"
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
          count={visibleQuotations.length}
          singular="cotización visible"
          plural="cotizaciones visibles"
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
          {visibleQuotations.length > 0 ? (
            <div className="space-y-2.5">
              {visibleQuotations.map((quotation) => (
                <CustomerQuotationCard
                  key={quotation.id}
                  customerId={customer.customerId}
                  quotation={quotation}
                />
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden p-4 shadow-none">
              <EmptyState
                title={
                  query.data.length === 0
                    ? 'Todavía no hay cotizaciones'
                    : 'No hay cotizaciones que coincidan'
                }
                description={
                  query.data.length === 0
                    ? 'Cuando Comercial envíe una propuesta para tu empresa aparecerá aquí.'
                    : 'Prueba con otro folio, solicitud, expediente o filtro.'
                }
              />
            </Card>
          )}
        </div>
      </section>
    </PageContainer>
  )
}
