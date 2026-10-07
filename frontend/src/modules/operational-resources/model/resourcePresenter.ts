import type {
  MachineStatus,
  ManageableMachineStatus,
} from '@/modules/machines'

const machineLabels: Record<MachineStatus, string> = {
  AVAILABLE: 'Disponible',
  IN_USE: 'En uso',
  MAINTENANCE: 'Mantenimiento',
  OUT_OF_SERVICE: 'Fuera de servicio',
}

export const manageableMachineStatuses: Array<{
  value: ManageableMachineStatus
  label: string
  description: string
}> = [
  {
    value: 'AVAILABLE',
    label: 'Disponible',
    description: 'Puede asignarse a nuevas operaciones.',
  },
  {
    value: 'MAINTENANCE',
    label: 'Mantenimiento',
    description: 'Queda fuera de asignación mientras recibe mantenimiento.',
  },
  {
    value: 'OUT_OF_SERVICE',
    label: 'Fuera de servicio',
    description: 'No debe utilizarse hasta una reactivación manual.',
  },
]

export function getMachineStatusPresentation(status: MachineStatus): {
  label: string
  tone: 'success' | 'info' | 'warning' | 'danger'
} {
  switch (status) {
    case 'AVAILABLE':
      return { label: machineLabels[status], tone: 'success' }
    case 'IN_USE':
      return { label: machineLabels[status], tone: 'info' }
    case 'MAINTENANCE':
      return { label: machineLabels[status], tone: 'warning' }
    case 'OUT_OF_SERVICE':
      return { label: machineLabels[status], tone: 'danger' }
  }
}

export function formatResourceDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
  }).format(date)
}
