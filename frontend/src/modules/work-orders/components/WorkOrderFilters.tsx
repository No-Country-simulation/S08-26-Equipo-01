import {
  InternalListingSearchInput,
  InternalListingSelect,
} from '@/shared/components/listing/InternalListing'
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
    <div className="grid gap-2.5 border-b border-slate-200 bg-slate-50/65 px-4 py-2.5 md:grid-cols-[minmax(280px,1fr)_190px_190px] sm:px-5">
      <InternalListingSearchInput
        value={value.search}
        onChange={(nextValue) => update('search', nextValue)}
        placeholder="Buscar OT, expediente, solicitud, cliente o cotización…"
        ariaLabel="Buscar órdenes de trabajo"
      />

      <InternalListingSelect
        value={value.status}
        onChange={(nextValue) =>
          update('status', nextValue as WorkOrderStatus | 'ALL')
        }
        ariaLabel="Filtrar por estado"
      >
        <option value="ALL">Todos los estados</option>
        {WORK_ORDER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {getWorkOrderStatusPresentation(status).label}
          </option>
        ))}
      </InternalListingSelect>

      <InternalListingSelect
        value={value.priority}
        onChange={(nextValue) =>
          update('priority', nextValue as WorkOrderPriority | 'ALL')
        }
        ariaLabel="Filtrar por prioridad"
      >
        <option value="ALL">Todas las prioridades</option>
        {WORK_ORDER_PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {getWorkOrderPriorityLabel(priority)}
          </option>
        ))}
      </InternalListingSelect>
    </div>
  )
}
