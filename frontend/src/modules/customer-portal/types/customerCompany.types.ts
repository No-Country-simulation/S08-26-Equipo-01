import type { CustomerMembershipRole } from './customerPortal.types'

export interface CustomerCompanyDto {
  id: number
  name: string
  rfc: string | null
  phone: string | null
  administrativeEmail: string | null
  city: string | null
  state: string | null
  website: string | null
  status: string
  createdAt: string
}

export interface CustomerMemberDto {
  membershipId: number
  userId: number
  firstName: string
  lastName: string
  email: string
  role: CustomerMembershipRole
  status: string
  joinedAt: string | null
  createdAt: string
}

export interface CustomerInvitationDto {
  id: number
  customerId: number
  email: string
  role: CustomerMembershipRole
  status: string
  expiresAt: string
  createdAt: string
}

export interface CreateCustomerCompanyPayload {
  name: string
  rfc?: string
  phone?: string
  administrativeEmail?: string
  city?: string
  state?: string
  website?: string
}

export interface UpdateCustomerCompanyPayload {
  name?: string
  rfc?: string
  phone?: string
  administrativeEmail?: string
  city?: string
  state?: string
  website?: string
}

export interface UpdateCustomerMemberRolePayload {
  role: CustomerMembershipRole
}

export interface CreateCustomerInvitationPayload {
  email: string
  role: CustomerMembershipRole
}


export interface CustomerAddressDto {
  id: number
  customerId: number
  label: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  contactName: string | null
  contactPhone: string | null
  deliveryInstructions: string | null
  defaultAddress: boolean
  createdAt: string
  updatedAt: string
}

export interface SaveCustomerAddressPayload {
  label: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  contactName?: string
  contactPhone?: string
  deliveryInstructions?: string
  defaultAddress: boolean
}
