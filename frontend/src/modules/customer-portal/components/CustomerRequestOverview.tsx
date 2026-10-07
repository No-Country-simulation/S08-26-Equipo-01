import { useNavigate } from 'react-router-dom'
import type { CustomerQuotationStatus } from '@/modules/quotations'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import {
  getCustomerRequestDisplayStatus,
  type CustomerDeliveryProgress,
} from '../model/customerRequestOverviewPresenter'
import type {
  CustomerInformationRequestDto,
  CustomerRequestDetailDto,
} from '../types/customerRequest.types'
import { CustomerRequestFlowSteps } from './CustomerRequestFlowSteps'
import { CustomerRequestFollowUp } from './CustomerRequestFollowUp'
import { CustomerRequestsBackButton } from './CustomerRequestsBackButton'
import { CustomerRequestWorkDetails } from './CustomerRequestWorkDetails'

interface CustomerRequestOverviewProps {
  customerId: number
  request: CustomerRequestDetailDto
  quotationId?: number
  quotationStatus?: CustomerQuotationStatus
  deliveryProgress?: CustomerDeliveryProgress
  canWrite: boolean
  canCancel: boolean
  openInformationRequest: CustomerInformationRequestDto | null
  latestResponse: CustomerInformationRequestDto | null
  onRespond: (request: CustomerInformationRequestDto) => void
  onCancel: () => void
}

export function CustomerRequestOverview({
  customerId,
  request,
  quotationId,
  quotationStatus,
  deliveryProgress,
  canWrite,
  canCancel,
  openInformationRequest,
  latestResponse,
  onRespond,
  onCancel,
}: CustomerRequestOverviewProps) {
  const navigate = useNavigate()
  const status = getCustomerRequestDisplayStatus(request, deliveryProgress)

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
            <SidebarNavIcon name="requests" className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
              Gestión de trabajos
            </p>

            <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
              <h1 className="max-w-3xl truncate text-xl font-bold tracking-tight text-slate-950 lg:text-[22px]">
                {request.title}
              </h1>
              <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
                {status.label}
              </Badge>
              <span className="text-[8px] font-semibold text-slate-400">
                {request.requestNumber}
              </span>
            </div>

            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              Seguimiento del trabajo desde la solicitud hasta la entrega.
            </p>
          </div>
        </div>

        <CustomerRequestsBackButton
          onClick={() => navigate(`/portal/${customerId}/requests`)}
        />
      </div>

      <CustomerRequestFlowSteps
        status={request.jobCase.status}
        deliveryProgress={deliveryProgress}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        <CustomerRequestWorkDetails request={request} />
        <CustomerRequestFollowUp
          customerId={customerId}
          request={request}
          quotationId={quotationId}
          quotationStatus={quotationStatus}
          deliveryProgress={deliveryProgress}
          canWrite={canWrite}
          canCancel={canCancel}
          openInformationRequest={openInformationRequest}
          latestResponse={latestResponse}
          onRespond={onRespond}
          onCancel={onCancel}
        />
      </div>
    </>
  )
}
