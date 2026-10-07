import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  completeJobCaseReview,
  defineJobCaseMaterial,
  requestJobCaseInformation,
  takeJobCase,
} from '../api/jobCases.api'
import type {
  CreateInformationRequestPayload,
  DefineMaterialSpecificationPayload,
} from '../types/jobCase.types'
import { jobCaseKeys } from './useJobCases'

function useRefreshJobCase(caseId: number) {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: jobCaseKeys.list() }),
      queryClient.invalidateQueries({
        queryKey: jobCaseKeys.detail(caseId),
      }),
      queryClient.invalidateQueries({
        queryKey: jobCaseKeys.timeline(caseId),
      }),
    ])
}

export function useTakeJobCase(caseId: number) {
  const refresh = useRefreshJobCase(caseId)

  return useMutation({
    mutationFn: () => takeJobCase(caseId),
    onSuccess: refresh,
  })
}

export function useRequestJobCaseInformation(caseId: number) {
  const refresh = useRefreshJobCase(caseId)

  return useMutation({
    mutationFn: (payload: CreateInformationRequestPayload) =>
      requestJobCaseInformation(caseId, payload),
    onSuccess: refresh,
  })
}

export function useDefineJobCaseMaterial(caseId: number) {
  const refresh = useRefreshJobCase(caseId)

  return useMutation({
    mutationFn: (payload: DefineMaterialSpecificationPayload) =>
      defineJobCaseMaterial(caseId, payload),
    onSuccess: refresh,
  })
}

export function useCompleteJobCaseReview(caseId: number) {
  const refresh = useRefreshJobCase(caseId)

  return useMutation({
    mutationFn: () => completeJobCaseReview(caseId),
    onSuccess: refresh,
  })
}
