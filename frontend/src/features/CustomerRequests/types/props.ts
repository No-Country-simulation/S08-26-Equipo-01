import type {
  CreateCustomerRequestInput,
  CustomerRequest,
  CustomerRequestStatus,
} from './index'

export interface StatusBadgeProps {
  status: CustomerRequestStatus
}

export interface RequestCardProps {
  request: CustomerRequest
  onSelect: (id: string) => void
}

export interface RequestListProps {
  requests: CustomerRequest[]
  onSelect: (id: string) => void
}

export interface RequestFormProps {
  onSubmit: (input: CreateCustomerRequestInput) => void
  isSubmitting: boolean
  submitError: string | null
  onCancel: () => void
}

export interface RequestListTemplateProps {
  requests: CustomerRequest[]
  isLoading: boolean
  isError: boolean
  error: string | null
  onRetry: () => void
  onCreateRequest: () => void
  onSelectRequest: (id: string) => void
}

export interface CreateRequestTemplateProps {
  onSubmit: (input: CreateCustomerRequestInput) => void
  isSubmitting: boolean
  submitError: string | null
  onCancel: () => void
}

export interface RequestDetailTemplateProps {
  request: CustomerRequest | null
  isLoading: boolean
  isError: boolean
  error: string | null
  onRetry: () => void
  onBack: () => void
}