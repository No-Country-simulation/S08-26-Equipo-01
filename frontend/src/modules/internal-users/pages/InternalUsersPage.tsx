import { useMemo, useState } from 'react'
import { useSessionStore, type SystemRole } from '@/modules/auth'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import {
  InternalListingBody,
  InternalListingHeader,
  InternalListingPanel,
  InternalListingResultsBar,
} from '@/shared/components/listing/InternalListing'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Button } from '@/shared/components/ui/Button'
import { InternalUserAccessDialog } from '../components/InternalUserAccessDialog'
import { InternalUserFilters } from '../components/InternalUserFilters'
import { InternalUsersTable } from '../components/InternalUsersTable'
import { InviteInternalUserDialog } from '../components/InviteInternalUserDialog'
import {
  useInternalUserMutations,
  useInternalUsers,
} from '../hooks/useInternalUsers'
import { matchesInternalUserSearch } from '../model/internalUserPresenter'
import type { InviteInternalUserFormValues } from '../schemas/internalUser.schemas'
import type {
  InternalUserAccessStatus,
  InternalUserDto,
  InternalUserFiltersValue,
} from '../types/internalUser.types'

const initialFilters: InternalUserFiltersValue = {
  search: '',
  role: 'ALL',
  status: 'ALL',
}

export function InternalUsersPage() {
  const session = useSessionStore((state) => state.session)
  const isAdmin = session?.user.roles.includes('ADMIN') ?? false
  const query = useInternalUsers(isAdmin)
  const mutations = useInternalUserMutations()
  const [filters, setFilters] = useState<InternalUserFiltersValue>(initialFilters)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<InternalUserDto | null>(null)

  const visibleUsers = useMemo(() => {
    const users = query.data ?? []

    return users.filter(
      (user) =>
        matchesInternalUserSearch(user, filters.search) &&
        (filters.role === 'ALL' || user.roles.includes(filters.role)) &&
        (filters.status === 'ALL' || user.status === filters.status),
    )
  }, [filters, query.data])

  if (!session || !isAdmin) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={new Error(
            'Esta sección está disponible únicamente para administradores internos.',
          )}
          title="Acceso administrativo requerido"
        />
      </PageContainer>
    )
  }

  if (query.isPending) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando usuarios internos…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={query.error}
          title="No pudimos cargar los usuarios internos"
        />
      </PageContainer>
    )
  }

  const users = query.data
  const active = users.filter((user) => user.status === 'ACTIVE').length
  const pending = users.filter(
    (user) => user.status === 'PENDING_ACTIVATION',
  ).length
  const suspended = users.filter((user) => user.status === 'SUSPENDED').length
  const hasFilters =
    filters.search.length > 0 ||
    filters.role !== 'ALL' ||
    filters.status !== 'ALL'

  const invite = async (values: InviteInternalUserFormValues) => {
    try {
      await mutations.invite.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        roles: values.roles,
      })
      return true
    } catch {
      return false
    }
  }

  const saveRoles = async (roles: SystemRole[]) => {
    if (!selectedUser) return false

    try {
      const updated = await mutations.updateRoles.mutateAsync({
        userId: selectedUser.id,
        payload: { roles },
      })
      setSelectedUser(updated)
      return true
    } catch {
      return false
    }
  }

  const changeStatus = async (status: InternalUserAccessStatus) => {
    if (!selectedUser) return false

    try {
      const updated = await mutations.updateStatus.mutateAsync({
        userId: selectedUser.id,
        payload: { status },
      })
      setSelectedUser(updated)
      return true
    } catch {
      return false
    }
  }

  return (
    <PageContainer className="py-4 lg:py-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
        <div className="px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
                <SidebarNavIcon name="users" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                  Administración
                </p>
                <h1 className="mt-0.5 text-[20px] font-bold tracking-tight text-slate-950">
                  Usuarios y accesos
                </h1>
                <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500">
                  Gestiona cuentas internas, roles operativos y disponibilidad de acceso.
                </p>
              </div>
            </div>

            <Button
              className="!h-8 shrink-0 !px-3 !text-[9px]"
              onClick={() => {
                mutations.invite.reset()
                setInviteOpen(true)
              }}
            >
              Invitar usuario
            </Button>
          </div>

          <div className="mt-4 grid border-t border-slate-200/80 pt-3 sm:grid-cols-4">
            <Metric label="Usuarios internos" value={users.length} />
            <Metric label="Activos" value={active} valueClassName="text-emerald-700" separated />
            <Metric label="Pendientes" value={pending} valueClassName="text-amber-700" separated />
            <Metric label="Suspendidos" value={suspended} valueClassName="text-red-600" separated />
          </div>
        </div>
      </section>

      <InternalListingPanel>
        <InternalListingHeader
          eyebrow="Control de acceso"
          title="Acceso interno"
          aside={
            <p className="text-[8px] font-medium text-slate-400">
              Gestiona roles y disponibilidad sin mezclar accesos de empresas cliente.
            </p>
          }
        />

        <InternalUserFilters value={filters} onChange={setFilters} />

        <InternalListingResultsBar
          count={visibleUsers.length}
          singular="usuario visible"
          plural="usuarios visibles"
          onClear={hasFilters ? () => setFilters(initialFilters) : undefined}
        />

        <InternalListingBody>
          {visibleUsers.length > 0 ? (
            <InternalUsersTable
              users={visibleUsers}
              currentUserId={session.user.id}
              onManage={(user) => {
                mutations.updateRoles.reset()
                mutations.updateStatus.reset()
                setSelectedUser(user)
              }}
            />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <EmptyState
                title="No hay usuarios que coincidan"
                description="Ajusta la búsqueda o los filtros para consultar otros accesos internos."
              />
            </div>
          )}
        </InternalListingBody>

        <p className="border-t border-slate-100 bg-white px-4 py-2 text-[7px] leading-3 text-slate-400 sm:px-5">
          Tu propio acceso debe modificarlo otro administrador. Los roles internos no se mezclan con los roles de las empresas cliente.
        </p>
      </InternalListingPanel>

      <InviteInternalUserDialog
        open={inviteOpen}
        submitting={mutations.invite.isPending}
        error={mutations.invite.error}
        onClose={() => {
          mutations.invite.reset()
          setInviteOpen(false)
        }}
        onSubmit={invite}
      />

      <InternalUserAccessDialog
        user={selectedUser}
        rolesSubmitting={mutations.updateRoles.isPending}
        statusSubmitting={mutations.updateStatus.isPending}
        rolesError={mutations.updateRoles.error}
        statusError={mutations.updateStatus.error}
        onClose={() => {
          mutations.updateRoles.reset()
          mutations.updateStatus.reset()
          setSelectedUser(null)
        }}
        onSaveRoles={saveRoles}
        onChangeStatus={changeStatus}
      />
    </PageContainer>
  )
}

function Metric({
  label,
  value,
  valueClassName = 'text-slate-950',
  separated = false,
}: {
  label: string
  value: number
  valueClassName?: string
  separated?: boolean
}) {
  return (
    <div
      className={
        separated
          ? 'border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1'
          : 'py-1 sm:pr-4'
      }
    >
      <p className="text-[8px] font-medium text-slate-400">{label}</p>
      <p className={`mt-0.5 text-[16px] font-bold ${valueClassName}`}>
        {value}
      </p>
    </div>
  )
}
