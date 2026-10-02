import type { SystemRole } from '@/modules/auth'
import {
  getInternalRoleLabel,
  internalRoles,
} from '../model/internalUserPresenter'
import type {
  InternalUserFiltersValue,
  InternalUserStatus,
} from '../types/internalUser.types'

interface InternalUserFiltersProps {
  value: InternalUserFiltersValue
  onChange: (value: InternalUserFiltersValue) => void
}

const statuses: Array<{ value: InternalUserStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Todos los estados' },
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'PENDING_ACTIVATION', label: 'Invitación pendiente' },
  { value: 'SUSPENDED', label: 'Suspendidos' },
]

export function InternalUserFilters({
  value,
  onChange,
}: InternalUserFiltersProps) {
  const update = <K extends keyof InternalUserFiltersValue>(
    key: K,
    nextValue: InternalUserFiltersValue[K],
  ) => onChange({ ...value, [key]: nextValue })

  return (
    <div className="grid gap-2.5 border-b border-slate-200 bg-slate-50/55 px-4 py-2.5 lg:grid-cols-[minmax(280px,1fr)_190px_190px] sm:px-5">
      <label className="relative block">
        <span className="sr-only">Buscar usuarios internos</span>
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
          onChange={(event) => update('search', event.target.value)}
          placeholder="Buscar nombre, correo o rol…"
          className="h-9 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-[10px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label>
        <span className="sr-only">Filtrar por rol</span>
        <select
          value={value.role}
          onChange={(event) =>
            update('role', event.target.value as SystemRole | 'ALL')
          }
          className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        >
          <option value="ALL">Todos los roles</option>
          {internalRoles.map((role) => (
            <option key={role} value={role}>
              {getInternalRoleLabel(role)}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Filtrar por estado</span>
        <select
          value={value.status}
          onChange={(event) =>
            update(
              'status',
              event.target.value as InternalUserStatus | 'ALL',
            )
          }
          className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
