import { useMemo, useState } from 'react'
import { useCustomerPortalContext } from '@/modules/customer-portal'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
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
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando cotizaciones…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
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
    <PageContainer className="py-4 lg:py-3">
      <CustomerQuotationsHeader
        customerName={customer.customerName}
        total={total}
        pendingDecision={pendingDecision}
        adjustmentRequested={adjustmentRequested}
        approved={approved}
      />

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-30px_rgba(15,23,42,0.38)]">
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/70 px-4 py-3.5 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Propuestas recibidas
              </p>
              <h2 className="mt-0.5 text-[13px] font-semibold text-slate-950">
                Seguimiento de cotizaciones
              </h2>
            </div>

            <label className="relative block lg:w-[390px]">
              <span className="sr-only">Buscar cotizaciones</span>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por cotización, solicitud, proyecto o expediente…"
                className="h-9 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-[11px] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.06)] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {filters.map((item) => {
              const active = filter === item.value
              const count = filterCount(item.value)

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={
                    active
                      ? 'inline-flex shrink-0 items-center justify-center gap-1 rounded-full border border-blue-300 bg-white px-2 py-0.5 text-[8px] font-semibold text-blue-700 shadow-[0_1px_4px_rgba(37,99,235,0.14)] ring-2 ring-blue-100'
                      : 'inline-flex shrink-0 items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[8px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50'
                  }
                >
                  {item.label}
                  <span
                    className={
                      active
                        ? 'rounded-full bg-blue-50 px-1 py-0.5 text-[8px] text-blue-700 ring-1 ring-blue-100'
                        : 'rounded-full bg-slate-100 px-1 py-0.5 text-[8px] text-slate-500'
                    }
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/65 px-4 py-2.5 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <p className="text-[9px] font-semibold text-slate-700">
              {visibleQuotations.length}{' '}
              {visibleQuotations.length === 1
                ? 'cotización visible'
                : 'cotizaciones visibles'}
            </p>
          </div>

          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setFilter('ALL')
                setSearch('')
              }}
              className="text-[9px] font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>

        <div className="bg-slate-50/40 p-3.5 sm:p-4">
          {visibleQuotations.length > 0 ? (
            <div className="space-y-3">
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
