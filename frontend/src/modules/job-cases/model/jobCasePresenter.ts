import type { BadgeProps } from '@/shared/components/ui/Badge'
import type {
  CaseInformationRequestDto,
  JobCaseDetailDto,
  JobCaseDto,
  JobCaseStatus,
} from '../types/jobCase.types'

interface StatusPresentation {
  label: string
  stage: string
  description: string
  tone: BadgeProps['tone']
}

const statusPresentation: Record<JobCaseStatus, StatusPresentation> = {
  SUBMITTED: {
    label: 'Pendiente de asignación',
    stage: 'Revisión',
    description: 'La solicitud ya tiene expediente y espera responsable interno.',
    tone: 'neutral',
  },
  UNDER_REVIEW: {
    label: 'En revisión',
    stage: 'Revisión',
    description: 'El equipo está validando requisitos, documentos y definición técnica.',
    tone: 'warning',
  },
  WAITING_CUSTOMER_INFO: {
    label: 'Esperando al cliente',
    stage: 'Revisión',
    description: 'Hace falta una respuesta del cliente para continuar la revisión.',
    tone: 'warning',
  },
  READY_FOR_QUOTATION: {
    label: 'Listo para cotizar',
    stage: 'Cotización',
    description: 'La revisión interna terminó y ya puede prepararse una cotización.',
    tone: 'success',
  },
  AWAITING_WORK_ORDER: {
    label: 'Pendiente de orden',
    stage: 'Operación',
    description: 'La cotización fue aprobada y falta crear la orden de trabajo.',
    tone: 'warning',
  },
  IN_PRODUCTION: {
    label: 'En producción',
    stage: 'Producción',
    description: 'El trabajo ya se encuentra dentro del flujo operativo.',
    tone: 'info',
  },
  COMPLETED: {
    label: 'Completado',
    stage: 'Finalizado',
    description: 'El expediente completó su recorrido operativo.',
    tone: 'success',
  },
  CANCELLED: {
    label: 'Cancelado',
    stage: 'Cancelado',
    description: 'El expediente fue cancelado y ya no continúa en el flujo.',
    tone: 'danger',
  },
}

export function getJobCaseStatusPresentation(
  status: JobCaseStatus,
): StatusPresentation {
  return statusPresentation[status]
}

export function formatJobCaseDate(value: string | null): string {
  if (!value) return 'Sin definir'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export function formatJobCaseDateTime(value: string | null): string {
  if (!value) return 'Sin registrar'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatJobCaseFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`

  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`
}

export function getJobCaseClarificationSummary(
  requests: CaseInformationRequestDto[],
): string {
  if (requests.length === 0) return 'Sin aclaraciones'

  const pending = requests.filter((request) => request.open).length
  const resolved = requests.length - pending

  if (pending > 0 && resolved > 0) {
    return `${pending} pendiente${pending === 1 ? '' : 's'} · ${resolved} resuelta${resolved === 1 ? '' : 's'}`
  }

  if (pending > 0) {
    return `${pending} pendiente${pending === 1 ? '' : 's'}`
  }

  return `${resolved} resuelta${resolved === 1 ? '' : 's'}`
}

export function getJobCaseMaterialSummary(
  jobCase: JobCaseDetailDto,
): string {
  if (jobCase.materialSpecification) {
    return jobCase.materialSpecification.standardOrGrade
      ? `${jobCase.materialSpecification.materialName} · ${jobCase.materialSpecification.standardOrGrade}`
      : jobCase.materialSpecification.materialName
  }

  if (jobCase.request.materialRequirementType === 'ASSISTANCE_REQUIRED') {
    return 'Pendiente de definición técnica'
  }

  return jobCase.request.materialRequirement
    ? `Cliente · ${jobCase.request.materialRequirement}`
    : 'Definido por el cliente'
}

const timelineEventLabels: Record<string, string> = {
  REQUEST_SUBMITTED: 'Solicitud enviada',
  JOB_CASE_CREATED: 'Expediente creado',
  CUSTOMER_REQUEST_CANCELLED: 'Solicitud cancelada',
  DOCUMENT_ADDED: 'Documento agregado',
  DOCUMENT_VERSION_ADDED: 'Nueva versión de documento',
  DOCUMENT_REMOVED: 'Documento eliminado',
  JOB_CASE_STATUS_CHANGED: 'Estado del expediente actualizado',
  JOB_CASE_REVIEW_STARTED: 'Revisión iniciada',
  CUSTOMER_INFORMATION_REQUESTED: 'Aclaración solicitada al cliente',
  CUSTOMER_INFORMATION_RESPONDED: 'Cliente respondió la aclaración',
  MATERIAL_SPECIFICATION_DEFINED: 'Especificación técnica definida',
  JOB_CASE_READY_FOR_QUOTATION: 'Expediente listo para cotizar',
  JOB_CASE_COMPLETED: 'Expediente completado',
  QUOTATION_CREATED: 'Cotización creada',
  QUOTATION_SENT: 'Cotización enviada',
  QUOTATION_ADJUSTMENT_REQUESTED: 'Cliente solicitó un ajuste',
  QUOTATION_REVISION_CREATED: 'Nueva revisión de cotización',
  QUOTATION_APPROVED: 'Cotización aprobada',
  QUOTATION_REJECTED: 'Cotización rechazada',
  QUOTATION_EXPIRED: 'Cotización vencida',
  QUOTATION_CANCELLED: 'Cotización cancelada',
  WORK_ORDER_CREATED: 'Orden de trabajo creada',
  WORK_ORDER_PLANNING_UPDATED: 'Planificación de orden actualizada',
  WORK_ORDER_DOCUMENT_PINNED: 'Documento fijado en la orden',
  WORK_ORDER_CANCELLED: 'Orden de trabajo cancelada',
  ROUTING_SHEET_CREATED: 'Hoja de ruta creada',
  ROUTING_OPERATION_ADDED: 'Operación agregada a la ruta',
  ROUTING_OPERATION_UPDATED: 'Operación de ruta actualizada',
  ROUTING_OPERATION_REMOVED: 'Operación eliminada de la ruta',
  ROUTING_SHEET_APPROVED: 'Hoja de ruta aprobada',
  ROUTING_SHEET_REOPENED: 'Hoja de ruta reabierta',
  ROUTING_SHEET_RELEASED: 'Hoja de ruta liberada',
  WORK_ORDER_RELEASED: 'Orden liberada a producción',
  PRODUCTION_STARTED: 'Producción iniciada',
  OPERATION_EXECUTION_STARTED: 'Operación iniciada',
  OPERATION_EXECUTION_COMPLETED: 'Operación completada',
  OPERATION_EXECUTION_CANCELLED: 'Operación cancelada',
  WORK_ORDER_MATERIAL_RECORDED: 'Material de orden registrado',
  PRODUCTION_COMPLETED: 'Producción completada',
  QUALITY_HANDOFF: 'Orden entregada a calidad',
  WORK_ORDER_QUALITY_APPROVED: 'Calidad aprobó la orden',
  WORK_ORDER_QUALITY_REJECTED: 'Calidad rechazó la orden',
  QUALITY_INSPECTION_CREATED: 'Inspección de calidad creada',
  QUALITY_INSPECTION_STARTED: 'Inspección de calidad iniciada',
  QUALITY_MEASUREMENT_RECORDED: 'Medición de calidad registrada',
  QUALITY_MEASUREMENT_UPDATED: 'Medición de calidad actualizada',
  QUALITY_INSPECTION_APPROVED: 'Inspección de calidad aprobada',
  QUALITY_INSPECTION_REJECTED: 'Inspección de calidad rechazada',
  NON_CONFORMITY_OPENED: 'No conformidad abierta',
  NON_CONFORMITY_DETAILS_UPDATED: 'No conformidad actualizada',
  NON_CONFORMITY_REWORK_SELECTED: 'Retrabajo seleccionado',
  NON_CONFORMITY_SCRAP_RECORDED: 'Scrap registrado',
  NON_CONFORMITY_USE_AS_IS_AUTHORIZED: 'Uso tal cual autorizado',
  NON_CONFORMITY_CLOSED: 'No conformidad cerrada',
  WORK_ORDER_NC_RESOLVED: 'No conformidad de orden resuelta',
  REWORK_STARTED: 'Retrabajo iniciado',
  REWORK_COMPLETED: 'Retrabajo completado',
  REWORK_REINSPECTION_FAILED: 'Reinspección de retrabajo fallida',
  DELIVERY_CREATED: 'Entrega creada',
  DELIVERY_DISPATCHED: 'Entrega despachada',
  DELIVERY_EVIDENCE_ATTACHED: 'Evidencia de entrega adjuntada',
  DELIVERY_DELIVERED: 'Entrega completada',
  DELIVERY_CANCELLED: 'Entrega cancelada',
  WORK_ORDER_DELIVERED: 'Orden entregada',
}

export function getJobCaseTimelineEventLabel(eventType: string): string {
  return (
    timelineEventLabels[eventType] ??
    eventType
      .toLocaleLowerCase('es-MX')
      .replaceAll('_', ' ')
      .replace(/^./, (character) => character.toLocaleUpperCase('es-MX'))
  )
}

export function matchesJobCaseSearch(
  jobCase: JobCaseDto,
  search: string,
): boolean {
  const normalized = search.trim().toLocaleLowerCase('es-MX')

  if (!normalized) return true

  return [
    jobCase.caseNumber,
    jobCase.request.requestNumber,
    jobCase.request.customerName,
    jobCase.request.title,
    jobCase.request.customerReference ?? '',
    jobCase.assignedToName ?? '',
  ].some((value) => value.toLocaleLowerCase('es-MX').includes(normalized))
}
