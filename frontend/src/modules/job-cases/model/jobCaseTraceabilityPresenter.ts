import type {
  JobCaseTimelineEventDto,
  JobCaseTraceabilityActionDto,
} from '../types/jobCase.types'

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function metadataString(
  event: JobCaseTimelineEventDto,
  key: string,
): string | null {
  const value = event.metadata[key]
  return typeof value === 'string' && value.trim() ? value : null
}


function sameCaseEventHref(
  event: JobCaseTimelineEventDto,
  caseId: number,
): string {
  const informationRequestId = asNumber(event.metadata.informationRequestId)

  if (
    event.eventType === 'CUSTOMER_INFORMATION_REQUESTED' ||
    event.eventType === 'CUSTOMER_INFORMATION_RESPONDED'
  ) {
    return informationRequestId === null
      ? `/job-cases/${caseId}#clarifications`
      : `/job-cases/${caseId}#clarification-${informationRequestId}`
  }

  if (event.eventType === 'MATERIAL_SPECIFICATION_DEFINED') {
    return `/job-cases/${caseId}#material-specification`
  }

  if (
    event.eventType === 'REQUEST_SUBMITTED' ||
    event.eventType === 'JOB_CASE_CREATED'
  ) {
    return `/job-cases/${caseId}#request-source`
  }

  return `/job-cases/${caseId}#case-overview`
}

export function getJobCaseTraceabilityActionLabel(
  action: JobCaseTraceabilityActionDto,
  event: JobCaseTimelineEventDto,
  caseId: number,
): string {
  if (action.type !== 'VIEW_JOB_CASE' || action.resourceId !== caseId) {
    return action.label
  }

  if (
    event.eventType === 'CUSTOMER_INFORMATION_REQUESTED' ||
    event.eventType === 'CUSTOMER_INFORMATION_RESPONDED'
  ) {
    return 'Ver aclaración'
  }

  if (event.eventType === 'MATERIAL_SPECIFICATION_DEFINED') {
    return 'Ver material'
  }

  if (
    event.eventType === 'REQUEST_SUBMITTED' ||
    event.eventType === 'JOB_CASE_CREATED'
  ) {
    return 'Ver solicitud'
  }

  return 'Ver expediente'
}

function workOrderIdFor(
  event: JobCaseTimelineEventDto,
  fallbackWorkOrderId: number | null,
): number | null {
  const action = event.actions?.find(
    (item) => item.type === 'VIEW_WORK_ORDER',
  )

  return (
    action?.resourceId ??
    asNumber(event.metadata.workOrderId) ??
    fallbackWorkOrderId
  )
}

function documentIdFor(event: JobCaseTimelineEventDto): number | null {
  const action = event.actions?.find((item) => item.type === 'VIEW_DOCUMENT')
  return action?.resourceId ?? asNumber(event.metadata.documentId)
}

function workOrderHref(
  event: JobCaseTimelineEventDto,
  fallbackWorkOrderId: number | null,
  view: 'preparation' | 'production' | 'quality' | 'delivery' | 'documents',
  anchor?: string,
): string | null {
  const workOrderId = workOrderIdFor(event, fallbackWorkOrderId)
  if (workOrderId === null) return null

  return `/work-orders/${workOrderId}?view=${view}${
    anchor ? `#${anchor}` : ''
  }`
}

export function getJobCaseTraceabilityActionHref(
  action: JobCaseTraceabilityActionDto,
  event: JobCaseTimelineEventDto,
  caseId: number,
  fallbackWorkOrderId: number | null = null,
): string | null {
  const routingPurpose = metadataString(event, 'routingPurpose')
  const rework = routingPurpose === 'REWORK'

  switch (action.type) {
    case 'VIEW_CUSTOMER_REQUEST':
      return `/job-cases/${caseId}#request-source`
    case 'VIEW_JOB_CASE':
      return action.resourceId === caseId
        ? sameCaseEventHref(event, caseId)
        : `/job-cases/${action.resourceId}`
    case 'VIEW_QUOTATION':
      return `/quotations/${action.resourceId}`
    case 'VIEW_WORK_ORDER':
      return `/work-orders/${action.resourceId}`
    case 'VIEW_ROUTING_SHEET':
      return workOrderHref(
        event,
        fallbackWorkOrderId,
        rework ? 'quality' : 'preparation',
        `routing-sheet-${action.resourceId}`,
      )
    case 'VIEW_ROUTING_OPERATION':
      return workOrderHref(
        event,
        fallbackWorkOrderId,
        rework ? 'quality' : 'preparation',
        `routing-operation-${action.resourceId}`,
      )
    case 'VIEW_OPERATION_EXECUTION':
      return workOrderHref(
        event,
        fallbackWorkOrderId,
        rework ? 'quality' : 'production',
        `operation-execution-${action.resourceId}`,
      )
    case 'VIEW_DOCUMENT': {
      const workOrderId = workOrderIdFor(event, fallbackWorkOrderId)
      return workOrderId === null
        ? `/job-cases/${caseId}#document-${action.resourceId}`
        : workOrderHref(
            event,
            fallbackWorkOrderId,
            'documents',
            `document-${action.resourceId}`,
          )
    }
    case 'VIEW_DOCUMENT_VERSION': {
      const documentId = documentIdFor(event)
      const workOrderId = workOrderIdFor(event, fallbackWorkOrderId)

      if (documentId !== null) {
        return workOrderId === null
          ? `/job-cases/${caseId}#document-${documentId}`
          : workOrderHref(
              event,
              fallbackWorkOrderId,
              'documents',
              `document-${documentId}`,
            )
      }

      return workOrderId === null
        ? null
        : workOrderHref(event, fallbackWorkOrderId, 'documents')
    }
    case 'VIEW_MATERIAL_LOT':
      return workOrderHref(
        event,
        fallbackWorkOrderId,
        'production',
        `material-lot-${action.resourceId}`,
      )
    case 'VIEW_QUALITY_INSPECTION':
      return workOrderHref(
        event,
        fallbackWorkOrderId,
        'quality',
        `quality-inspection-${action.resourceId}`,
      )
    case 'VIEW_QUALITY_MEASUREMENT':
    case 'VIEW_QUALITY_CHECK':
      return workOrderHref(
        event,
        fallbackWorkOrderId,
        'quality',
        `quality-check-${action.resourceId}`,
      )
    case 'VIEW_NON_CONFORMITY':
      return workOrderHref(
        event,
        fallbackWorkOrderId,
        'quality',
        `non-conformity-${action.resourceId}`,
      )
    case 'VIEW_DELIVERY':
      return workOrderHref(
        event,
        fallbackWorkOrderId,
        'delivery',
        `delivery-${action.resourceId}`,
      )
    default:
      return null
  }
}

export interface JobCaseTraceabilityFallbackAction {
  label: string
  href: string
}

export function getFallbackJobCaseTraceabilityAction(
  event: JobCaseTimelineEventDto,
  caseId: number,
  fallbackWorkOrderId: number | null = null,
): JobCaseTraceabilityFallbackAction | null {
  switch (event.aggregateType) {
    case 'CUSTOMER_REQUEST':
      return {
        label: 'Ver solicitud',
        href: `/job-cases/${caseId}#request-source`,
      }
    case 'JOB_CASE':
      return {
        label: getJobCaseTraceabilityActionLabel(
          {
            type: 'VIEW_JOB_CASE',
            label: 'Ver expediente',
            resourceType: 'JOB_CASE',
            resourceId: caseId,
          },
          event,
          caseId,
        ),
        href: sameCaseEventHref(event, caseId),
      }
    case 'QUOTATION':
      return {
        label: 'Ver cotización',
        href: `/quotations/${event.aggregateId}`,
      }
    case 'WORK_ORDER':
      return {
        label: 'Ver orden de trabajo',
        href: `/work-orders/${event.aggregateId}`,
      }
    case 'ROUTING_SHEET': {
      const href = workOrderHref(
        event,
        fallbackWorkOrderId,
        metadataString(event, 'routingPurpose') === 'REWORK'
          ? 'quality'
          : 'preparation',
        `routing-sheet-${event.aggregateId}`,
      )
      return href ? { label: 'Ver hoja de ruta', href } : null
    }
    case 'OPERATION_EXECUTION': {
      const href = workOrderHref(
        event,
        fallbackWorkOrderId,
        metadataString(event, 'routingPurpose') === 'REWORK'
          ? 'quality'
          : 'production',
        `operation-execution-${event.aggregateId}`,
      )
      return href ? { label: 'Ver ejecución', href } : null
    }
    case 'DOCUMENT':
      return {
        label: 'Ver documento',
        href: `/job-cases/${caseId}#document-${event.aggregateId}`,
      }
    case 'DOCUMENT_VERSION': {
      const documentId = documentIdFor(event)
      return documentId === null
        ? null
        : {
            label: 'Ver documento',
            href: `/job-cases/${caseId}#document-${documentId}`,
          }
    }
    case 'QUALITY_INSPECTION': {
      const href = workOrderHref(
        event,
        fallbackWorkOrderId,
        'quality',
        `quality-inspection-${event.aggregateId}`,
      )
      return href ? { label: 'Ver inspección', href } : null
    }
    case 'QUALITY_MEASUREMENT':
    case 'QUALITY_CHECK': {
      const href = workOrderHref(
        event,
        fallbackWorkOrderId,
        'quality',
        `quality-check-${event.aggregateId}`,
      )
      return href ? { label: 'Ver control', href } : null
    }
    case 'NON_CONFORMITY': {
      const href = workOrderHref(
        event,
        fallbackWorkOrderId,
        'quality',
        `non-conformity-${event.aggregateId}`,
      )
      return href ? { label: 'Ver no conformidad', href } : null
    }
    case 'DELIVERY': {
      const href = workOrderHref(
        event,
        fallbackWorkOrderId,
        'delivery',
        `delivery-${event.aggregateId}`,
      )
      return href ? { label: 'Ver entrega', href } : null
    }
    default:
      return null
  }
}

export function getPrimaryJobCaseTraceabilityHref(
  event: JobCaseTimelineEventDto,
  caseId: number,
  fallbackWorkOrderId: number | null = null,
): string | null {
  const actions = event.actions ?? []

  const navigable = actions
    .map((action) => ({
      action,
      href: getJobCaseTraceabilityActionHref(
        action,
        event,
        caseId,
        fallbackWorkOrderId,
      ),
    }))
    .filter(
      (
        item,
      ): item is {
        action: JobCaseTraceabilityActionDto
        href: string
      } => item.href !== null,
    )

  const specific = navigable.find(
    ({ action }) => action.type !== 'VIEW_JOB_CASE',
  )

  return specific?.href ?? navigable.at(0)?.href ?? null
}
