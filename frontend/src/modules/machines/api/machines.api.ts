import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  CreateMachinePayload,
  MachineDto,
  UpdateMachineStatusPayload,
} from '../types/machine.types'

export async function getMachines(): Promise<MachineDto[]> {
  const response = await apiClient.get<ApiResponse<MachineDto[]>>('/machines')

  return response.data.data
}

export async function createMachine(
  payload: CreateMachinePayload,
): Promise<MachineDto> {
  const response = await apiClient.post<ApiResponse<MachineDto>>(
    '/machines',
    payload,
  )

  return response.data.data
}

export async function updateMachineStatus(
  machineId: number,
  payload: UpdateMachineStatusPayload,
): Promise<MachineDto> {
  const response = await apiClient.patch<ApiResponse<MachineDto>>(
    `/machines/${machineId}/status`,
    payload,
  )

  return response.data.data
}
