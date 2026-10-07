import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { useCustomerQuotations } from '@/modules/quotations'
import { Card } from '@/shared/components/ui/Card'
import { CancelCustomerRequestDialog } from '../components/CancelCustomerRequestDialog'
import { CustomerDeliveryTracking } from '../components/CustomerDeliveryTracking'
import { CustomerRequestDocuments } from '../components/CustomerRequestDocuments'
import { CustomerRequestOverview } from '../components/CustomerRequestOverview'
import { RespondInformationDialog } from '../components/RespondInformationDialog'
import { useCustomerRequestDeliveries } from '../hooks/useCustomerDeliveries'
import { useCustomerPortalContext } from '../hooks/useCustomerPortalContext'
import { useCustomerRequestActions } from '../hooks/useCustomerRequestMutations'
import { useCustomerRequestDetail } from '../hooks/useCustomerRequests'
import {
  canCancelCustomerRequest,
  canModifyCustomerRequestDocuments,
  formatCustomerRequestDateTime,
} from '../model/customerRequestPresenter'
import type {
  CancelCustomerRequestFormValues,
  RespondInformationFormValues,
} from '../schemas/customerRequest.schemas'
import { getCustomerDeliverySummary } from '../model/customerDeliveryPresenter'
import type { CustomerInformationRequestDto } from '../types/customerRequest.types'

export function CustomerRequestDetailPage() {
  const { requestId } = useParams()
  const { customer } = useCustomerPortalContext()
  const numericId = Number(requestId)
  const validId =
    Number.isInteger(numericId) && numericId > 0 ? numericId : null
  const query = useCustomerRequestDetail(customer.customerId, validId)
  const quotationsQuery = useCustomerQuotations(
    customer.customerId,
    Boolean(query.data),
  )
  const deliveriesQuery = useCustomerRequestDeliveries(
    customer.customerId,
    validId,
  )
  const actions = useCustomerRequestActions(customer.customerId, validId ?? 0)
  const [respondingTo, setRespondingTo] =
    useState<CustomerInformationRequestDto | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)

  if (validId === null) {
    return (
      <PageContainer>
        <ErrorState
          error={new Error('El identificador de la solicitud no es válido.')}
          title="Solicitud no disponible"
        />
      </PageContainer>
    )
  }

  if (query.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando solicitud…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <ErrorState
          error={query.error}
          title="No pudimos cargar la solicitud"
        />
      </PageContainer>
    )
  }

  const request = query.data
  const relatedQuotation =
    quotationsQuery.data?.find(
      (quotation) => quotation.requestNumber === request.requestNumber,
    ) ?? null
  const deliverySummary = getCustomerDeliverySummary(
    deliveriesQuery.data ?? [],
    request.quantity,
  )
  const deliveryProgress =
    request.jobCase.status === 'COMPLETED'
      ? 'DELIVERED'
      : deliverySummary.completedAgainstRequestedQuantity
        ? 'DELIVERED'
        : deliverySummary.hasInTransit
          ? 'IN_TRANSIT'
          : deliverySummary.deliveredQuantity > 0
            ? 'PARTIAL'
            : undefined
  const canWrite = customer.role !== 'VIEWER'
  const canCancel = canWrite && canCancelCustomerRequest(request)
  const canModifyDocuments =
    canWrite && canModifyCustomerRequestDocuments(request)
  const openInformationRequest =
    request.informationRequests.find((item) => item.open) ?? null
  const latestResponse =
    [...request.informationRequests]
      .filter((item) => item.respondedAt !== null)
      .sort(
        (left, right) =>
          new Date(left.respondedAt ?? 0).getTime() -
          new Date(right.respondedAt ?? 0).getTime(),
      )
      .at(-1) ?? null

  const resetMutationErrors = () => {
    actions.respond.reset()
    actions.cancel.reset()
    actions.addDocument.reset()
    actions.addVersion.reset()
    actions.removeDocument.reset()
  }

  const respond = async (values: RespondInformationFormValues) => {
    if (!respondingTo) return false

    try {
      await actions.respond.mutateAsync({
        informationRequestId: respondingTo.id,
        payload: { response: values.response.trim() },
      })
      setRespondingTo(null)
      return true
    } catch {
      return false
    }
  }

  const cancel = async (values: CancelCustomerRequestFormValues) => {
    try {
      await actions.cancel.mutateAsync({
        ...(values.reason.trim() ? { reason: values.reason.trim() } : {}),
      })
      setCancelOpen(false)
      return true
    } catch {
      return false
    }
  }

  return (
    <PageContainer className="py-4 lg:py-3">
      <CustomerRequestOverview
        customerId={customer.customerId}
        request={request}
        quotationId={relatedQuotation?.id}
        quotationStatus={relatedQuotation?.customerStatus}
        deliveryProgress={deliveryProgress}
        canWrite={canWrite}
        canCancel={canCancel}
        openInformationRequest={openInformationRequest}
        latestResponse={latestResponse}
        onRespond={(informationRequest) => {
          resetMutationErrors()
          setRespondingTo(informationRequest)
        }}
        onCancel={() => {
          resetMutationErrors()
          setCancelOpen(true)
        }}
      />

      <div className="mt-5">
        <CustomerDeliveryTracking
          customerId={customer.customerId}
          requestId={request.id}
          deliveries={deliveriesQuery.data}
          requestedQuantity={request.quantity}
          pending={deliveriesQuery.isPending}
          error={deliveriesQuery.error}
        />
      </div>

      <div className="mt-5">
        <CustomerRequestDocuments
          customerId={customer.customerId}
          requestId={request.id}
          documents={request.documents}
          canModify={canModifyDocuments}
          adding={actions.addDocument.isPending}
          addingVersion={actions.addVersion.isPending}
          removing={actions.removeDocument.isPending}
          mutationError={
            actions.addDocument.error ??
            actions.addVersion.error ??
            actions.removeDocument.error
          }
          onResetErrors={resetMutationErrors}
          onAddDocument={async (input) => {
            try {
              await actions.addDocument.mutateAsync(input)
              return true
            } catch {
              return false
            }
          }}
          onAddVersion={async (documentId, file) => {
            if (file.size > 25 * 1024 * 1024) return false
            try {
              await actions.addVersion.mutateAsync({ documentId, file })
              return true
            } catch {
              return false
            }
          }}
          onRemove={async (documentId) => {
            try {
              await actions.removeDocument.mutateAsync(documentId)
              return true
            } catch {
              return false
            }
          }}
        />
      </div>

      {request.informationRequests.length > 0 ? (
        <Card
          className={
            openInformationRequest
              ? 'mt-5 border-amber-100 bg-gradient-to-br from-white via-white to-amber-50/35 p-4'
              : 'mt-5 border-blue-100/70 bg-gradient-to-br from-white via-white to-blue-50/20 p-4'
          }
        >
          <h2 className="text-sm font-semibold text-slate-950">
            Preguntas y respuestas
          </h2>
          <div className="mt-4 space-y-3">
            {request.informationRequests.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold text-slate-900">
                  {item.question}
                </p>
                <p className="mt-1 text-[9px] text-slate-500">
                  {formatCustomerRequestDateTime(item.requestedAt)}
                </p>
                {item.response ? (
                  <p className="mt-3 border-l-2 border-emerald-300 pl-3 text-xs leading-5 text-slate-700">
                    {item.response}
                  </p>
                ) : (
                  <p className="mt-3 text-[10px] font-semibold text-amber-700">
                    Pendiente de respuesta
                  </p>
                )}
              </article>
            ))}
          </div>
        </Card>
      ) : null}

      <RespondInformationDialog
        request={respondingTo}
        submitting={actions.respond.isPending}
        error={actions.respond.error}
        onClose={() => setRespondingTo(null)}
        onSubmit={respond}
      />

      <CancelCustomerRequestDialog
        open={cancelOpen}
        submitting={actions.cancel.isPending}
        error={actions.cancel.error}
        onClose={() => setCancelOpen(false)}
        onSubmit={cancel}
      />
    </PageContainer>
  )
}
