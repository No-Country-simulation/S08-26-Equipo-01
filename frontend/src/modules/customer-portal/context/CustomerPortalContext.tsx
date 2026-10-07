import type { ReactNode } from 'react'
import {
  CustomerPortalContext,
  type CustomerPortalContextValue,
} from './customerPortalContextValue'

export function CustomerPortalContextProvider({
  value,
  children,
}: {
  value: CustomerPortalContextValue
  children: ReactNode
}) {
  return (
    <CustomerPortalContext.Provider value={value}>
      {children}
    </CustomerPortalContext.Provider>
  )
}
