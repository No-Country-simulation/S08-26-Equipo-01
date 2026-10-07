import { useMemo, useState } from 'react'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { CancelCustomerInvitationDialog } from '../components/CancelCustomerInvitationDialog'
import { ChangeCustomerMemberRoleDialog } from '../components/ChangeCustomerMemberRoleDialog'
import { CustomerMembersDirectory } from '../components/CustomerMembersDirectory'
import { CustomerMembersHeader } from '../components/CustomerMembersHeader'
import { InviteCustomerMemberDialog } from '../components/InviteCustomerMemberDialog'
import { RemoveCustomerMemberDialog } from '../components/RemoveCustomerMemberDialog'
import { useCustomerPortalContext } from '../hooks/useCustomerPortalContext'
import {
  useCustomerInvitations,
  useCustomerMembers,
} from '../hooks/useCustomerCompany'
import { useCustomerCompanyMutations } from '../hooks/useCustomerCompanyMutations'
import { getCustomerRoleLabel } from '../model/customerCompanyPresenter'
import type { CustomerInvitationFormValues } from '../schemas/customerCompany.schemas'
import type {
  CustomerInvitationDto,
  CustomerMemberDto,
} from '../types/customerCompany.types'
import type { CustomerMembershipRole } from '../types/customerPortal.types'

type View = 'members' | 'invitations'

export function CustomerMembersPage() {
  const { customer } = useCustomerPortalContext()
  const isAdmin = customer.role === 'ADMIN'
  const membersQuery = useCustomerMembers(customer.customerId)
  const invitationsQuery = useCustomerInvitations(customer.customerId, isAdmin)
  const mutations = useCustomerCompanyMutations(customer.customerId)
  const [view, setView] = useState<View>('members')
  const [search, setSearch] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<CustomerMemberDto | null>(
    null,
  )
  const [roleTarget, setRoleTarget] = useState<CustomerMemberDto | null>(null)
  const [cancelInvitationTarget, setCancelInvitationTarget] =
    useState<CustomerInvitationDto | null>(null)

  const normalizedSearch = search.trim().toLocaleLowerCase('es-MX')

  const visibleMembers = useMemo(
    () =>
      (membersQuery.data ?? []).filter((member) => {
        if (!normalizedSearch) return true

        return [
          member.firstName,
          member.lastName,
          `${member.firstName} ${member.lastName}`,
          member.email,
          getCustomerRoleLabel(member.role),
        ].some((value) =>
          value.toLocaleLowerCase('es-MX').includes(normalizedSearch),
        )
      }),
    [membersQuery.data, normalizedSearch],
  )

  const visibleInvitations = useMemo(
    () =>
      (invitationsQuery.data ?? []).filter((invitation) => {
        if (!normalizedSearch) return true

        return [invitation.email, getCustomerRoleLabel(invitation.role)].some(
          (value) =>
            value.toLocaleLowerCase('es-MX').includes(normalizedSearch),
        )
      }),
    [invitationsQuery.data, normalizedSearch],
  )

  if (membersQuery.isPending) {
    return (
      <PageContainer className="py-3 lg:py-2">
        <LoadingState label="Cargando miembros…" />
      </PageContainer>
    )
  }

  if (membersQuery.isError) {
    return (
      <PageContainer className="py-3 lg:py-2">
        <ErrorState
          error={membersQuery.error}
          title="No pudimos cargar los miembros"
        />
      </PageContainer>
    )
  }

  const members = membersQuery.data
  const invitations = invitationsQuery.data ?? []
  const adminCount = members.filter((member) => member.role === 'ADMIN').length

  const invite = async (values: CustomerInvitationFormValues) => {
    try {
      await mutations.invite.mutateAsync({
        email: values.email.trim(),
        role: values.role,
      })
      return true
    } catch {
      return false
    }
  }

  const changeMemberRole = async (role: CustomerMembershipRole) => {
    if (!roleTarget) return false

    try {
      await mutations.updateMemberRole.mutateAsync({
        userId: roleTarget.userId,
        payload: { role },
      })
      setRoleTarget(null)
      return true
    } catch {
      return false
    }
  }

  const remove = async () => {
    if (!removeTarget) return false

    try {
      await mutations.removeMember.mutateAsync(removeTarget.userId)
      setRemoveTarget(null)
      return true
    } catch {
      return false
    }
  }

  const cancelInvitation = async () => {
    if (!cancelInvitationTarget) return false

    try {
      await mutations.cancelInvitation.mutateAsync(cancelInvitationTarget.id)
      setCancelInvitationTarget(null)
      return true
    } catch {
      return false
    }
  }

  const changeView = (nextView: View) => {
    setView(nextView)
    setSearch('')
  }

  return (
    <PageContainer className="py-3 lg:flex lg:h-[calc(100dvh-100px)] lg:min-h-0 lg:flex-col lg:overflow-hidden lg:py-2">
      <div className="shrink-0">
        <CustomerMembersHeader
          customerName={customer.customerName}
          total={members.length}
          admins={adminCount}
          pendingInvitations={
            isAdmin && !invitationsQuery.isPending ? invitations.length : null
          }
          isAdmin={isAdmin}
          onInvite={() => {
            mutations.invite.reset()
            setInviteOpen(true)
          }}
        />
      </div>

      <section className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-30px_rgba(15,23,42,0.38)]">
        <div className="shrink-0 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/70 px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Gestión de accesos
              </p>
              <h2 className="mt-0.5 text-[13px] font-semibold text-slate-950">
                {view === 'members'
                  ? 'Miembros de la empresa'
                  : 'Invitaciones pendientes'}
              </h2>
            </div>

            <label className="relative block lg:w-[340px]">
              <span className="sr-only">
                {view === 'members' ? 'Buscar miembros' : 'Buscar invitaciones'}
              </span>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  view === 'members'
                    ? 'Buscar por nombre, correo o rol…'
                    : 'Buscar por correo o rol…'
                }
                className="h-8 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-[10px] text-slate-900 outline-none transition placeholder:text-[9px] placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => changeView('members')}
              className={
                view === 'members'
                  ? 'inline-flex h-7 items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2.5 text-[8px] font-semibold text-blue-700 shadow-sm ring-2 ring-blue-100'
                  : 'inline-flex h-7 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[8px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50'
              }
            >
              Miembros
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[7px] text-slate-500">
                {members.length}
              </span>
            </button>

            {isAdmin ? (
              <button
                type="button"
                onClick={() => changeView('invitations')}
                className={
                  view === 'invitations'
                    ? 'inline-flex h-7 items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2.5 text-[8px] font-semibold text-blue-700 shadow-sm ring-2 ring-blue-100'
                    : 'inline-flex h-7 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[8px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50'
                }
              >
                Invitaciones
                <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[7px] text-amber-700">
                  {invitationsQuery.isPending ? '…' : invitations.length}
                </span>
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/65 px-4 py-2 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <p className="text-[9px] font-semibold text-slate-700">
              {view === 'members'
                ? `${visibleMembers.length} ${visibleMembers.length === 1 ? 'miembro visible' : 'miembros visibles'}`
                : `${visibleInvitations.length} ${visibleInvitations.length === 1 ? 'invitación visible' : 'invitaciones visibles'}`}
            </p>
          </div>

          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-[8px] font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Limpiar búsqueda
            </button>
          ) : null}
        </div>

        <CustomerMembersDirectory
          view={view}
          isAdmin={isAdmin}
          visibleMembers={visibleMembers}
          visibleInvitations={visibleInvitations}
          invitations={invitations}
          invitationsPending={invitationsQuery.isPending}
          invitationsError={
            invitationsQuery.isError ? invitationsQuery.error : null
          }
          onChangeRole={(member) => {
            mutations.updateMemberRole.reset()
            setRoleTarget(member)
          }}
          onRemove={(member) => {
            mutations.removeMember.reset()
            setRemoveTarget(member)
          }}
          onCancelInvitation={(invitation) => {
            mutations.cancelInvitation.reset()
            setCancelInvitationTarget(invitation)
          }}
        />

        {!isAdmin ? (
          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-2.5 sm:px-5">
            <p className="text-[8px] leading-4 text-slate-500">
              Tu rol puede consultar los miembros. Solo un administrador puede
              invitar o retirar accesos.
            </p>
          </div>
        ) : null}
      </section>

      <InviteCustomerMemberDialog
        open={inviteOpen}
        submitting={mutations.invite.isPending}
        error={mutations.invite.error}
        onClose={() => {
          mutations.invite.reset()
          setInviteOpen(false)
        }}
        onSubmit={invite}
      />

      <ChangeCustomerMemberRoleDialog
        member={roleTarget}
        submitting={mutations.updateMemberRole.isPending}
        error={mutations.updateMemberRole.error}
        onClose={() => {
          mutations.updateMemberRole.reset()
          setRoleTarget(null)
        }}
        onSubmit={changeMemberRole}
      />

      <CancelCustomerInvitationDialog
        invitation={cancelInvitationTarget}
        submitting={mutations.cancelInvitation.isPending}
        error={mutations.cancelInvitation.error}
        onClose={() => {
          mutations.cancelInvitation.reset()
          setCancelInvitationTarget(null)
        }}
        onConfirm={cancelInvitation}
      />

      <RemoveCustomerMemberDialog
        member={removeTarget}
        submitting={mutations.removeMember.isPending}
        error={mutations.removeMember.error}
        onClose={() => {
          mutations.removeMember.reset()
          setRemoveTarget(null)
        }}
        onConfirm={remove}
      />
    </PageContainer>
  )
}
