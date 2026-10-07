import { WorkProgressSteps } from '@/shared/components/workflow/WorkProgressSteps'
import type { JobCaseStatus } from '../types/jobCase.types'

interface JobCaseFlowStepsProps {
  status: JobCaseStatus
  quotationId?: number | null
  quotationNumber?: string | null
  quotationRevision?: number | null
  workOrderId?: number | null
  workOrderNumber?: string | null
  workOrderStatus?: string | null
}

function workOrderStep(status?: string | null): number {
  switch (status) {
    case 'CREATED':
    case 'CANCELLED':
      return 2
    case 'READY_FOR_PRODUCTION':
    case 'IN_PRODUCTION':
      return 3
    case 'QUALITY_PENDING':
    case 'QUALITY_HOLD':
    case 'REWORK_IN_PROGRESS':
      return 4
    case 'READY_FOR_DELIVERY':
    case 'DELIVERED':
      return 5
    default:
      return 3
  }
}

function activeStep(status: JobCaseStatus, workOrderStatus?: string | null): number {
  switch (status) {
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'WAITING_CUSTOMER_INFO':
      return 0
    case 'READY_FOR_QUOTATION':
      return 1
    case 'AWAITING_WORK_ORDER':
      return 2
    case 'IN_PRODUCTION':
      return workOrderStep(workOrderStatus)
    case 'COMPLETED':
      return 5
    case 'CANCELLED':
      return 0
  }
}

export function JobCaseFlowSteps({
  status,
  quotationId = null,
  quotationNumber = null,
  quotationRevision = null,
  workOrderId = null,
  workOrderNumber = null,
  workOrderStatus = null,
}: JobCaseFlowStepsProps) {
  const currentStep = activeStep(status, workOrderStatus)
  const stepHrefs: Partial<Record<number, string>> = {
    0: '#request-source',
  }
  const stepDetails: Partial<Record<number, string>> = {
    0: 'Ver solicitud de origen',
    1:
      quotationNumber && quotationRevision !== null
        ? `${quotationNumber} · Rev. ${quotationRevision}`
        : 'Cotización pendiente',
    2: workOrderNumber ?? 'Orden pendiente',
  }

  if (quotationId !== null) {
    stepHrefs[1] = `/quotations/${quotationId}`
  }

  if (workOrderId !== null) {
    stepHrefs[2] = `/work-orders/${workOrderId}`

    if (currentStep >= 3) {
      stepHrefs[3] = `/work-orders/${workOrderId}?view=production`
      stepDetails[3] = 'Abrir en la OT'
    }

    if (currentStep >= 4) {
      stepHrefs[4] = `/work-orders/${workOrderId}?view=quality`
      stepDetails[4] = 'Abrir en la OT'
    }

    if (currentStep >= 5) {
      stepHrefs[5] = `/work-orders/${workOrderId}?view=delivery`
      stepDetails[5] = 'Abrir en la OT'
    }
  }

  return (
    <WorkProgressSteps
      currentStep={currentStep}
      cancelled={status === 'CANCELLED'}
      deliveryComplete={
        status === 'COMPLETED' || workOrderStatus === 'DELIVERED'
      }
      stepHrefs={stepHrefs}
      stepDetails={stepDetails}
    />
  )
}
