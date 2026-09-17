import { CANCELLED_TOOLTIP, UNDER_REVIEW_TOOLTIP } from '../constants'
import type { CustomerRequestStatus } from '../types'

export const getCancellationTooltip = (
  status: CustomerRequestStatus,
): string =>
  status === 'CANCELLED' ? CANCELLED_TOOLTIP : UNDER_REVIEW_TOOLTIP