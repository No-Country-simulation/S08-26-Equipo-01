import type { JobCaseDto } from '@/modules/job-cases'
import { apiClient } from '@/shared/api/apiClient'
import { ApiError } from '@/shared/api/ApiError'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  InternalCustomerDetailDto,
  InternalCustomerJobCasePageDto,
  InternalCustomerJobCaseQuery,
  InternalCustomerSummaryDto,
} from '../types/internalCustomer.types'

export async function getInternalCustomers(): Promise<
  InternalCustomerSummaryDto[]
> {
  const response = await apiClient.get<ApiResponse<InternalCustomerSummaryDto[]>>(
    '/internal/customers',
  )

  return response.data.data
}

export async function getInternalCustomer(
  customerId: number,
): Promise<InternalCustomerDetailDto> {
  const response = await apiClient.get<ApiResponse<InternalCustomerDetailDto>>(
    `/internal/customers/${customerId}`,
  )

  return response.data.data
}

function matchesCustomerCaseSearch(jobCase: JobCaseDto, search: string) {
  if (!search) return true

  return [
    jobCase.caseNumber,
    jobCase.request.requestNumber,
    jobCase.request.customerReference,
    jobCase.request.title,
    jobCase.request.requestedByName,
  ].some((value) => value?.toLocaleLowerCase().includes(search))
}

function paginateCustomerCases(
  jobCases: JobCaseDto[],
  customerId: number,
  query: InternalCustomerJobCaseQuery,
): InternalCustomerJobCasePageDto {
  const search = query.search.trim().toLocaleLowerCase()
  const page = Math.max(query.page, 0)
  const pageSize = Math.max(query.size, 1)

  const filtered = jobCases.filter((jobCase) => {
    if (jobCase.request.customerId !== customerId) return false
    if (query.status !== 'ALL' && jobCase.status !== query.status) return false

    if (
      query.assignment === 'ASSIGNED' &&
      jobCase.assignedToUserId === null
    ) {
      return false
    }

    if (
      query.assignment === 'UNASSIGNED' &&
      jobCase.assignedToUserId !== null
    ) {
      return false
    }

    return matchesCustomerCaseSearch(jobCase, search)
  })

  const totalItems = filtered.length
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize)
  const start = page * pageSize

  return {
    items: filtered.slice(start, start + pageSize),
    page,
    pageSize,
    totalItems,
    totalPages,
  }
}

async function getInternalCustomerJobCasesFallback(
  customerId: number,
  query: InternalCustomerJobCaseQuery,
): Promise<InternalCustomerJobCasePageDto> {
  const response = await apiClient.get<ApiResponse<JobCaseDto[]>>('/job-cases')

  return paginateCustomerCases(response.data.data, customerId, query)
}

export async function getInternalCustomerJobCases(
  customerId: number,
  query: InternalCustomerJobCaseQuery,
): Promise<InternalCustomerJobCasePageDto> {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
  })

  const search = query.search.trim()
  if (search) params.set('search', search)
  if (query.status !== 'ALL') params.set('status', query.status)
  if (query.assignment !== 'ALL') {
    params.set('assigned', String(query.assignment === 'ASSIGNED'))
  }

  try {
    const response = await apiClient.get<
      ApiResponse<InternalCustomerJobCasePageDto>
    >(`/internal/customers/${customerId}/job-cases?${params.toString()}`)

    return response.data.data
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return getInternalCustomerJobCasesFallback(customerId, query)
    }

    throw error
  }
}
