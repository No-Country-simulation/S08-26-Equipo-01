import { useNavigate, useParams } from 'react-router-dom'
import { RequestDetailTemplate } from '@/features/CustomerRequests/components/templates/RequestDetailTemplate'
import { useCustomerRequest } from '@/hooks/useCustomerRequest'
import { getErrorMessage } from '@/shared/utils/errorMessage'

export const RequestDetailPage = () => {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const { request, isLoading, isError, error, retry } = useCustomerRequest(id)

  return (
    <RequestDetailTemplate
      request={request ?? null}
      isLoading={isLoading}
      isError={isError}
      error={isError ? getErrorMessage(error) : null}
      onRetry={retry}
      onBack={() => navigate('/dashboard')}
    />
  )
}