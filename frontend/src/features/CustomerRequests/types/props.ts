import type {
  CreateCustomerRequestInput,
  CustomerRequest,
  CustomerRequestStatus,
  CustomerRequestSummary,
} from './index'

export interface StatusBadgeProps {
  status: CustomerRequestStatus
}

export interface RequestCardProps {
  request: CustomerRequestSummary
  onSelect: (id: string) => void
}

export interface RequestListProps {
  requests: CustomerRequestSummary[]
  onSelect: (id: string) => void
}

export interface RequestFormProps {
  onSubmit: (input: CreateCustomerRequestInput) => void
  isSubmitting: boolean
  submitError: string | null
  onCancel: () => void
}

export interface RequestListTemplateProps {
  requests: CustomerRequestSummary[]
  isLoading: boolean
  isError: boolean
  error: string | null
  onRetry: () => void
  onSelectRequest: (id: string) => void
}

export interface CreateRequestTemplateProps {
  onSubmit: (input: CreateCustomerRequestInput) => void
  isSubmitting: boolean
  submitError: string | null
  onCancel: () => void
}

export interface RequestDetailModalProps {
  request: CustomerRequest | null
  isLoading: boolean
  isError: boolean
  error: string | null
  onRetry: () => void
  onClose: () => void
  onCancelRequest: () => void
  isCancelling: boolean
  cancelError: string | null
}