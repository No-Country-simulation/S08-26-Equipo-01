import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from '@/app/query/queryClient'
import { router } from '@/app/router/router'
import { configureAuthApiClient } from '@/modules/auth'
import { DialogFocusManager } from '@/shared/components/a11y/DialogFocusManager'

configureAuthApiClient({
  onUnauthorized: () => queryClient.clear(),
})

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <DialogFocusManager />
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
