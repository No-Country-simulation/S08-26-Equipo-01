import { REQUEST_STATUS_LABELS, STATUS_BADGE_CLASSES } from '../../constants'
import type { StatusBadgeProps } from '../../types/props'

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span className={`badge badge-sm ${STATUS_BADGE_CLASSES[status]}`}>
      {REQUEST_STATUS_LABELS[status]}
    </span>
  )
}