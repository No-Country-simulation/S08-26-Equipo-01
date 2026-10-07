import { useParams } from 'react-router-dom'
import { useCustomerQuotations } from '@/modules/quotations'
import { WorkProgressSteps } from '@/shared/components/workflow/WorkProgressSteps'
import { useCustomerPortalContext } from '../hooks/useCustomerPortalContext'
import { useCustomerRequestDetail } from '../hooks/useCustomerRequests'
import type { CustomerRequestStatus } from '../types/customerRequest.types'

interface CustomerRequestFlowStepsProps {
  status: CustomerRequestStatus
  deliveryProgress?: 'IN_TRANSIT' | 'PARTIAL' | 'DELIVERED'
  variant?: 'light' | 'dark'
}

function activeStep(status: CustomerRequestStatus): number {
  switch (status) {
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'WAITING_CUSTOMER_INFO':
      return 0
    case 'READY_FOR_QUOTATION':
      return 1
    case 'IN_PRODUCTION':
      return 3
    case 'COMPLETED':
      return 5
    case 'CANCELLED':
      return 0
  }
}

export function CustomerRequestFlowSteps({
  status,
  deliveryProgress,
  variant = 'light',
}: CustomerRequestFlowStepsProps) {
  const { requestId } = useParams()
  const { customer } = useCustomerPortalContext()
  const numericRequestId = Number(requestId)
  const validRequestId =
    Number.isInteger(numericRequestId) && numericRequestId > 0
      ? numericRequestId
      : null
  const requestQuery = useCustomerRequestDetail(customer.customerId, validRequestId)
  const quotationsQuery = useCustomerQuotations(
    customer.customerId,
    Boolean(requestQuery.data),
  )
  const relatedQuotation = quotationsQuery.data?.find(
    (quotation) => quotation.requestNumber === requestQuery.data?.requestNumber,
  )

  const stepHrefs: Partial<Record<number, string>> = {}
  const stepDetails: Partial<Record<number, string>> = {
    0: 'Solicitud de origen',
    2: 'Preparación interna',
    3: 'Fabricación',
    4: 'Inspección',
    5: deliveryProgress ? 'Seguimiento visible abajo' : 'Cierre de la solicitud',
  }

  if (relatedQuotation) {
    stepHrefs[1] = `/portal/${customer.customerId}/quotations/${relatedQuotation.id}`
    stepDetails[1] = 'Abrir cotización'
  } else {
    stepDetails[1] = 'Propuesta comercial'
  }

  return (
    <WorkProgressSteps
      currentStep={deliveryProgress ? 5 : activeStep(status)}
      cancelled={status === 'CANCELLED'}
      deliveryComplete={deliveryProgress === 'DELIVERED'}
      variant={variant}
      heading="Seguimiento de la solicitud"
      stepHrefs={stepHrefs}
      stepDetails={stepDetails}
    />
  )
}
