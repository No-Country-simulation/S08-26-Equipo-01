import { useContext } from 'react'
import { CustomerPortalContext } from '../context/customerPortalContextValue'

export function useCustomerPortalContext() {
  const context = useContext(CustomerPortalContext)

  if (!context) {
    throw new Error(
      'useCustomerPortalContext debe usarse dentro de CustomerPortalShell.',
    )
  }

  return context
}
