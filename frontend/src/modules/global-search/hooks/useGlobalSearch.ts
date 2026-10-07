import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getGlobalSearch } from '../api/globalSearch.api'

export const globalSearchKeys = {
  all: ['global-search'] as const,
  query: (query: string) => [...globalSearchKeys.all, query] as const,
}

export function useGlobalSearch(query: string) {
  const normalized = query.trim()
  const [debouncedQuery, setDebouncedQuery] = useState(normalized)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(normalized)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [normalized])

  const queryResult = useQuery({
    queryKey: globalSearchKeys.query(debouncedQuery),
    queryFn: () => getGlobalSearch(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  })

  return {
    ...queryResult,
    isDebouncing: normalized !== debouncedQuery,
  }
}
