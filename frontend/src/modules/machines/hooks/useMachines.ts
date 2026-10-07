import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createMachine,
  getMachines,
  updateMachineStatus,
} from '../api/machines.api'
import type {
  CreateMachinePayload,
  UpdateMachineStatusPayload,
} from '../types/machine.types'

export const machineKeys = {
  all: ['machines'] as const,
  list: () => [...machineKeys.all, 'list'] as const,
}

export function useMachines(enabled = true) {
  return useQuery({
    queryKey: machineKeys.list(),
    queryFn: getMachines,
    enabled,
  })
}

export function useMachineMutations() {
  const queryClient = useQueryClient()
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: machineKeys.list() })

  const create = useMutation({
    mutationFn: (payload: CreateMachinePayload) => createMachine(payload),
    onSuccess: refresh,
  })

  const updateStatus = useMutation({
    mutationFn: ({
      machineId,
      payload,
    }: {
      machineId: number
      payload: UpdateMachineStatusPayload
    }) => updateMachineStatus(machineId, payload),
    onSuccess: refresh,
  })

  return { create, updateStatus }
}
