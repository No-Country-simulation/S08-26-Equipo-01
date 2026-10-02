export type CustomerMembershipRole = 'ADMIN' | 'REQUESTER' | 'VIEWER'

export interface CustomerContextDto {
  customerId: number
  customerName: string
  role: CustomerMembershipRole
  status: 'ACTIVE'
  joinedAt: string
}
