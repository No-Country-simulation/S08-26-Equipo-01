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
    <div className="grid gap-2.5 border-b border-slate-200 bg-slate-50/65 px-4 py-2.5 md:grid-cols-[minmax(260px,1fr)_180px] sm:px-5">
      <label className="relative block">
        <span className="sr-only">Buscar clientes</span>
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
          value={value.search}
          onChange={(event) =>
            onChange({ ...value, search: event.target.value })
          }
          placeholder="Buscar empresa, RFC, correo o ubicación…"
          className="h-9 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-[10px] text-slate-950 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label>
        <span className="sr-only">Filtrar por estado</span>
        <select
          value={value.status}
          onChange={(event) =>
            onChange({
              ...value,
              status: event.target.value as InternalCustomerFiltersValue['status'],
            })
          }
          className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        >
          <option value="ALL">Todos los estados</option>
          <option value="ACTIVE">Activas</option>
          <option value="SUSPENDED">Suspendidas</option>
        </select>
      </label>
    </div>
  )
}
