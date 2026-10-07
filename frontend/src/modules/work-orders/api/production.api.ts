import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  CancelOperationExecutionPayload,
  CompleteOperationExecutionPayload,
  OperationExecutionDto,
  StartOperationExecutionPayload,
} from '../types/workOrder.types'

export async function startOperationExecution(
  operationId: number,
  payload: StartOperationExecutionPayload,
): Promise<OperationExecutionDto> {
  const response = await apiClient.post<ApiResponse<OperationExecutionDto>>(
    `/routing-operations/${operationId}/executions`,
    payload,
  )

  return response.data.data
}

export async function completeOperationExecution(
  executionId: number,
  payload: CompleteOperationExecutionPayload,
): Promise<OperationExecutionDto> {
  const response = await apiClient.post<ApiResponse<OperationExecutionDto>>(
    `/operation-executions/${executionId}/complete`,
    payload,
  )

  return response.data.data
}

export async function cancelOperationExecution(
  executionId: number,
  payload: CancelOperationExecutionPayload,
): Promise<OperationExecutionDto> {
  const response = await apiClient.post<ApiResponse<OperationExecutionDto>>(
    `/operation-executions/${executionId}/cancel`,
    payload,
  )

  return response.data.data
}
