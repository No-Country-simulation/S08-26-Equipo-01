import { useMemo, useState } from 'react'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Card } from '@/shared/components/ui/Card'
import { JobCaseFilters } from '../components/JobCaseFilters'
import { JobCaseTable } from '../components/JobCaseTable'
import { useJobCases } from '../hooks/useJobCases'
import { matchesJobCaseSearch } from '../model/jobCasePresenter'
import type { JobCaseFiltersValue } from '../types/jobCase.types'

const initialFilters: JobCaseFiltersValue = {
  search: '',
  status: 'ALL',
  assignment: 'ALL',
}

export function JobCasesPage() {
  const query = useJobCases()
  const [filters, setFilters] = useState<JobCaseFiltersValue>(initialFilters)

  const visibleJobCases = useMemo(() => {
    const jobCases = query.data ?? []

    return jobCases.filter((jobCase) => {
      const assignmentMatches =
        filters.assignment === 'ALL' ||
        (filters.assignment === 'ASSIGNED' &&
          jobCase.assignedToUserId !== null) ||
        (filters.assignment === 'UNASSIGNED' &&
          jobCase.assignedToUserId === null)

      return (
        matchesJobCaseSearch(jobCase, filters.search) &&
        (filters.status === 'ALL' || jobCase.status === filters.status) &&
        assignmentMatches
      )
    })
  }, [filters, query.data])

  if (query.isPending) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando expedientes…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={query.error}
          title="No pudimos cargar los expedientes"
        />
      </PageContainer>
    )
  }

  const jobCases = query.data
  const unassigned = jobCases.filter(
    (jobCase) => jobCase.assignedToUserId === null,
  ).length
  const waitingInfo = jobCases.filter(
    (jobCase) => jobCase.status === 'WAITING_CUSTOMER_INFO',
  ).length
  const readyForQuotation = jobCases.filter(
    (jobCase) => jobCase.status === 'READY_FOR_QUOTATION',
  ).length
  const hasFilters =
    filters.search.length > 0 ||
    filters.status !== 'ALL' ||
    filters.assignment !== 'ALL'

  return (
    <PageContainer className="py-4 lg:py-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
        <div className="px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
              <SidebarNavIcon name="cases" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Revisión interna
              </p>
              <h1 className="mt-0.5 text-[20px] font-bold tracking-tight text-slate-950">
                Expedientes
              </h1>
              <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500">
                Supervisa solicitudes en revisión, información pendiente y
                expedientes listos para iniciar su cotización.
              </p>
            </div>
          </div>

          <div className="mt-4 grid border-t border-slate-200/80 pt-3 sm:grid-cols-4">
            <div className="py-1 sm:pr-4">
              <p className="text-[8px] font-medium text-slate-400">Expedientes</p>
              <p className="mt-0.5 text-[16px] font-bold text-slate-950">
                {jobCases.length}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">Sin asignar</p>
              <p className="mt-0.5 text-[16px] font-bold text-slate-950">
                {unassigned}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">
                Esperando cliente
              </p>
              <p className="mt-0.5 text-[16px] font-bold text-amber-700">
                {waitingInfo}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:pl-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">
                Listos para cotizar
              </p>
              <p className="mt-0.5 text-[16px] font-bold text-blue-700">
                {readyForQuotation}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
        <div className="flex flex-col gap-2 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/55 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Seguimiento de solicitudes
            </p>
            <h2 className="mt-0.5 text-[13px] font-semibold text-slate-950">
              Expedientes registrados
            </h2>
          </div>
          <p className="text-[8px] font-medium text-slate-400">
            Ubica primero el trabajo y su etapa; el detalle técnico vive dentro del expediente.
          </p>
        </div>

        <JobCaseFilters value={filters} onChange={setFilters} />

        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/65 px-4 py-2.5 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <p className="text-[9px] font-semibold text-slate-700">
              {visibleJobCases.length}{' '}
              {visibleJobCases.length === 1
                ? 'expediente visible'
                : 'expedientes visibles'}
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
          {visibleJobCases.length > 0 ? (
            <JobCaseTable jobCases={visibleJobCases} />
          ) : (
            <Card className="p-4 shadow-none">
              <EmptyState
                title="No hay expedientes que coincidan"
                description="Ajusta la búsqueda o los filtros para consultar otros expedientes."
              />
            </Card>
          )}
        </div>
      </section>
    </PageContainer>
  )
}
