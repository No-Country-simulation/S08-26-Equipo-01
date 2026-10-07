import { useQuery } from '@tanstack/react-query'
import { getInternalDashboard } from '../api/dashboard.api'

export const dashboardKeys = {
  all: ['internal-dashboard'] as const,
  detail: () => [...dashboardKeys.all, 'detail'] as const,
}

export function useInternalDashboard() {
  return useQuery({
    queryKey: dashboardKeys.detail(),
    queryFn: getInternalDashboard,
    refetchInterval: 60_000,
  })
}
