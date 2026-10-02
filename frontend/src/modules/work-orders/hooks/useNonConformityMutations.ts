import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  authorizeUseAsIs,
  createReworkRouting,
  recordScrap,
  updateNonConformity,
} from '../api/nonConformities.api'
import type {
  AuthorizeUseAsIsPayload,
  UpdateNonConformityPayload,
} from '../types/quality.types'
import { workOrderKeys } from './useWorkOrders'

export function useNonConformityMutations(workOrderId: number) {
  const queryClient = useQueryClient()

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: workOrderKeys.all,
    })

  const updateDetails = useMutation({
    mutationFn: ({
      nonConformityId,
      payload,
    }: {
      nonConformityId: number
      payload: UpdateNonConformityPayload
    }) => updateNonConformity(nonConformityId, payload),
    onSuccess: refresh,
  })

  const createRework = useMutation({
    mutationFn: (nonConformityId: number) =>
      createReworkRouting(nonConformityId),
    onSuccess: refresh,
  })

  const scrap = useMutation({
    mutationFn: (nonConformityId: number) => recordScrap(nonConformityId),
    onSuccess: refresh,
  })

  const useAsIs = useMutation({
    mutationFn: ({
      nonConformityId,
      payload,
    }: {
      nonConformityId: number
      payload: AuthorizeUseAsIsPayload
    }) => authorizeUseAsIs(nonConformityId, payload),
    onSuccess: refresh,
  })

  return {
    workOrderId,
    updateDetails,
    createRework,
    scrap,
    useAsIs,
  }
}
