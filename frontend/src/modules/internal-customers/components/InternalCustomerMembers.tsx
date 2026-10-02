import { Badge } from '@/shared/components/ui/Badge'
import {
  formatInternalCustomerDate,
  getInternalCustomerRoleLabel,
  getMemberInitials,
} from '../model/internalCustomerPresenter'
import type { InternalCustomerMemberDto } from '../types/internalCustomer.types'

interface InternalCustomerMembersProps {
  members: InternalCustomerMemberDto[]
}

export function InternalCustomerMembers({
  members,
}: InternalCustomerMembersProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.32)]">
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/55 px-4 py-3">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Accesos
        </p>
        <div className="mt-0.5 flex items-center justify-between gap-3">
          <h2 className="text-[12px] font-semibold text-slate-950">
            Miembros activos
          </h2>
          <span className="text-[8px] font-medium text-slate-400">
            {members.length} usuarios
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {members.map((member) => (
          <div
            key={member.membershipId}
            className="flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[9px] font-bold text-slate-700">
                {getMemberInitials(member.firstName, member.lastName)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold text-slate-950">
                  {member.firstName} {member.lastName}
                </p>
                <p className="mt-0.5 truncate text-[8px] text-slate-400">
                  {member.email}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <Badge tone="info" className="px-2 py-0.5 text-[8px]">
                {getInternalCustomerRoleLabel(member.role)}
              </Badge>
              <p className="mt-1 text-[7px] text-slate-400">
                Desde {formatInternalCustomerDate(member.joinedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
