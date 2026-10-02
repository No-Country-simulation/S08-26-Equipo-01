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
    <div className="grid gap-2.5 border-b border-slate-200 bg-slate-50/65 px-4 py-2.5 md:grid-cols-[minmax(280px,1fr)_190px_160px] sm:px-5">
      <label className="relative block">
        <span className="sr-only">Buscar expedientes</span>
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
          placeholder="Buscar expediente, solicitud, cliente o proyecto…"
          className="h-9 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-[10px] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label className="block">
        <span className="sr-only">Filtrar por estado</span>
        <select
          value={value.status}
          onChange={(event) =>
            update('status', event.target.value as JobCaseStatus | 'ALL')
          }
          className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        >
          <option value="ALL">Todos los estados</option>
          {JOB_CASE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getJobCaseStatusPresentation(status).label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="sr-only">Filtrar por asignación</span>
        <select
          value={value.assignment}
          onChange={(event) =>
            update(
              'assignment',
              event.target.value as JobCaseFiltersValue['assignment'],
            )
          }
          className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        >
          <option value="ALL">Todos</option>
          <option value="UNASSIGNED">Sin asignar</option>
          <option value="ASSIGNED">Asignados</option>
        </select>
      </label>
    </div>
  )
}
