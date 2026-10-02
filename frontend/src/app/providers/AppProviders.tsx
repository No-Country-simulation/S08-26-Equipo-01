import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { configureAuthApiClient } from '@/modules/auth'
import { queryClient } from '@/app/query/queryClient'
import { router } from '@/app/router/router'

configureAuthApiClient({
  onUnauthorized: () => queryClient.clear(),
})

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
