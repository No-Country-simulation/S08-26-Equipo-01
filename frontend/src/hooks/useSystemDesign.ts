import { useQuery } from '@tanstack/react-query'
import { getUsers } from '@/services/systemDesign.service'
import type { User } from '@/features/SystemDesign/types'

interface UseSystemDesignResult {
  users: User[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  retry: () => void
}

export function useSystemDesign(): UseSystemDesignResult {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  return {
    users: data ?? [],
    isLoading,
    isError,
    error: isError && error instanceof Error ? error : null,
    retry: () => void refetch(),
  }
}
