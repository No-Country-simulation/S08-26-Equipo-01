import type { User } from '@/features/SystemDesign/types'
import UserStatusBadge from '../atoms/UserStatusBadge'

type UserCardProps = {
  user: User
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <article className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div>
          <h2 className="card-title">{user.name}</h2>
          <p className="text-sm text-base-content/70">@{user.username}</p>
        </div>
        <div className="mt-2 space-y-1 text-sm">
          <p>{user.email}</p>
          <p>{user.phone}</p>
          <p className="text-base-content/70">
            {user.address.city}, {user.address.street}
          </p>
        </div>
        <div className="card-actions justify-end">
          <UserStatusBadge company={user.company} />
        </div>
      </div>
    </article>
  )
}
