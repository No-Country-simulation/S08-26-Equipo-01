import {
  WORK_ORDER_PRIORITIES,
  WORK_ORDER_STATUSES,
  type WorkOrderFiltersValue,
  type WorkOrderPriority,
  type WorkOrderStatus,
} from '../types/workOrder.types'
import {
  getWorkOrderPriorityLabel,
  getWorkOrderStatusPresentation,
} from '../model/workOrderPresenter'

interface WorkOrderFiltersProps {
  value: WorkOrderFiltersValue
  onChange: (value: WorkOrderFiltersValue) => void
}

export function WorkOrderFilters({ value, onChange }: WorkOrderFiltersProps) {
  const update = <K extends keyof WorkOrderFiltersValue>(
    key: K,
    nextValue: WorkOrderFiltersValue[K],
  ) => onChange({ ...value, [key]: nextValue })

  return (
    <div className="grid gap-2.5 border-b border-slate-200 bg-slate-50/65 px-4 py-2.5 md:grid-cols-[minmax(280px,1fr)_190px_160px] sm:px-5">
      <label className="relative block">
        <span className="sr-only">Buscar órdenes de trabajo</span>
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
          placeholder="Buscar OT, expediente, solicitud, cliente o cotización…"
          className="h-9 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-[10px] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label className="block">
        <span className="sr-only">Filtrar por estado</span>
        <select
          value={value.status}
          onChange={(event) =>
            update('status', event.target.value as WorkOrderStatus | 'ALL')
          }
          className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        >
          <option value="ALL">Todos los estados</option>
          {WORK_ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getWorkOrderStatusPresentation(status).label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="sr-only">Filtrar por prioridad</span>
        <select
          value={value.priority}
          onChange={(event) =>
            update('priority', event.target.value as WorkOrderPriority | 'ALL')
          }
          className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        >
          <option value="ALL">Todas las prioridades</option>
          {WORK_ORDER_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {getWorkOrderPriorityLabel(priority)}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
