import { useState } from 'react'
import { RequestDetailModal } from '@/features/CustomerRequests/components/organisms/RequestDetailModal'
import { RequestListTemplate } from '@/features/CustomerRequests/components/templates/RequestListTemplate'
import { useCancelCustomerRequest } from '@/hooks/useCancelCustomerRequest'
import { useCustomerRequest } from '@/hooks/useCustomerRequest'
import { useCustomerRequests } from '@/hooks/useCustomerRequests'
import { getErrorMessage } from '@/shared/utils/errorMessage'

export const CustomerRequestsPage = () => {
  const { requests, isLoading, isError, error, retry } = useCustomerRequests()
  const cancelMutation = useCancelCustomerRequest()

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  )
  const {
    request,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
    retry: retryDetail,
  } = useCustomerRequest(selectedRequestId ?? '')

  const handleCancelRequest = () => {
    if (!selectedRequestId) return
    cancelMutation.mutate(selectedRequestId, {
      onSuccess: () => setSelectedRequestId(null),
    })
  }

  return (
    <>
      <RequestListTemplate
        requests={requests}
        isLoading={isLoading}
        isError={isError}
        error={isError ? getErrorMessage(error) : null}
        onRetry={retry}
        onSelectRequest={(id) => setSelectedRequestId(id)}
      />
      <RequestDetailModal
        request={request ?? null}
        isLoading={isDetailLoading}
        isError={isDetailError}
        error={isDetailError ? getErrorMessage(detailError) : null}
        onRetry={retryDetail}
        onClose={() => setSelectedRequestId(null)}
        onCancelRequest={handleCancelRequest}
        isCancelling={cancelMutation.isPending}
        cancelError={
          cancelMutation.isError ? getErrorMessage(cancelMutation.error) : null
        }
      />
    </>
  )
}