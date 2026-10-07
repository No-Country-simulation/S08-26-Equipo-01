import {
  InternalListingSearchInput,
  InternalListingSelect,
} from '@/shared/components/listing/InternalListing'
import type {
  DocumentCenterDto,
  DocumentContextDto,
} from '../types/documentCenter.types'

interface DocumentCenterFiltersProps {
  documents: DocumentCenterDto[]
  search: string
  type: string
  context: DocumentContextDto | 'ALL'
  customerId: number | 'ALL'
  onSearchChange: (value: string) => void
  onTypeChange: (value: string) => void
  onContextChange: (value: DocumentContextDto | 'ALL') => void
  onCustomerChange: (value: number | 'ALL') => void
}

const contexts: Array<{
  value: DocumentContextDto | 'ALL'
  label: string
}> = [
  { value: 'ALL', label: 'Todos los contextos' },
  { value: 'CASE', label: 'Expediente' },
  { value: 'WORK_ORDER', label: 'Orden de trabajo' },
  { value: 'MATERIAL', label: 'Material' },
  { value: 'DELIVERY', label: 'Entrega' },
]

export function DocumentCenterFilters({
  documents,
  search,
  type,
  context,
  customerId,
  onSearchChange,
  onTypeChange,
  onContextChange,
  onCustomerChange,
}: DocumentCenterFiltersProps) {
  const documentTypes = [
    ...new Set(documents.map((item) => item.documentType)),
  ].sort((left, right) => left.localeCompare(right))

  const customers = [
    ...new Map(
      documents
        .filter(
          (item) => item.customerId !== null && item.customerName !== null,
        )
        .map((item) => [
          item.customerId as number,
          { id: item.customerId as number, name: item.customerName as string },
        ]),
    ).values(),
  ].sort((left, right) => left.name.localeCompare(right.name))

  return (
    <div className="grid gap-2.5 border-b border-slate-200 bg-slate-50/65 px-4 py-2.5 sm:px-5 xl:grid-cols-[minmax(280px,1fr)_180px_180px_210px]">
      <InternalListingSearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar nombre, OT, cliente, lote…"
        ariaLabel="Buscar documentos"
      />

      <InternalListingSelect
        value={type}
        onChange={onTypeChange}
        ariaLabel="Tipo de documento"
      >
        <option value="ALL">Todos los tipos</option>
        {documentTypes.map((documentType) => (
          <option key={documentType} value={documentType}>
            {documentType}
          </option>
        ))}
      </InternalListingSelect>

      <InternalListingSelect
        value={context}
        onChange={(nextValue) =>
          onContextChange(nextValue as DocumentContextDto | 'ALL')
        }
        ariaLabel="Contexto"
      >
        {contexts.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </InternalListingSelect>

      <InternalListingSelect
        value={String(customerId)}
        onChange={(nextValue) =>
          onCustomerChange(nextValue === 'ALL' ? 'ALL' : Number(nextValue))
        }
        ariaLabel="Cliente"
      >
        <option value="ALL">Todos los clientes</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name}
          </option>
        ))}
      </InternalListingSelect>
    </div>
  )
}
