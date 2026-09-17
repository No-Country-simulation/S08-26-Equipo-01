import type { CustomerRequest } from '../types'

export const nextRequestNumber = (requests: CustomerRequest[]): string => {
  const max = requests.reduce((acc, request) => {
    const current = Number(request.requestNumber.replace('REQ-', ''))
    return Number.isNaN(current) ? acc : Math.max(acc, current)
  }, 0)
  return `REQ-${String(max + 1).padStart(3, '0')}`
}