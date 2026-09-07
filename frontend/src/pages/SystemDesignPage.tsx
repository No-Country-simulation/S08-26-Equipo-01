import SystemDesignTemplate from '@/features/SystemDesign/components/templates/SystemDesignTemplate'
import { useSystemDesign } from '@/hooks/useSystemDesign'
import { getErrorMessage } from '@/shared/utils/errorMessage'

export default function SystemDesignPage() {
  const { users, isLoading, isError, error, retry } = useSystemDesign()

  return (
    <SystemDesignTemplate
      users={users}
      isLoading={isLoading}
      isError={isError}
      error={isError ? getErrorMessage(error) : null}
      onRetry={retry}
    />
  )
}
