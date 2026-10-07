import { getSystemRoleLabel } from '@/modules/auth'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { ProfileExperience } from '../components/ProfileExperience'
import {
  useInternalProfile,
  useInternalProfileMutations,
} from '../hooks/useInternalProfile'

export function InternalProfilePage() {
  const profileQuery = useInternalProfile()
  const mutations = useInternalProfileMutations()

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

  return (
    <ProfileExperience
      profile={profile}
      accountLabel="Cuenta interna"
      accountDescription="Administra tu identidad personal y consulta el acceso operativo que tienes dentro de QualityTrack."
      contextEyebrow="Acceso operativo"
      contextTitle="Roles y permisos"
      contextDescription="Tu acceso se compone de roles asignados por la administración interna. Aquí puedes consultarlos, pero no modificarlos."
      extraMetricLabel="Roles"
      extraMetricValue={`${profile.roles.length} ${profile.roles.length === 1 ? 'asignado' : 'asignados'}`}
      contextContent={
        <>
          <div className="rounded-xl border border-blue-100 bg-blue-50/55 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-blue-500">
                  Alcance actual
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-800">
                  {profile.roles.length === 1
                    ? '1 rol habilitado'
                    : `${profile.roles.length} roles habilitados`}
                </p>
              </div>
              <span className="rounded-full border border-blue-100 bg-white px-2 py-1 text-[7px] font-semibold text-blue-700">
                Solo lectura
              </span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[8px] font-medium text-slate-400">Roles asignados</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[8px] font-semibold text-slate-700"
                >
                  {getSystemRoleLabel(role)}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <p className="text-[8px] font-semibold text-slate-600">
                Administración protegida
              </p>
              <p className="mt-1 text-[8px] leading-4 text-slate-400">
                Los roles y el estado de tu cuenta deben ser modificados por otro administrador interno. Incluso un administrador no puede alterar su propio acceso.
              </p>
            </div>
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
