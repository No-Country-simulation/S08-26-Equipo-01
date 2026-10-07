import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  useCustomerPortalContext,
  useCustomerRequests,
  type CustomerRequestStatus,
} from '@/modules/customer-portal'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { ApproveQuotationDialog } from '../components/ApproveQuotationDialog'
import { CustomerQuotationDecisionPanel } from '../components/CustomerQuotationDecisionPanel'
import { CustomerQuotationDocument } from '../components/CustomerQuotationDocument'
import { CustomerQuotationHeader } from '../components/CustomerQuotationHeader'
import { CustomerQuotationSourceCard } from '../components/CustomerQuotationSourceCard'
import { QuotationFlowSteps } from '../components/QuotationFlowSteps'
import { RejectQuotationDialog } from '../components/RejectQuotationDialog'
import { RequestAdjustmentDialog } from '../components/RequestAdjustmentDialog'
import {
  useCustomerQuotationDetail,
  useCustomerQuotationRevisions,
} from '../hooks/useCustomerQuotationDetail'
import {
  useApproveCustomerQuotation,
  useRejectCustomerQuotation,
  useRequestCustomerQuotationAdjustment,
} from '../hooks/useCustomerQuotationMutations'
import type {
  CustomerAdjustmentFormValues,
  CustomerRejectionFormValues,
} from '../schemas/customerQuotation.schemas'

type Dialog = 'approve' | 'adjust' | 'reject' | null

function getCustomerWorkStep(status: CustomerRequestStatus): number {
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

export function CustomerQuotationDetailPage() {
  const { quotationId } = useParams()
  const { customer } = useCustomerPortalContext()
  const [dialog, setDialog] = useState<Dialog>(null)
  const numericId = Number(quotationId)
  const validId =
    Number.isInteger(numericId) && numericId > 0 ? numericId : null
  const detailQuery = useCustomerQuotationDetail(customer.customerId, validId)
  const revisionsQuery = useCustomerQuotationRevisions(
    customer.customerId,
    validId,
  )
  const requestsQuery = useCustomerRequests(customer.customerId)
  const approveMutation = useApproveCustomerQuotation(
    customer.customerId,
    validId ?? 0,
  )
  const adjustmentMutation = useRequestCustomerQuotationAdjustment(
    customer.customerId,
    validId ?? 0,
  )
  const rejectMutation = useRejectCustomerQuotation(
    customer.customerId,
    validId ?? 0,
  )

  if (validId === null) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={new Error('El identificador de la cotización no es válido.')}
          title="Cotización no disponible"
        />
      </PageContainer>
    )
  }

  if (detailQuery.isPending) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando cotización…" />
      </PageContainer>
    )
  }

  if (detailQuery.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={detailQuery.error}
          title="No pudimos cargar la cotización"
        />
      </PageContainer>
    )
  }

  const quotation = detailQuery.data
  const relatedRequest = requestsQuery.data?.find(
    (request) => request.requestNumber === quotation.requestNumber,
  )
  const requestHref = relatedRequest
    ? `/portal/${customer.customerId}/requests/${relatedRequest.id}`
    : undefined
  const currentWorkStep = relatedRequest
    ? getCustomerWorkStep(relatedRequest.jobCase.status)
    : 1
  const canDecide =
    customer.role !== 'VIEWER' && quotation.customerStatus === 'SENT'
  const mutationPending =
    approveMutation.isPending ||
    adjustmentMutation.isPending ||
    rejectMutation.isPending

  const approve = async () => {
    try {
      await approveMutation.mutateAsync()
      setDialog(null)
    } catch {
      // The mutation exposes the normalized error inside the active dialog.
    }
  }

  const requestAdjustment = async (values: CustomerAdjustmentFormValues) => {
    try {
      await adjustmentMutation.mutateAsync(values)
      setDialog(null)
      return true
    } catch {
      // The mutation exposes the normalized error inside the active dialog.
      return false
    }
  }

  const reject = async (values: CustomerRejectionFormValues) => {
    try {
      await rejectMutation.mutateAsync({
        ...(values.reason.trim() ? { reason: values.reason.trim() } : {}),
      })
      setDialog(null)
      return true
    } catch {
      // The mutation exposes the normalized error inside the active dialog.
      return false
    }
  }

  const openDialog = (nextDialog: Exclude<Dialog, null>) => {
    approveMutation.reset()
    adjustmentMutation.reset()
    rejectMutation.reset()
    setDialog(nextDialog)
  }

  const closeDialog = () => {
    approveMutation.reset()
    adjustmentMutation.reset()
    rejectMutation.reset()
    setDialog(null)
  }

  return (
    <PageContainer className="py-4 lg:py-3">
      <CustomerQuotationHeader
        customerId={customer.customerId}
        quotation={quotation}
        customerName={customer.customerName}
      />

      <div className="space-y-4">
        <QuotationFlowSteps
          currentStep={currentWorkStep}
          requestHref={requestHref}
        />
        <CustomerQuotationSourceCard
          source={quotation.source}
          caseNumber={quotation.caseNumber}
          requestNumber={quotation.requestNumber}
          requestHref={requestHref}
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-stretch">
          <CustomerQuotationDocument
            quotation={quotation}
            customerName={customer.customerName}
          />

          <CustomerQuotationDecisionPanel
            customerId={customer.customerId}
            quotation={quotation}
            canDecide={canDecide}
            viewerReadOnly={
              customer.role === 'VIEWER' && quotation.customerStatus === 'SENT'
            }
            submitting={mutationPending}
            revisions={revisionsQuery.data}
            revisionsPending={revisionsQuery.isPending}
            revisionsError={revisionsQuery.isError}
            onRequestAdjustment={() => openDialog('adjust')}
            onReject={() => openDialog('reject')}
            onApprove={() => openDialog('approve')}
          />
        </div>
      </div>

      <ApproveQuotationDialog
        open={dialog === 'approve'}
        submitting={mutationPending}
        error={approveMutation.error}
        onClose={closeDialog}
        onConfirm={() => void approve()}
      />
      <RequestAdjustmentDialog
        open={dialog === 'adjust'}
        submitting={mutationPending}
        error={adjustmentMutation.error}
        onClose={closeDialog}
        onSubmit={requestAdjustment}
      />
      <RejectQuotationDialog
        open={dialog === 'reject'}
        submitting={mutationPending}
        error={rejectMutation.error}
        onClose={closeDialog}
        onSubmit={reject}
      />
    </PageContainer>
  )
}
