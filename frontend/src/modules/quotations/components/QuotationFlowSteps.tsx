import { WorkProgressSteps } from '@/shared/components/workflow/WorkProgressSteps'

interface QuotationFlowStepsProps {
  currentStep?: number
  requestHref?: string
}

export function QuotationFlowSteps({
  currentStep = 1,
  requestHref,
}: QuotationFlowStepsProps) {
  const stepHrefs: Partial<Record<number, string>> = {}
  const stepDetails: Partial<Record<number, string>> = {
    0: requestHref ? 'Volver a la solicitud' : 'Solicitud de origen',
    1: 'Propuesta comercial',
    2: 'Preparación interna',
    3: 'Fabricación',
    4: 'Inspección',
    5: 'Entrega',
  }

  if (requestHref) stepHrefs[0] = requestHref

  return (
    <WorkProgressSteps
      currentStep={currentStep}
      heading="Seguimiento de la solicitud"
      stepHrefs={stepHrefs}
      stepDetails={stepDetails}
    />
  )
}
