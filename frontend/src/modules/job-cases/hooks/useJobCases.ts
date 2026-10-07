import { useQuery } from '@tanstack/react-query'
import { getJobCases } from '../api/jobCases.api'

export const jobCaseKeys = {
  all: ['job-cases'] as const,
  list: () => [...jobCaseKeys.all, 'list'] as const,
  detail: (caseId: number | null) =>
    [...jobCaseKeys.all, 'detail', caseId] as const,
  timeline: (caseId: number | null) =>
    [...jobCaseKeys.all, 'timeline', caseId] as const,
}

export function useJobCases() {
  return useQuery({
    queryKey: jobCaseKeys.list(),
    queryFn: getJobCases,
  })
}
