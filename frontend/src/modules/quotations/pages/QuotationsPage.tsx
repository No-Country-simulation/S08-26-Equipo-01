import { useMemo, useState } from 'react'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Card } from '@/shared/components/ui/Card'
import { QuotationFilters } from '../components/QuotationFilters'
import { QuotationTable } from '../components/QuotationTable'
import { useQuotations } from '../hooks/useQuotations'
import { matchesQuotationSearch } from '../model/quotationPresenter'
import type { QuotationFiltersValue } from '../types/quotation.types'

const initialFilters: QuotationFiltersValue = {
  search: '',
  status: 'ACTIVE',
}

export function QuotationsPage() {
  const query = useQuotations()
  const [filters, setFilters] = useState<QuotationFiltersValue>(initialFilters)

  const visibleQuotations = useMemo(() => {
    const quotations = query.data ?? []

    return quotations.filter(
      (quotation) =>
        matchesQuotationSearch(quotation, filters.search) &&
        (filters.status === 'ALL' ||
          (filters.status === 'ACTIVE'
            ? [
                'DRAFT',
                'SENT',
                'REJECTED',
                'EXPIRED',
                'CANCELLED',
              ].includes(quotation.status)
            : quotation.status === filters.status)),
    )
  }, [filters, query.data])

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
          title="No pudimos cargar las cotizaciones"
        />
      </PageContainer>
    )
  }

  const quotations = query.data
  const drafts = quotations.filter((quotation) => quotation.status === 'DRAFT').length
  const sent = quotations.filter((quotation) => quotation.status === 'SENT').length
  const approved = quotations.filter(
    (quotation) => quotation.status === 'APPROVED',
  ).length
  const hasFilters =
    filters.search.length > 0 || filters.status !== 'ACTIVE'

  return (
    <PageContainer className="py-4 lg:py-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
        <div className="px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
              <SidebarNavIcon name="quotations" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Comercial
              </p>
              <h1 className="mt-0.5 text-[20px] font-bold tracking-tight text-slate-950">
                Cotizaciones
              </h1>
              <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500">
                Controla borradores, revisiones enviadas y decisiones del cliente
                sin perder el vínculo con su expediente de origen.
              </p>
            </div>
          </div>

          <div className="mt-4 grid border-t border-slate-200/80 pt-3 sm:grid-cols-4">
            <div className="py-1 sm:pr-4">
              <p className="text-[8px] font-medium text-slate-400">Flujos</p>
              <p className="mt-0.5 text-[16px] font-bold text-slate-950">
                {quotations.length}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">Borradores</p>
              <p className="mt-0.5 text-[16px] font-bold text-slate-950">
                {drafts}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">
                Esperando cliente
              </p>
              <p className="mt-0.5 text-[16px] font-bold text-blue-700">
                {sent}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:pl-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">
                Aprobadas → Operación
              </p>
              <p className="mt-0.5 text-[16px] font-bold text-emerald-700">
                {approved}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
        <div className="flex flex-col gap-2 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/55 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Cotizaciones registradas
            </p>
            <h2 className="mt-0.5 text-[13px] font-semibold text-slate-950">
              Seguimiento comercial
            </h2>
          </div>
          <p className="text-[8px] font-medium text-slate-400">
            Encuentra primero el trabajo; el detalle técnico vive dentro de la cotización.
          </p>
        </div>

        <QuotationFilters value={filters} onChange={setFilters} />

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
              onClick={() => setFilters(initialFilters)}
              className="text-[9px] font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>

        <div className="bg-slate-50/40 p-3.5 sm:p-4">
          {visibleQuotations.length > 0 ? (
            <QuotationTable quotations={visibleQuotations} />
          ) : (
            <Card className="p-4 shadow-none">
              <EmptyState
                title="No hay trabajo comercial pendiente"
                description="Ajusta la búsqueda o consulta todos los estados para revisar el historial."
              />
            </Card>
          )}
        </div>
      </section>
    </PageContainer>
  )
}
