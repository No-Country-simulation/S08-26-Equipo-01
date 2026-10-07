import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getJobCaseTimeline } from '../api/jobCases.api'
import { jobCaseKeys } from './useJobCases'

const RECENT_ACTIVITY_LIMIT = 5
const HISTORY_PAGE_SIZE = 20

export function useJobCaseRecentActivity(caseId: number | null) {
  return useQuery({
    queryKey: [...jobCaseKeys.timeline(caseId), 'recent'],
    queryFn: () =>
      getJobCaseTimeline(caseId as number, {
        limit: RECENT_ACTIVITY_LIMIT,
      }),
    enabled: caseId !== null,
  })
}

export function useJobCaseTimelineHistory(
  caseId: number | null,
  enabled: boolean,
) {
  return useInfiniteQuery({
    queryKey: [...jobCaseKeys.timeline(caseId), 'history'],
    queryFn: ({ pageParam }) =>
      getJobCaseTimeline(caseId as number, {
        limit: HISTORY_PAGE_SIZE,
        cursor: pageParam,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: caseId !== null && enabled,
  })
}
