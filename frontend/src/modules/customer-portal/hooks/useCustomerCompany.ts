import { useQuery } from '@tanstack/react-query'
import {
  getCustomerAddresses,
  getCustomerCompany,
  getCustomerInvitations,
  getCustomerMembers,
} from '../api/customerCompany.api'

export const customerCompanyKeys = {
  all: ['customer-company'] as const,
  detail: (customerId: number) =>
    [...customerCompanyKeys.all, 'detail', customerId] as const,
  members: (customerId: number) =>
    [...customerCompanyKeys.all, 'members', customerId] as const,
  invitations: (customerId: number) =>
    [...customerCompanyKeys.all, 'invitations', customerId] as const,
  addresses: (customerId: number) =>
    [...customerCompanyKeys.all, 'addresses', customerId] as const,
}

export function useCustomerCompany(customerId: number) {
  return useQuery({
    queryKey: customerCompanyKeys.detail(customerId),
    queryFn: () => getCustomerCompany(customerId),
  })
}

export function useCustomerMembers(customerId: number) {
  return useQuery({
    queryKey: customerCompanyKeys.members(customerId),
    queryFn: () => getCustomerMembers(customerId),
  })
}

export function useCustomerInvitations(customerId: number, enabled: boolean) {
  return useQuery({
    queryKey: customerCompanyKeys.invitations(customerId),
    queryFn: () => getCustomerInvitations(customerId),
    enabled,
  })
}


export function useCustomerAddresses(customerId: number) {
  return useQuery({
    queryKey: customerCompanyKeys.addresses(customerId),
    queryFn: () => getCustomerAddresses(customerId),
  })
}
