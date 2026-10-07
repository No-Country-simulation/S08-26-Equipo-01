import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import {
  formatInternalUserDate,
  getInternalRoleLabel,
  getInternalUserInitials,
  getInternalUserStatusPresentation,
} from '../model/internalUserPresenter'
import type { InternalUserDto } from '../types/internalUser.types'

interface InternalUsersTableProps {
  users: InternalUserDto[]
  currentUserId: string
  onManage: (user: InternalUserDto) => void
}

export function InternalUsersTable({
  users,
  currentUserId,
  onManage,
}: InternalUsersTableProps) {
  return (
    <div className="divide-y divide-slate-100">
      {users.map((user) => {
        const status = getInternalUserStatusPresentation(user.status)
        const isSelf = String(user.id) === currentUserId

        return (
          <article
            key={user.id}
            className="grid gap-3 px-4 py-3 transition hover:bg-blue-50/25 sm:px-5 lg:grid-cols-[minmax(220px,1.2fr)_minmax(250px,1fr)_140px_120px_100px] lg:items-center"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[9px] font-semibold text-blue-700 ring-1 ring-blue-100">
                {getInternalUserInitials(user)}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-[10px] font-semibold text-slate-950">
                    {user.firstName} {user.lastName}
                  </p>
                  {isSelf ? (
                    <Badge tone="neutral" className="px-2 py-0.5 text-[7px]">
                      Tu cuenta
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-[8px] text-slate-400">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {user.roles.map((role) => (
                <Badge key={role} tone="info" className="px-2 py-0.5 text-[7px]">
                  {getInternalRoleLabel(role)}
                </Badge>
              ))}
            </div>

            <Badge tone={status.tone} className="w-fit px-2 py-0.5 text-[7px]">
              {status.label}
            </Badge>

            <p className="text-[8px] text-slate-400">
              {formatInternalUserDate(user.createdAt)}
            </p>

            <div className="lg:text-right">
              <Button
                size="sm"
                variant="secondary"
                className="!h-7 !px-2.5 !text-[8px]"
                disabled={isSelf}
                onClick={() => onManage(user)}
              >
                {isSelf ? 'Tu acceso' : 'Gestionar'}
              </Button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
