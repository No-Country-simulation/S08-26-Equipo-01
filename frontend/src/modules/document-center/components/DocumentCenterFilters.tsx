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
    <div className="grid gap-2.5 border-b border-slate-200 bg-slate-50/55 px-4 py-2.5 sm:px-5 xl:grid-cols-[minmax(280px,1fr)_180px_180px_210px]">
      <label className="relative block">
        <span className="sr-only">Buscar documentos</span>
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
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar nombre, OT, cliente, lote…"
          className="h-9 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-[10px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label>
        <span className="sr-only">Tipo de documento</span>
        <select
          value={type}
          onChange={(event) => onTypeChange(event.target.value)}
          className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        >
          <option value="ALL">Todos los tipos</option>
          {documentTypes.map((documentType) => (
            <option key={documentType} value={documentType}>
              {documentType}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Contexto</span>
        <select
          value={context}
          onChange={(event) =>
            onContextChange(event.target.value as DocumentContextDto | 'ALL')
          }
          className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        >
          {contexts.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Cliente</span>
        <select
          value={customerId}
          onChange={(event) =>
            onCustomerChange(
              event.target.value === 'ALL'
                ? 'ALL'
                : Number(event.target.value),
            )
          }
          className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        >
          <option value="ALL">Todos los clientes</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
