import type { BadgeProps } from '@/shared/components/ui/Badge'
import type {
  TraceabilityActionDto,
  TraceabilityEventDto,
  WorkOrder360Dto,
} from '../types/workOrder360.types'

export interface WorkOrder360Stage {
  label: string
  value: string
  tone: BadgeProps['tone']
}

export interface WorkOrder360Snapshot {
  material: string
  lot: string
  pinnedDocument: string
  quotation: string
  productionRouting: string
  reworkRouting: string
  complete: boolean
  completedStages: number
  stages: WorkOrder360Stage[]
}

function toneForStatus(value: string): BadgeProps['tone'] {
  if (
    value === 'APPROVED' ||
    value === 'RELEASED' ||
    value === 'COMPLETED' ||
    value === 'DELIVERED' ||
    value === 'CLOSED'
  ) {
    return 'success'
  }

  if (
    value === 'REJECTED' ||
    value === 'QUALITY_HOLD' ||
    value === 'CANCELLED' ||
    value === 'FAIL' ||
    value === 'OPEN'
  ) {
    return 'danger'
  }

  if (
    value === 'IN_PROGRESS' ||
    value === 'DISPATCHED' ||
    value === 'PENDING' ||
    value === 'REWORK_IN_PROGRESS'
  ) {
    return 'warning'
  }

  return 'neutral'
}

export function getWorkOrder360Snapshot(
  data: WorkOrder360Dto,
): WorkOrder360Snapshot {
  const productionRouting = data.routingSheets.find(
    (routing) => routing.purpose === 'PRODUCTION',
  )
  const reworkRouting = [...data.routingSheets]
    .filter((routing) => routing.purpose === 'REWORK')
    .sort((left, right) => left.revision - right.revision)
    .at(-1)
  const latestInspection = [...data.qualityInspections]
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime(),
    )
    .at(-1)
  const latestDelivery = [...data.deliveries]
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime(),
    )
    .at(-1)
  const approvedQuotation =
    data.quotationRevisions.find(
      (quotation) => quotation.id === data.workOrder.agreement.quotationId,
    ) ??
    [...data.quotationRevisions]
      .sort((left, right) => left.revision - right.revision)
      .at(-1)
  const primaryMaterial = data.materials.at(0)
  const pinnedDocument =
    data.workOrder.pinnedDocuments.find((document) =>
      /PLAN|DRAW|TECH/i.test(document.documentType),
    ) ?? data.workOrder.pinnedDocuments.at(0)

  const commercialStatus =
    approvedQuotation?.status ??
    (data.workOrder.agreement.approvedAt ? 'APPROVED' : 'PENDING')
  const planningStatus = productionRouting?.status ?? 'PENDING'
  const productionStatus = data.production.productionCompleted
    ? 'COMPLETED'
    : data.production.status
  const qualityStatus = latestInspection?.status ?? 'PENDING'
  const deliveryStatus =
    data.workOrder.status === 'DELIVERED'
      ? 'DELIVERED'
      : (latestDelivery?.status ?? 'PENDING')

  const stages: WorkOrder360Stage[] = [
    {
      label: 'Comercial',
      value: commercialStatus,
      tone: toneForStatus(commercialStatus),
    },
    {
      label: 'Planeación',
      value: planningStatus,
      tone: toneForStatus(planningStatus),
    },
    {
      label: 'Producción',
      value: productionStatus,
      tone: toneForStatus(productionStatus),
    },
    {
      label: 'Calidad',
      value: qualityStatus,
      tone: toneForStatus(qualityStatus),
    },
    {
      label: 'Entrega',
      value: deliveryStatus,
      tone: toneForStatus(deliveryStatus),
    },
  ]

  const completedStages = stages.filter((stage) =>
    ['APPROVED', 'RELEASED', 'COMPLETED', 'DELIVERED'].includes(stage.value),
  ).length

  return {
    material: primaryMaterial
      ? primaryMaterial.lot.materialName
      : 'Sin consumo registrado',
    lot: primaryMaterial
      ? primaryMaterial.lot.lotNumber
      : 'Sin lote registrado',
    pinnedDocument: pinnedDocument
      ? `${pinnedDocument.documentName} · v${pinnedDocument.version}`
      : 'Sin documento fijado',
    quotation: approvedQuotation
      ? `${approvedQuotation.quotationNumber} · Rev.${approvedQuotation.revision} · ${approvedQuotation.status}`
      : `${data.workOrder.agreement.quotationNumber} · Rev.${data.workOrder.agreement.revision}`,
    productionRouting: productionRouting
      ? `Rev.${productionRouting.revision} · PRODUCTION · ${productionRouting.status}`
      : 'Sin routing de producción',
    reworkRouting: reworkRouting
      ? `Rev.${reworkRouting.revision} · REWORK · ${reworkRouting.status}`
      : 'No requerido',
    complete:
      completedStages === stages.length &&
      data.timeline.length > 0 &&
      data.documents.length > 0,
    completedStages,
    stages,
  }
}

const detailLabels: Record<string, string> = {
  quantity: 'Cantidad',
  plannedQuantity: 'Planeadas',
  deliveredQuantity: 'Entregadas',
  affectedQuantity: 'Afectadas',
  quotationNumber: 'Cotización',
  revision: 'Revisión',
  routingRevision: 'Ruta rev.',
  routingPurpose: 'Ruta',
  operationCode: 'Operación',
  operationName: 'Proceso',
  characteristic: 'Característica',
  name: 'Control',
  checkType: 'Tipo de control',
  measuredValue: 'Medición',
  result: 'Resultado',
  nonConformityNumber: 'NC',
  disposition: 'Disposición',
  deliveryMethod: 'Método',
  carrier: 'Transportista',
  trackingNumber: 'Guía',
  receivedByName: 'Recibió',
  documentName: 'Documento',
  fileName: 'Archivo',
  version: 'Versión',
  lotNumber: 'Lote',
  reason: 'Motivo',
}

function formatDetailValue(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No'
  }

  return null
}

export function getTimelineEventSummary(event: TraceabilityEventDto): string {
  const details = Object.entries(event.snapshot.details)
    .filter(([key]) => key in detailLabels)
    .map(([key, value]) => {
      const formatted = formatDetailValue(value)
      return formatted ? `${detailLabels[key]}: ${formatted}` : null
    })
    .filter((value): value is string => value !== null)
    .slice(0, 4)

  if (details.length > 0) return details.join(' · ')

  if (event.snapshot.fromStatus || event.snapshot.toStatus) {
    return `${event.snapshot.fromStatus ?? '—'} → ${event.snapshot.toStatus ?? '—'}`
  }

  return `${event.aggregateType} #${event.aggregateId}`
}

function workOrderViewHref(
  data: WorkOrder360Dto,
  view: string,
  anchor?: string,
): string {
  const suffix = anchor ? `#${anchor}` : ''
  return `/work-orders/${data.workOrder.id}?view=${view}${suffix}`
}

export function getTraceabilityActionHref(
  action: TraceabilityActionDto,
  data: WorkOrder360Dto,
): string | null {
  switch (action.type) {
    case 'VIEW_CUSTOMER_REQUEST':
      return `/job-cases/${data.workOrder.source.caseId}`
    case 'VIEW_JOB_CASE':
      return `/job-cases/${action.resourceId}`
    case 'VIEW_QUOTATION':
      return `/quotations/${action.resourceId}`
    case 'VIEW_WORK_ORDER':
      return `/work-orders/${action.resourceId}`
    case 'VIEW_ROUTING_SHEET': {
      const routing = data.routingSheets.find(
        (item) => item.id === action.resourceId,
      )
      return workOrderViewHref(
        data,
        routing?.purpose === 'REWORK' ? 'quality' : 'preparation',
        `routing-sheet-${action.resourceId}`,
      )
    }
    case 'VIEW_ROUTING_OPERATION': {
      const routing = data.routingSheets.find((item) =>
        item.operations.some((operation) => operation.id === action.resourceId),
      )
      return workOrderViewHref(
        data,
        routing?.purpose === 'REWORK' ? 'quality' : 'preparation',
        `routing-operation-${action.resourceId}`,
      )
    }
    case 'VIEW_OPERATION_EXECUTION': {
      const execution = data.production.executions.find(
        (item) => item.id === action.resourceId,
      )
      return workOrderViewHref(
        data,
        execution?.routingPurpose === 'REWORK' ? 'quality' : 'production',
        `operation-execution-${action.resourceId}`,
      )
    }
    case 'VIEW_DOCUMENT':
      return workOrderViewHref(
        data,
        'documents',
        `document-${action.resourceId}`,
      )
    case 'VIEW_DOCUMENT_VERSION': {
      const owner = data.documents.find((entry) =>
        entry.versions.some((version) => version.id === action.resourceId),
      )
      return workOrderViewHref(
        data,
        'documents',
        owner ? `document-${owner.document.id}` : undefined,
      )
    }
    case 'VIEW_MATERIAL_LOT':
      return workOrderViewHref(
        data,
        'production',
        `material-lot-${action.resourceId}`,
      )
    case 'VIEW_QUALITY_INSPECTION':
      return workOrderViewHref(
        data,
        'quality',
        `quality-inspection-${action.resourceId}`,
      )
    case 'VIEW_QUALITY_MEASUREMENT':
    case 'VIEW_QUALITY_CHECK': {
      const inspection = data.qualityInspections.find((item) =>
        item.checks.some((qualityCheck) => qualityCheck.id === action.resourceId),
      )
      return workOrderViewHref(
        data,
        'quality',
        inspection ? `quality-check-${action.resourceId}` : undefined,
      )
    }
    case 'VIEW_NON_CONFORMITY':
      return workOrderViewHref(
        data,
        'quality',
        `non-conformity-${action.resourceId}`,
      )
    case 'VIEW_DELIVERY':
      return workOrderViewHref(data, 'delivery', `delivery-${action.resourceId}`)
    default:
      return null
  }
}

export function getPrimaryTraceabilityActionHref(
  event: TraceabilityEventDto,
  data: WorkOrder360Dto,
): string | null {
  const navigableActions = event.actions
    .map((action) => ({
      action,
      href: getTraceabilityActionHref(action, data),
    }))
    .filter(
      (
        item,
      ): item is {
        action: TraceabilityActionDto
        href: string
      } => item.href !== null,
    )

  const specificAction = navigableActions.find(
    ({ action }) => action.type !== 'VIEW_WORK_ORDER',
  )

  return specificAction?.href ?? navigableActions.at(0)?.href ?? null
}
