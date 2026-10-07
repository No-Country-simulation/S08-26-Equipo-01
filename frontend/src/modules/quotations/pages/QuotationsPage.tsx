import { useMemo, useState } from 'react'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import {
  InternalListingBody,
  InternalListingHeader,
  InternalListingPanel,
  InternalListingResultsBar,
} from '@/shared/components/listing/InternalListing'
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
                'ADJUSTMENT_REQUESTED',
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
  const adjustments = quotations.filter(
    (quotation) => quotation.status === 'ADJUSTMENT_REQUESTED',
  ).length
  const sent = quotations.filter((quotation) => quotation.status === 'SENT').length
  const approved = quotations.filter(
    (quotation) => quotation.status === 'APPROVED',
  ).length
  const hasFilters = filters.search.length > 0 || filters.status !== 'ACTIVE'

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
                Controla borradores, ajustes solicitados, revisiones enviadas y decisiones del cliente
                sin perder el vínculo con su expediente de origen.
              </p>
            </div>
          </div>

          <div className="mt-4 grid border-t border-slate-200/80 pt-3 sm:grid-cols-5">
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
              <p className="text-[8px] font-medium text-slate-400">Ajustes por responder</p>
              <p className="mt-0.5 text-[16px] font-bold text-amber-700">
                {adjustments}
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

      <InternalListingPanel>
        <InternalListingHeader
          eyebrow="Cotizaciones registradas"
          title="Seguimiento comercial"
          aside={
            <p className="text-[8px] font-medium text-slate-400">
              Encuentra primero el trabajo; el detalle técnico vive dentro de la cotización.
            </p>
          }
        />

        <QuotationFilters value={filters} onChange={setFilters} />

        <InternalListingResultsBar
          count={visibleQuotations.length}
          singular="cotización visible"
          plural="cotizaciones visibles"
          onClear={hasFilters ? () => setFilters(initialFilters) : undefined}
        />

        <InternalListingBody>
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
        </InternalListingBody>
      </InternalListingPanel>
    </PageContainer>
  )
}
