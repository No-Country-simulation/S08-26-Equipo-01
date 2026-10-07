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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_-32px_rgba(15,23,42,0.3)]">
      <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-2.5">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Accesos
          </p>
          <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
            Miembros activos
          </h2>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[8px] font-semibold text-slate-500">
          {members.length} usuario{members.length === 1 ? '' : 's'}
        </span>
      </div>

      {members.length > 0 ? (
        <div className="max-h-[188px] divide-y divide-slate-100 overflow-y-auto overscroll-contain">
          {members.map((member) => (
            <div
              key={member.membershipId}
              className="flex items-center justify-between gap-3 px-4 py-2.5 transition hover:bg-slate-50/70"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[8px] font-bold text-slate-700">
                  {getMemberInitials(member.firstName, member.lastName)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[9px] font-semibold text-slate-950">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="mt-0.5 truncate text-[8px] text-slate-400">
                    {member.email}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <Badge tone="info" className="px-2 py-0.5 text-[7px]">
                  {getInternalCustomerRoleLabel(member.role)}
                </Badge>
                <p className="mt-0.5 text-[7px] text-slate-400">
                  Desde {formatInternalCustomerDate(member.joinedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-6 text-center">
          <p className="text-[9px] font-medium text-slate-500">Sin miembros activos</p>
          <p className="mt-0.5 text-[8px] text-slate-400">
            Esta empresa no tiene accesos activos en este momento.
          </p>
        </div>
      )}
    </section>
  )
}
