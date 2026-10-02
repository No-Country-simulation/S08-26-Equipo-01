import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  CreateCustomerCompanyPayload,
  CreateCustomerInvitationPayload,
  CustomerAddressDto,
  CustomerCompanyDto,
  CustomerInvitationDto,
  CustomerMemberDto,
  SaveCustomerAddressPayload,
  UpdateCustomerCompanyPayload,
  UpdateCustomerMemberRolePayload,
} from '../types/customerCompany.types'

export async function createCustomerCompany(
  payload: CreateCustomerCompanyPayload,
): Promise<CustomerCompanyDto> {
  const response = await apiClient.post<ApiResponse<CustomerCompanyDto>>(
    '/customers',
    payload,
  )

  return response.data.data
}

export async function getCustomerCompany(
  customerId: number,
): Promise<CustomerCompanyDto> {
  const response = await apiClient.get<ApiResponse<CustomerCompanyDto>>(
    `/customers/${customerId}`,
  )

  return response.data.data
}

export async function updateCustomerCompany(
  customerId: number,
  payload: UpdateCustomerCompanyPayload,
): Promise<CustomerCompanyDto> {
  const response = await apiClient.patch<ApiResponse<CustomerCompanyDto>>(
    `/customers/${customerId}`,
    payload,
  )

  return response.data.data
}

export async function getCustomerMembers(
  customerId: number,
): Promise<CustomerMemberDto[]> {
  const response = await apiClient.get<ApiResponse<CustomerMemberDto[]>>(
    `/customers/${customerId}/members`,
  )

  return response.data.data
}

export async function updateCustomerMemberRole(
  customerId: number,
  userId: number,
  payload: UpdateCustomerMemberRolePayload,
): Promise<void> {
  await apiClient.patch(
    `/customers/${customerId}/members/${userId}/role`,
    payload,
  )
}

export async function removeCustomerMember(
  customerId: number,
  userId: number,
): Promise<void> {
  await apiClient.delete(`/customers/${customerId}/members/${userId}`)
}

export async function getCustomerInvitations(
  customerId: number,
): Promise<CustomerInvitationDto[]> {
  const response = await apiClient.get<ApiResponse<CustomerInvitationDto[]>>(
    `/customers/${customerId}/invitations`,
  )

  return response.data.data
}

export async function cancelCustomerInvitation(
  customerId: number,
  invitationId: number,
): Promise<void> {
  await apiClient.delete(
    `/customers/${customerId}/invitations/${invitationId}`,
  )
}

export async function createCustomerInvitation(
  customerId: number,
  payload: CreateCustomerInvitationPayload,
): Promise<CustomerInvitationDto> {
  const response = await apiClient.post<ApiResponse<CustomerInvitationDto>>(
    `/customers/${customerId}/invitations`,
    payload,
  )

  return response.data.data
}


export async function getCustomerAddresses(
  customerId: number,
): Promise<CustomerAddressDto[]> {
  const response = await apiClient.get<ApiResponse<CustomerAddressDto[]>>(
    `/customers/${customerId}/addresses`,
  )
  return response.data.data
}

export async function createCustomerAddress(
  customerId: number,
  payload: SaveCustomerAddressPayload,
): Promise<CustomerAddressDto> {
  const response = await apiClient.post<ApiResponse<CustomerAddressDto>>(
    `/customers/${customerId}/addresses`,
    payload,
  )
  return response.data.data
}

export async function updateCustomerAddress(
  customerId: number,
  addressId: number,
  payload: SaveCustomerAddressPayload,
): Promise<CustomerAddressDto> {
  const response = await apiClient.put<ApiResponse<CustomerAddressDto>>(
    `/customers/${customerId}/addresses/${addressId}`,
    payload,
  )
  return response.data.data
}

export async function deleteCustomerAddress(
  customerId: number,
  addressId: number,
): Promise<void> {
  await apiClient.delete(`/customers/${customerId}/addresses/${addressId}`)
}
