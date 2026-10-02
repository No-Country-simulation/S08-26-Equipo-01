import { createContext } from 'react'
import type { CustomerContextDto } from '../types/customerPortal.types'

export interface CustomerPortalContextValue {
  customer: CustomerContextDto
  contexts: CustomerContextDto[]
}

export const CustomerPortalContext =
  createContext<CustomerPortalContextValue | null>(null)
