import { useNavigate } from 'react-router-dom'
import type { CreateCustomerRequestInput } from '@/features/CustomerRequests/types'
import { CreateRequestTemplate } from '@/features/CustomerRequests/components/templates/CreateRequestTemplate'
import { useCreateCustomerRequest } from '@/hooks/useCreateCustomerRequest'
import { getErrorMessage } from '@/shared/utils/errorMessage'

export const CreateRequestPage = () => {
  const navigate = useNavigate()
  const mutation = useCreateCustomerRequest()

  const handleSubmit = (input: CreateCustomerRequestInput) => {
    mutation.mutate(input, {
      onSuccess: () => navigate('/dashboard'),
    })
  }

  return (
    <CreateRequestTemplate
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      submitError={mutation.isError ? getErrorMessage(mutation.error) : null}
      onCancel={() => navigate('/dashboard')}
    />
  )
}