import { WorkProgressSteps } from '@/shared/components/workflow/WorkProgressSteps'
import type { JobCaseStatus } from '../types/jobCase.types'

interface JobCaseFlowStepsProps {
  status: JobCaseStatus
}

function activeStep(status: JobCaseStatus): number {
  switch (status) {
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'WAITING_CUSTOMER_INFO':
      return 1
    case 'READY_FOR_QUOTATION':
      return 2
    case 'IN_PRODUCTION':
      return 3
    case 'COMPLETED':
      return 4
    case 'CANCELLED':
      return 0
  }
}

export function JobCaseFlowSteps({ status }: JobCaseFlowStepsProps) {
  return (
    <WorkProgressSteps
      currentStep={activeStep(status)}
      cancelled={status === 'CANCELLED'}
      deliveryComplete={status === 'COMPLETED'}
    />
  )
}
