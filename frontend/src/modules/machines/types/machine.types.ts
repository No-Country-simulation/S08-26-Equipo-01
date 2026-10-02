export const MACHINE_STATUSES = [
  'AVAILABLE',
  'IN_USE',
  'MAINTENANCE',
  'OUT_OF_SERVICE',
] as const

export const MANAGEABLE_MACHINE_STATUSES = [
  'AVAILABLE',
  'MAINTENANCE',
  'OUT_OF_SERVICE',
] as const

export type MachineStatus = (typeof MACHINE_STATUSES)[number]
export type ManageableMachineStatus =
  (typeof MANAGEABLE_MACHINE_STATUSES)[number]

export interface MachineDto {
  id: number
  code: string
  name: string
  type: string | null
  status: MachineStatus
  createdAt: string
  updatedAt: string
}

export interface CreateMachinePayload {
  code: string
  name: string
  type?: string
}

export interface UpdateMachineStatusPayload {
  status: ManageableMachineStatus
}
