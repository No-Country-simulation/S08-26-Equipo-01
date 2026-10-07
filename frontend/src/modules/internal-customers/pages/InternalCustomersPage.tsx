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
import { InternalCustomerFilters } from '../components/InternalCustomerFilters'
import { InternalCustomersTable } from '../components/InternalCustomersTable'
import { useInternalCustomers } from '../hooks/useInternalCustomers'
import { matchesInternalCustomerSearch } from '../model/internalCustomerPresenter'
import type { InternalCustomerFiltersValue } from '../types/internalCustomer.types'

const initialFilters: InternalCustomerFiltersValue = {
  search: '',
  status: 'ALL',
}

export function InternalCustomersPage() {
  const query = useInternalCustomers()
  const [filters, setFilters] = useState<InternalCustomerFiltersValue>(
    initialFilters,
  )

  const visibleCustomers = useMemo(() => {
    const customers = query.data ?? []

    return customers.filter(
      (customer) =>
        matchesInternalCustomerSearch(customer, filters.search) &&
        (filters.status === 'ALL' || customer.status === filters.status),
    )
  }, [filters, query.data])

  if (query.isPending) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando clientes…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={query.error}
          title="No pudimos cargar los clientes"
        />
      </PageContainer>
    )
  }

  const customers = query.data
  const active = customers.filter((customer) => customer.status === 'ACTIVE').length
  const openCases = customers.reduce(
    (total, customer) => total + customer.openCases,
    0,
  )
  const completedCases = customers.reduce(
    (total, customer) => total + customer.completedCases,
    0,
  )
  const hasFilters = filters.search.length > 0 || filters.status !== 'ALL'

  return (
    <PageContainer className="py-4 lg:py-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
        <div className="px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
              <SidebarNavIcon name="customers" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Relación comercial
              </p>
              <h1 className="mt-0.5 text-[20px] font-bold tracking-tight text-slate-950">
                Clientes
              </h1>
              <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500">
                Consulta el contexto de cada empresa y entra a sus expedientes sin
                salir del flujo interno de QualityTrack.
              </p>
            </div>
          </div>

          <div className="mt-4 grid border-t border-slate-200/80 pt-3 sm:grid-cols-4">
            <div className="py-1 sm:pr-4">
              <p className="text-[8px] font-medium text-slate-400">Empresas</p>
              <p className="mt-0.5 text-[16px] font-bold text-slate-950">
                {customers.length}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">Activas</p>
              <p className="mt-0.5 text-[16px] font-bold text-slate-950">{active}</p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">
                Expedientes abiertos
              </p>
              <p className="mt-0.5 text-[16px] font-bold text-amber-700">
                {openCases}
              </p>
            </div>
            <div className="border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:pl-4 sm:py-1">
              <p className="text-[8px] font-medium text-slate-400">Completados</p>
              <p className="mt-0.5 text-[16px] font-bold text-emerald-700">
                {completedCases}
              </p>
            </div>
          </div>
        </div>
      </section>

      <InternalListingPanel>
        <InternalListingHeader
          eyebrow="Clientes registrados"
          title="Relación con empresas"
          aside={
            <p className="text-[8px] font-medium text-slate-400">
              Consulta actividad y entra al contexto completo de cada cliente.
            </p>
          }
        />

        <InternalCustomerFilters value={filters} onChange={setFilters} />

        <InternalListingResultsBar
          count={visibleCustomers.length}
          singular="cliente visible"
          plural="clientes visibles"
          onClear={hasFilters ? () => setFilters(initialFilters) : undefined}
        />

        <InternalListingBody>
          {visibleCustomers.length > 0 ? (
            <InternalCustomersTable customers={visibleCustomers} />
          ) : (
            <Card className="p-4 shadow-none">
              <EmptyState
                title="No hay clientes que coincidan"
                description="Ajusta la búsqueda o el filtro de estado."
              />
            </Card>
          )}
        </InternalListingBody>
      </InternalListingPanel>
    </PageContainer>
  )
}
