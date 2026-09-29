function normalizeApiBaseUrl(value: string | undefined): string {
  const fallback = '/api/v1'
  const resolved = value?.trim() || fallback

  return resolved.endsWith('/') ? resolved.slice(0, -1) : resolved
}

export const env = {
  apiBaseUrl: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
} as const
