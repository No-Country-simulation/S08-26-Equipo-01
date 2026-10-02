import { WorkProgressSteps } from '@/shared/components/workflow/WorkProgressSteps'
import type { WorkOrderStatus } from '../types/workOrder.types'

interface WorkOrderFlowStepsProps {
  status: WorkOrderStatus
}

export function WorkOrderFlowSteps({ status }: WorkOrderFlowStepsProps) {
  const deliveryStage =
    status === 'READY_FOR_DELIVERY' || status === 'DELIVERED'

  return (
    <WorkProgressSteps
      currentStep={deliveryStage ? 4 : 3}
      cancelled={status === 'CANCELLED'}
      deliveryComplete={status === 'DELIVERED'}
    />
  )
}
