import type { JobCaseDto, JobCaseStatus } from '@/modules/job-cases'

export type InternalCustomerStatus = 'ACTIVE' | 'SUSPENDED'
export type InternalCustomerRole = 'ADMIN' | 'REQUESTER' | 'VIEWER'
export type InternalCustomerCaseAssignment = 'ALL' | 'ASSIGNED' | 'UNASSIGNED'

export interface InternalCustomerSummaryDto {
  id: number
  name: string
  rfc: string | null
  phone: string | null
  administrativeEmail: string | null
  city: string | null
  state: string | null
  website: string | null
  status: InternalCustomerStatus
  activeMembers: number
  openCases: number
  completedCases: number
  cancelledCases: number
  createdAt: string
}

export interface InternalCustomerMemberDto {
  membershipId: number
  userId: number
  firstName: string
  lastName: string
  email: string
  role: InternalCustomerRole
  status: 'ACTIVE' | 'REMOVED'
  joinedAt: string | null
  createdAt: string
}

export interface InternalCustomerDetailDto {
  customer: InternalCustomerSummaryDto
  members: InternalCustomerMemberDto[]
}

export interface InternalCustomerJobCasePageDto {
  items: JobCaseDto[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface InternalCustomerJobCaseQuery {
  page: number
  size: number
  search: string
  status: JobCaseStatus | 'ALL'
  assignment: InternalCustomerCaseAssignment
}

export interface InternalCustomerFiltersValue {
  search: string
  status: InternalCustomerStatus | 'ALL'
}
