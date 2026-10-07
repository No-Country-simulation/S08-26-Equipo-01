import {
  InternalListingSearchInput,
  InternalListingSelect,
} from '@/shared/components/listing/InternalListing'
import {
  JOB_CASE_STATUSES,
  type JobCaseFiltersValue,
  type JobCaseStatus,
} from '../types/jobCase.types'
import { getJobCaseStatusPresentation } from '../model/jobCasePresenter'

interface JobCaseFiltersProps {
  value: JobCaseFiltersValue
  onChange: (value: JobCaseFiltersValue) => void
}

export function JobCaseFilters({ value, onChange }: JobCaseFiltersProps) {
  const update = <K extends keyof JobCaseFiltersValue>(
    key: K,
    nextValue: JobCaseFiltersValue[K],
  ) => onChange({ ...value, [key]: nextValue })

  return (
    <div className="grid gap-2.5 border-b border-slate-200 bg-slate-50/65 px-4 py-2.5 md:grid-cols-[minmax(280px,1fr)_190px_190px] sm:px-5">
      <InternalListingSearchInput
        value={value.search}
        onChange={(nextValue) => update('search', nextValue)}
        placeholder="Buscar expediente, solicitud, cliente o proyecto…"
        ariaLabel="Buscar expedientes"
      />

      <InternalListingSelect
        value={value.status}
        onChange={(nextValue) =>
          update('status', nextValue as JobCaseStatus | 'ALL')
        }
        ariaLabel="Filtrar por estado"
      >
        <option value="ALL">Todos los estados</option>
        {JOB_CASE_STATUSES.map((status) => (
          <option key={status} value={status}>
            {getJobCaseStatusPresentation(status).label}
          </option>
        ))}
      </InternalListingSelect>

      <InternalListingSelect
        value={value.assignment}
        onChange={(nextValue) =>
          update(
            'assignment',
            nextValue as JobCaseFiltersValue['assignment'],
          )
        }
        ariaLabel="Filtrar por asignación"
      >
        <option value="ALL">Todas las asignaciones</option>
        <option value="UNASSIGNED">Sin asignar</option>
        <option value="ASSIGNED">Asignados</option>
      </InternalListingSelect>
    </div>
  )
}
