import { useParams } from 'react-router-dom'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { ProfileExperience } from '../components/ProfileExperience'
import {
  useCustomerProfile,
  useCustomerProfileMutations,
} from '../hooks/useCustomerProfile'
import type { CustomerProfileRole } from '../types/userProfile.types'

const roleLabels: Record<CustomerProfileRole, string> = {
  ADMIN: 'Administrador',
  REQUESTER: 'Solicitante',
  VIEWER: 'Consulta',
}

export function CustomerProfilePage() {
  const { customerId } = useParams()
  const profileQuery = useCustomerProfile()
  const mutations = useCustomerProfileMutations()

  if (profileQuery.isPending) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando tu perfil…" />
      </PageContainer>
    )
  }

  if (profileQuery.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={profileQuery.error}
          title="No pudimos cargar tu perfil"
        />
      </PageContainer>
    )
  }

  const profile = profileQuery.data
  const selectedCustomerId = Number(customerId)
  const currentMembership = profile.memberships.find(
    (membership) => membership.customerId === selectedCustomerId,
  )
  const otherMemberships = profile.memberships.filter(
    (membership) => membership.customerId !== selectedCustomerId,
  )

  return (
    <ProfileExperience
      profile={profile}
      accountLabel="Cuenta de cliente"
      accountDescription="Administra tu identidad personal y consulta cómo participas dentro de la empresa seleccionada."
      contextEyebrow="Empresa y acceso"
      contextTitle="Contexto actual"
      contextDescription="Tu perfil es personal. La empresa y el rol pertenecen a tu membresía y se administran de forma independiente."
      extraMetricLabel="Empresas"
      extraMetricValue={`${profile.memberships.length} ${profile.memberships.length === 1 ? 'vinculada' : 'vinculadas'}`}
      contextContent={
        <>
          <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
            <div className="absolute -right-5 -top-7 h-20 w-20 rounded-full border-[18px] border-blue-100/70" />
            <div className="relative">
              <p className="text-[7px] font-bold uppercase tracking-[0.13em] text-blue-500">
                Empresa seleccionada
              </p>
              <p className="mt-1.5 text-[12px] font-semibold leading-4 text-slate-900">
                {currentMembership?.customerName ?? 'Sin empresa seleccionada'}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full border border-blue-100 bg-white px-2.5 py-1 text-[8px] font-semibold text-blue-700">
                  {currentMembership
                    ? roleLabels[currentMembership.role]
                    : 'Sin rol disponible'}
                </span>
                <span className="text-[8px] text-slate-400">Rol dentro de esta empresa</span>
              </div>
            </div>
          </div>

          {otherMemberships.length > 0 ? (
            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[8px] font-medium text-slate-400">Otras empresas vinculadas</p>
                <span className="text-[7px] font-semibold text-slate-400">{otherMemberships.length}</span>
              </div>
              <div className="mt-2 space-y-1.5">
                {otherMemberships.map((membership) => (
                  <div
                    key={membership.customerId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[8px] font-semibold text-slate-700">
                        {membership.customerName}
                      </p>
                      <p className="mt-0.5 text-[7px] text-slate-400">Membresía activa</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-1 text-[7px] font-semibold text-slate-500">
                      {roleLabels[membership.role]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[8px] font-semibold text-slate-600">Una sola empresa vinculada</p>
              <p className="mt-1 text-[8px] leading-4 text-slate-400">
                Si otra empresa te invita con este mismo correo, aparecerá aquí como un contexto adicional.
              </p>
            </div>
          )}

          <div className="mt-auto pt-4">
            <p className="border-t border-slate-100 pt-3 text-[8px] leading-4 text-slate-400">
              El rol y la pertenencia a una empresa se administran desde Miembros. Cambiar tu nombre no modifica tus permisos.
            </p>
          </div>
        </>
      }
      onUpdateProfile={(payload) => mutations.updateProfile.mutateAsync(payload)}
      updatePending={mutations.updateProfile.isPending}
      updateError={mutations.updateProfile.error}
      onChangePassword={(payload) => mutations.changePassword.mutateAsync(payload)}
      passwordPending={mutations.changePassword.isPending}
      passwordError={mutations.changePassword.error}
      resetPasswordMutation={() => mutations.changePassword.reset()}
    />
  )
}
