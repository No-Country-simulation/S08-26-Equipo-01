import { useQuery } from '@tanstack/react-query'
import { getJobCase } from '../api/jobCases.api'
import { jobCaseKeys } from './useJobCases'

export function useJobCaseDetail(caseId: number | null) {
  return useQuery({
    queryKey: jobCaseKeys.detail(caseId),
    queryFn: () => getJobCase(caseId as number),
    enabled: caseId !== null,
  })
}
