export function getFragmentToken(hash: string): string | null {
  const normalized = hash.startsWith('#') ? hash.slice(1) : hash
  const token = new URLSearchParams(normalized).get('token')?.trim()
  return token ? token : null
}
