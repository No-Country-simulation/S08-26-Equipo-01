import { useNavigate } from 'react-router-dom'
import { RequestListTemplate } from '@/features/CustomerRequests/components/templates/RequestListTemplate'
import { useCustomerRequests } from '@/hooks/useCustomerRequests'
import { getErrorMessage } from '@/shared/utils/errorMessage'

export const CustomerRequestsPage = () => {
  const navigate = useNavigate()
  const { requests, isLoading, isError, error, retry } = useCustomerRequests()

  return (
    <RequestListTemplate
      requests={requests}
      isLoading={isLoading}
      isError={isError}
      error={isError ? getErrorMessage(error) : null}
      onRetry={retry}
      onCreateRequest={() => navigate('/requests/new')}
      onSelectRequest={(id) => navigate(`/requests/${id}`)}
    />
  )
}