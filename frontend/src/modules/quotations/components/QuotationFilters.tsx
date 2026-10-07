import {
  InternalListingSearchInput,
  InternalListingSelect,
} from '@/shared/components/listing/InternalListing'
import {
  QUOTATION_STATUSES,
  type QuotationFiltersValue,
  type QuotationStatus,
} from '../types/quotation.types'
import { getQuotationStatusPresentation } from '../model/quotationPresenter'

interface QuotationFiltersProps {
  value: QuotationFiltersValue
  onChange: (value: QuotationFiltersValue) => void
}

export function QuotationFilters({ value, onChange }: QuotationFiltersProps) {
  const update = <K extends keyof QuotationFiltersValue>(
    key: K,
    nextValue: QuotationFiltersValue[K],
  ) => onChange({ ...value, [key]: nextValue })

  return (
    <div className="grid gap-2.5 border-b border-slate-200 bg-slate-50/65 px-4 py-2.5 md:grid-cols-[minmax(280px,1fr)_190px] sm:px-5">
      <InternalListingSearchInput
        value={value.search}
        onChange={(nextValue) => update('search', nextValue)}
        placeholder="Buscar cotización, expediente, solicitud o cliente…"
        ariaLabel="Buscar cotizaciones"
      />

      <InternalListingSelect
        value={value.status}
        onChange={(nextValue) =>
          update(
            'status',
            nextValue as QuotationStatus | 'ACTIVE' | 'ALL',
          )
        }
        ariaLabel="Filtrar por estado"
      >
        <option value="ACTIVE">Trabajo comercial activo</option>
        <option value="ADJUSTMENT_REQUESTED">Pendientes de respuesta</option>
        <option value="ALL">Todos los estados / historial</option>
        {QUOTATION_STATUSES.filter(
          (status) => status !== 'ADJUSTMENT_REQUESTED',
        ).map((status) => (
          <option key={status} value={status}>
            {getQuotationStatusPresentation(status).label}
          </option>
        ))}
      </InternalListingSelect>
    </div>
  )
}
