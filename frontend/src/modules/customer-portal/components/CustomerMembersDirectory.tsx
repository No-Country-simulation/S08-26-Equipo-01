import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { Badge, type BadgeProps } from '@/shared/components/ui/Badge'
import {
  formatCustomerCompanyDate,
  getCustomerMemberInitials,
  getCustomerRoleLabel,
} from '../model/customerCompanyPresenter'
import type {
  CustomerInvitationDto,
  CustomerMemberDto,
} from '../types/customerCompany.types'
import type { CustomerMembershipRole } from '../types/customerPortal.types'

const roleDescriptions: Record<CustomerMembershipRole, string> = {
  ADMIN: 'Gestiona empresa, miembros y solicitudes.',
  REQUESTER: 'Crea solicitudes y responde información.',
  VIEWER: 'Consulta el portal sin realizar cambios.',
}

const roleTones: Record<CustomerMembershipRole, BadgeProps['tone']> = {
  ADMIN: 'info',
  REQUESTER: 'success',
  VIEWER: 'neutral',
}

function memberStatusLabel(status: string): string {
  if (status === 'ACTIVE') return 'Activo'

  return status
    .toLocaleLowerCase('es-MX')
    .replaceAll('_', ' ')
    .replace(/^./, (value) => value.toLocaleUpperCase('es-MX'))
}

function invitationStatusLabel(invitation: CustomerInvitationDto): string {
  if (invitation.status === 'PENDING') return 'Pendiente'

  return invitation.status
    .toLocaleLowerCase('es-MX')
    .replaceAll('_', ' ')
    .replace(/^./, (value) => value.toLocaleUpperCase('es-MX'))
}

interface CustomerMembersDirectoryProps {
  view: 'members' | 'invitations'
  isAdmin: boolean
  visibleMembers: CustomerMemberDto[]
  visibleInvitations: CustomerInvitationDto[]
  invitations: CustomerInvitationDto[]
  invitationsPending: boolean
  invitationsError: unknown
  onChangeRole: (member: CustomerMemberDto) => void
  onRemove: (member: CustomerMemberDto) => void
  onCancelInvitation: (invitation: CustomerInvitationDto) => void
}

export function CustomerMembersDirectory({
  view,
  isAdmin,
  visibleMembers,
  visibleInvitations,
  invitations,
  invitationsPending,
  invitationsError,
  onChangeRole,
  onRemove,
  onCancelInvitation,
}: CustomerMembersDirectoryProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/35 p-3.5 sm:p-4">
      {view === 'members' ? (
        visibleMembers.length > 0 ? (
          <div className="space-y-2.5">
            {visibleMembers.map((member) => (
              <article
                key={member.membershipId}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-[0_8px_24px_-22px_rgba(15,23,42,0.34)] transition hover:border-slate-300"
              >
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(210px,0.55fr)_150px_auto] md:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[9px] font-bold text-blue-700 ring-1 ring-blue-100">
                      {getCustomerMemberInitials(
                        member.firstName,
                        member.lastName,
                      )}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-slate-950">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="mt-0.5 truncate text-[9px] text-slate-500">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <Badge
                      tone={roleTones[member.role]}
                      className="px-2 py-0.5 text-[8px]"
                    >
                      {getCustomerRoleLabel(member.role)}
                    </Badge>
                    <p className="mt-1 text-[8px] leading-4 text-slate-500">
                      {roleDescriptions[member.role]}
                    </p>
                  </div>

                  <div>
                    <Badge
                      tone={member.status === 'ACTIVE' ? 'success' : 'neutral'}
                      className="px-2 py-0.5 text-[8px]"
                    >
                      {memberStatusLabel(member.status)}
                    </Badge>
                    <p className="mt-1 text-[8px] text-slate-400">
                      {member.joinedAt
                        ? `Desde ${formatCustomerCompanyDate(member.joinedAt)}`
                        : 'Sin fecha de acceso'}
                    </p>
                  </div>

                  {isAdmin ? (
                    <div className="flex justify-end">
                      <details className="group relative">
                        <summary className="inline-flex h-7 cursor-pointer list-none items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[8px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 [&::-webkit-details-marker]:hidden">
                          Gestionar
                          <svg
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            className="h-3 w-3 text-slate-400 transition group-open:rotate-180"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m6.5 8 3.5 3.5L13.5 8" />
                          </svg>
                        </summary>

                        <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-[0_16px_38px_-20px_rgba(15,23,42,0.35)]">
                          <button
                            type="button"
                            onClick={(event) => {
                              onChangeRole(member)
                              event.currentTarget
                                .closest('details')
                                ?.removeAttribute('open')
                            }}
                            className="flex h-8 w-full items-center rounded-lg px-2.5 text-left text-[8px] font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                          >
                            Cambiar rol
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            type="button"
                            onClick={(event) => {
                              onRemove(member)
                              event.currentTarget
                                .closest('details')
                                ?.removeAttribute('open')
                            }}
                            className="flex h-8 w-full items-center rounded-lg px-2.5 text-left text-[8px] font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
                          >
                            Retirar acceso
                          </button>
                        </div>
                      </details>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <EmptyState
              title="No hay miembros que coincidan"
              description="Prueba con otro nombre, correo o rol."
            />
          </div>
        )
      ) : invitationsPending ? (
        <LoadingState label="Cargando invitaciones…" />
      ) : invitationsError ? (
        <ErrorState
          error={invitationsError}
          title="No pudimos cargar las invitaciones"
        />
      ) : visibleInvitations.length > 0 ? (
        <div className="space-y-2.5">
          {visibleInvitations.map((invitation) => (
            <article
              key={invitation.id}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-[0_8px_24px_-22px_rgba(15,23,42,0.34)]"
            >
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_130px_auto] md:items-center">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold text-slate-950">
                    {invitation.email}
                  </p>
                  <p className="mt-1 text-[8px] leading-4 text-slate-500">
                    Enviada {formatCustomerCompanyDate(invitation.createdAt)}
                    {' · '}vence{' '}
                    {formatCustomerCompanyDate(invitation.expiresAt)}
                  </p>
                </div>

                <div>
                  <Badge
                    tone={roleTones[invitation.role]}
                    className="px-2 py-0.5 text-[8px]"
                  >
                    {getCustomerRoleLabel(invitation.role)}
                  </Badge>
                  <p className="mt-1 text-[8px] leading-4 text-slate-500">
                    {roleDescriptions[invitation.role]}
                  </p>
                </div>

                <Badge
                  tone={invitation.status === 'PENDING' ? 'warning' : 'neutral'}
                  className="w-fit px-2 py-0.5 text-[8px]"
                >
                  {invitationStatusLabel(invitation)}
                </Badge>

                <button
                  type="button"
                  onClick={() => {
                    onCancelInvitation(invitation)
                  }}
                  className="inline-flex h-6 items-center justify-center rounded-md px-2 text-[7px] font-medium text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  Cancelar
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <EmptyState
            title={
              invitations.length === 0
                ? 'No hay invitaciones pendientes'
                : 'No hay invitaciones que coincidan'
            }
            description={
              invitations.length === 0
                ? 'Las nuevas invitaciones aparecerán aquí mientras esperan ser aceptadas.'
                : 'Prueba con otro correo o rol.'
            }
          />
        </div>
      )}
    </div>
  )
}
