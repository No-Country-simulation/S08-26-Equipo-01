import type { User } from '@/features/SystemDesign/types'
import UserCard from '../molecules/UserCard'

type UserGridProps = {
  users: User[]
}

export default function UserGrid({ users }: UserGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
