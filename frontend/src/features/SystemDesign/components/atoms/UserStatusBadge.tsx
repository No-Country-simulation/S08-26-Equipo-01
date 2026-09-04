import type { Company } from '@/features/SystemDesign/types'

type UserStatusBadgeProps = {
  company: Company
}

export default function UserStatusBadge({ company }: UserStatusBadgeProps) {
  return (
    <span className="badge badge-sm badge-outline badge-primary">
      {company.name}
    </span>
  )
}
