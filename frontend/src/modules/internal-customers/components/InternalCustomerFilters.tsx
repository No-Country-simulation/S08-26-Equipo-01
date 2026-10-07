import {
  InternalListingSearchInput,
  InternalListingSelect,
} from '@/shared/components/listing/InternalListing'
import type { InternalCustomerFiltersValue } from '../types/internalCustomer.types'

interface InternalCustomerFiltersProps {
  value: InternalCustomerFiltersValue
  onChange: (value: InternalCustomerFiltersValue) => void
}

export function InternalCustomerFilters({
  value,
  onChange,
}: InternalCustomerFiltersProps) {
  return (
    <div className="grid gap-2.5 border-b border-slate-200 bg-slate-50/65 px-4 py-2.5 md:grid-cols-[minmax(280px,1fr)_190px] sm:px-5">
      <InternalListingSearchInput
        value={value.search}
        onChange={(nextValue) => onChange({ ...value, search: nextValue })}
        placeholder="Buscar empresa, RFC, correo o ubicación…"
        ariaLabel="Buscar clientes"
      />

      <InternalListingSelect
        value={value.status}
        onChange={(nextValue) =>
          onChange({
            ...value,
            status: nextValue as InternalCustomerFiltersValue['status'],
          })
        }
        ariaLabel="Filtrar por estado"
      >
        <option value="ALL">Todos los estados</option>
        <option value="ACTIVE">Activas</option>
        <option value="SUSPENDED">Suspendidas</option>
      </InternalListingSelect>
    </div>
  )
}
