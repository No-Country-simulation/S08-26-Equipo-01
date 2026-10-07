import type { WorkOrder360Dto } from '../types/workOrder360.types'
import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  CancelWorkOrderPayload,
  CreateWorkOrderPayload,
  PendingWorkOrderDto,
  ReopenRoutingSheetPayload,
  RoutingOperationPayload,
  RoutingSheetDto,
  UpdateWorkOrderPlanningPayload,
  WorkOrderDetailDto,
  WorkOrderDocumentDto,
  WorkOrderDto,
} from '../types/workOrder.types'

export async function getWorkOrders(): Promise<WorkOrderDto[]> {
  const response =
    await apiClient.get<ApiResponse<WorkOrderDto[]>>('/work-orders')

  return response.data.data
}

export async function getPendingWorkOrders(): Promise<PendingWorkOrderDto[]> {
  const response = await apiClient.get<ApiResponse<PendingWorkOrderDto[]>>(
    '/work-orders/pending-creation',
  )

  return response.data.data
}

export async function getWorkOrder360(
  workOrderId: number,
): Promise<WorkOrder360Dto> {
  const response = await apiClient.get<ApiResponse<WorkOrder360Dto>>(
    `/work-orders/${workOrderId}/360`,
  )

  return response.data.data
}

export async function createWorkOrder(
  caseId: number,
  payload: CreateWorkOrderPayload,
): Promise<WorkOrderDetailDto> {
  const response = await apiClient.post<ApiResponse<WorkOrderDetailDto>>(
    `/job-cases/${caseId}/work-orders`,
    payload,
  )

  return response.data.data
}

export async function updateWorkOrderPlanning(
  workOrderId: number,
  payload: UpdateWorkOrderPlanningPayload,
): Promise<WorkOrderDetailDto> {
  const response = await apiClient.put<ApiResponse<WorkOrderDetailDto>>(
    `/work-orders/${workOrderId}/planning`,
    payload,
  )

  return response.data.data
}

export async function pinWorkOrderDocument(
  workOrderId: number,
  documentId: number,
  versionId: number,
): Promise<WorkOrderDocumentDto> {
  const response = await apiClient.put<ApiResponse<WorkOrderDocumentDto>>(
    `/work-orders/${workOrderId}/documents/${documentId}`,
    { versionId },
  )

  return response.data.data
}

export async function createProductionRouting(
  workOrderId: number,
): Promise<RoutingSheetDto> {
  const response = await apiClient.post<ApiResponse<RoutingSheetDto>>(
    `/work-orders/${workOrderId}/routing-sheets`,
  )

  return response.data.data
}

export async function addRoutingOperation(
  routingSheetId: number,
  payload: RoutingOperationPayload,
): Promise<RoutingSheetDto> {
  const response = await apiClient.post<ApiResponse<RoutingSheetDto>>(
    `/routing-sheets/${routingSheetId}/operations`,
    payload,
  )

  return response.data.data
}

export async function updateRoutingOperation(
  routingSheetId: number,
  operationId: number,
  payload: RoutingOperationPayload,
): Promise<RoutingSheetDto> {
  const response = await apiClient.put<ApiResponse<RoutingSheetDto>>(
    `/routing-sheets/${routingSheetId}/operations/${operationId}`,
    payload,
  )

  return response.data.data
}

export async function removeRoutingOperation(
  routingSheetId: number,
  operationId: number,
): Promise<RoutingSheetDto> {
  const response = await apiClient.delete<ApiResponse<RoutingSheetDto>>(
    `/routing-sheets/${routingSheetId}/operations/${operationId}`,
  )

  return response.data.data
}

export async function approveRoutingSheet(
  routingSheetId: number,
): Promise<RoutingSheetDto> {
  const response = await apiClient.post<ApiResponse<RoutingSheetDto>>(
    `/routing-sheets/${routingSheetId}/approve`,
  )

  return response.data.data
}

export async function reopenRoutingSheet(
  routingSheetId: number,
  payload: ReopenRoutingSheetPayload,
): Promise<RoutingSheetDto> {
  const response = await apiClient.post<ApiResponse<RoutingSheetDto>>(
    `/routing-sheets/${routingSheetId}/reopen`,
    payload,
  )

  return response.data.data
}

export async function releaseRoutingSheet(
  routingSheetId: number,
): Promise<RoutingSheetDto> {
  const response = await apiClient.post<ApiResponse<RoutingSheetDto>>(
    `/routing-sheets/${routingSheetId}/release`,
  )

  return response.data.data
}


export async function cancelWorkOrder(
  workOrderId: number,
  payload: CancelWorkOrderPayload,
): Promise<WorkOrderDetailDto> {
  const response = await apiClient.post<ApiResponse<WorkOrderDetailDto>>(
    `/work-orders/${workOrderId}/cancel`,
    payload,
  )

  return response.data.data
}
