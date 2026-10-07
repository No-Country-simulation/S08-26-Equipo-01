import { useEffect, useMemo, useState } from 'react'
import {
  JobCaseFilters,
  JobCaseTable,
  type JobCaseFiltersValue,
} from '@/modules/job-cases'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import {
  InternalListingBody,
  InternalListingHeader,
  InternalListingPanel,
  InternalListingResultsBar,
} from '@/shared/components/listing/InternalListing'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { useInternalCustomerJobCases } from '../hooks/useInternalCustomers'
import type { InternalCustomerJobCaseQuery } from '../types/internalCustomer.types'

interface InternalCustomerCasesPanelProps {
  customerId: number
  totalCases: number
}

const PAGE_SIZE = 5
const SEARCH_DELAY_MS = 300

const initialFilters: JobCaseFiltersValue = {
  search: '',
  status: 'ALL',
  assignment: 'ALL',
}

export function InternalCustomerCasesPanel({
  customerId,
  totalCases,
}: InternalCustomerCasesPanelProps) {
  const [filters, setFilters] = useState<JobCaseFiltersValue>(initialFilters)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(0)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(filters.search.trim())
      setPage(0)
    }, SEARCH_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [filters.search])

  const query = useMemo<InternalCustomerJobCaseQuery>(
    () => ({
      page,
      size: PAGE_SIZE,
      search: debouncedSearch,
      status: filters.status,
      assignment: filters.assignment,
    }),
    [debouncedSearch, filters.assignment, filters.status, page],
  )

  const casesQuery = useInternalCustomerJobCases(customerId, query)
  const result = casesQuery.data
  const visibleCases = result?.items ?? []
  const totalItems = result?.totalItems ?? 0
  const totalPages = result?.totalPages ?? 0
  const hasFilters =
    debouncedSearch !== '' ||
    filters.status !== 'ALL' ||
    filters.assignment !== 'ALL'

  useEffect(() => {
    if (totalPages > 0 && page >= totalPages) {
      setPage(totalPages - 1)
    }
  }, [page, totalPages])

  const changeFilters = (next: JobCaseFiltersValue) => {
    if (
      next.status !== filters.status ||
      next.assignment !== filters.assignment
    ) {
      setPage(0)
    }
    setFilters(next)
  }

  const clearFilters = () => {
    setFilters(initialFilters)
    setDebouncedSearch('')
    setPage(0)
  }

  return (
    <InternalListingPanel>
      <InternalListingHeader
        eyebrow="Flujo comercial"
        title="Expedientes de la empresa"
        aside={
          <div className="flex items-center gap-2">
            <p className="text-[8px] font-medium text-slate-400">
              Consulta solicitudes convertidas en expediente y su etapa actual.
            </p>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[8px] font-semibold text-slate-600 shadow-sm">
              {totalCases} en total
            </span>
          </div>
        }
      />

      {totalCases > 0 ? (
        <>
          <JobCaseFilters value={filters} onChange={changeFilters} />

          <InternalListingResultsBar
            count={totalItems}
            singular="expediente visible"
            plural="expedientes visibles"
            onClear={hasFilters ? clearFilters : undefined}
          />

          {casesQuery.isError ? (
            <InternalListingBody>
              <div className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[9px] font-semibold text-red-800">
                    No pudimos cargar los expedientes.
                  </p>
                  <p role="alert" className="mt-0.5 text-[8px] leading-4 text-red-700">
                    {getErrorMessage(casesQuery.error)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void casesQuery.refetch()}
                  className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-[9px] font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Reintentar
                </button>
              </div>
            </InternalListingBody>
          ) : casesQuery.isPending && !result ? (
            <InternalListingBody className="px-4 py-7 text-center sm:px-5">
              <p className="text-[9px] font-medium text-slate-500">
                Cargando expedientes…
              </p>
            </InternalListingBody>
          ) : visibleCases.length > 0 ? (
            <InternalListingBody
              className={casesQuery.isFetching ? 'opacity-60' : 'opacity-100'}
            >
              <JobCaseTable jobCases={visibleCases} />
            </InternalListingBody>
          ) : (
            <InternalListingBody>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <EmptyState
                  title="No hay expedientes que coincidan"
                  description="Ajusta la búsqueda o los filtros para consultar otros expedientes de esta empresa."
                />
              </div>
            </InternalListingBody>
          )}

          {result && totalItems > 0 ? (
            <div className="flex flex-col gap-2 border-t border-slate-200 bg-white px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-[8px] font-medium text-slate-500">
                Mostrando {page * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE + visibleCases.length, totalItems)} de{' '}
                {totalItems} expediente{totalItems === 1 ? '' : 's'}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  disabled={page === 0 || casesQuery.isFetching}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="min-w-20 text-center text-[8px] font-semibold text-slate-500">
                  Página {page + 1} de {Math.max(totalPages, 1)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages - 1, current + 1))
                  }
                  disabled={
                    totalPages === 0 || page >= totalPages - 1 || casesQuery.isFetching
                  }
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <InternalListingBody>
          <EmptyState
            title="Sin expedientes"
            description="Esta empresa todavía no tiene solicitudes convertidas en expediente."
          />
        </InternalListingBody>
      )}
    </InternalListingPanel>
  )
}
