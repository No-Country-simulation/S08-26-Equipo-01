import type { SystemRole } from '@/modules/auth'
import {
  InternalListingSearchInput,
  InternalListingSelect,
} from '@/shared/components/listing/InternalListing'
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
    <div className="grid gap-2.5 border-b border-slate-200 bg-slate-50/65 px-4 py-2.5 lg:grid-cols-[minmax(280px,1fr)_190px_190px] sm:px-5">
      <InternalListingSearchInput
        value={value.search}
        onChange={(nextValue) => update('search', nextValue)}
        placeholder="Buscar nombre, correo o rol…"
        ariaLabel="Buscar usuarios internos"
      />

      <InternalListingSelect
        value={value.role}
        onChange={(nextValue) => update('role', nextValue as SystemRole | 'ALL')}
        ariaLabel="Filtrar por rol"
      >
        <option value="ALL">Todos los roles</option>
        {internalRoles.map((role) => (
          <option key={role} value={role}>
            {getInternalRoleLabel(role)}
          </option>
        ))}
      </InternalListingSelect>

      <InternalListingSelect
        value={value.status}
        onChange={(nextValue) =>
          update('status', nextValue as InternalUserStatus | 'ALL')
        }
        ariaLabel="Filtrar por estado"
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </InternalListingSelect>
    </div>
  )
}
