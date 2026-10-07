import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  changePasswordSchema,
  ownProfileSchema,
  type ChangePasswordFormValues,
  type OwnProfileFormValues,
} from '../schemas/userProfile.schemas'
import type {
  ChangeOwnPasswordPayload,
  UpdateOwnProfilePayload,
  UserProfileStatus,
} from '../types/userProfile.types'

interface ProfileExperienceProps {
  profile: {
    firstName: string
    lastName: string
    email: string
    status: UserProfileStatus
    createdAt: string
    updatedAt: string
  }
  accountLabel: string
  accountDescription: string
  contextEyebrow: string
  contextTitle: string
  contextDescription: string
  contextContent: ReactNode
  extraMetricLabel: string
  extraMetricValue: string
  onUpdateProfile: (payload: UpdateOwnProfilePayload) => Promise<unknown>
  updatePending: boolean
  updateError: unknown
  onChangePassword: (payload: ChangeOwnPasswordPayload) => Promise<unknown>
  passwordPending: boolean
  passwordError: unknown
  resetPasswordMutation: () => void
}

export function ProfileExperience({
  profile,
  accountLabel,
  accountDescription,
  contextEyebrow,
  contextTitle,
  contextDescription,
  contextContent,
  extraMetricLabel,
  extraMetricValue,
  onUpdateProfile,
  updatePending,
  updateError,
  onChangePassword,
  passwordPending,
  passwordError,
  resetPasswordMutation,
}: ProfileExperienceProps) {
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)

  const profileForm = useForm<OwnProfileFormValues>({
    resolver: zodResolver(ownProfileSchema),
    defaultValues: { firstName: '', lastName: '' },
  })

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    profileForm.reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
    })
  }, [profile.firstName, profile.lastName, profileForm])

  const initials = useMemo(
    () => `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase(),
    [profile.firstName, profile.lastName],
  )

  const fullName = `${profile.firstName} ${profile.lastName}`.trim()

  const saveProfile = profileForm.handleSubmit(async (values) => {
    setProfileSaved(false)
    try {
      await onUpdateProfile({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
      })
      setProfileSaved(true)
    } catch {
      // El error se presenta con el estado de la mutación.
    }
  })

  const savePassword = passwordForm.handleSubmit(async (values) => {
    setPasswordSaved(false)
    try {
      await onChangePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      passwordForm.reset()
      setPasswordSaved(true)
      setPasswordOpen(false)
    } catch {
      // El error se presenta dentro del diálogo.
    }
  })

  return (
    <PageContainer className="py-4 lg:py-3">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
        <div className="absolute inset-y-0 left-0 w-1 bg-blue-600" />
        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-50" />
        <div className="relative flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
              <SidebarNavIcon name="users" className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-blue-600">
                Cuenta personal
              </p>
              <h1 className="mt-0.5 text-[20px] font-bold tracking-tight text-slate-950">
                Mi perfil
              </h1>
              <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500">
                {accountDescription}
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            <div>
              <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Tipo de cuenta
              </p>
              <p className="mt-0.5 text-[9px] font-semibold text-slate-700">{accountLabel}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.28fr)_minmax(320px,0.72fr)]">
        <form
          onSubmit={(event) => void saveProfile(event)}
          className="flex h-full min-h-[490px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]"
        >
          <div className="relative overflow-hidden border-b border-slate-200 bg-slate-950 px-5 py-5 sm:px-6">
            <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full border-[28px] border-blue-500/10" />
            <div className="absolute bottom-0 right-24 h-16 w-16 rounded-full bg-blue-500/5" />
            <div className="relative flex items-center gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-blue-600 text-[16px] font-bold tracking-wide text-white shadow-lg shadow-blue-950/20">
                {initials || 'QT'}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-slate-950 ${getStatusDotClass(profile.status)}`}
                />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-[16px] font-semibold tracking-tight text-white">
                    {fullName}
                  </h2>
                  <span className={`rounded-full border px-2 py-0.5 text-[7px] font-bold ${getStatusDarkClasses(profile.status)}`}>
                    {getStatusLabel(profile.status)}
                  </span>
                </div>
                <p className="mt-1 truncate text-[9px] text-slate-300">{profile.email}</p>
                <p className="mt-2 text-[8px] leading-3 text-slate-400">
                  {accountLabel} · identidad protegida por correo electrónico
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col px-4 py-4 sm:px-5">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Información personal
              </p>
              <div className="mt-1 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[12px] font-semibold text-slate-950">Datos de identificación</h3>
                  <p className="mt-1 max-w-xl text-[8px] leading-4 text-slate-400">
                    Nombre y apellido son los únicos datos personales editables desde aquí. Se normalizan automáticamente al guardar.
                  </p>
                </div>
                <span className="hidden rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[7px] font-semibold text-blue-700 sm:inline-block">
                  Editable
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <TextField
                label="Nombre"
                maxLength={100}
                disabled={updatePending}
                labelClassName="!mb-1.5 !text-[10px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={profileForm.formState.errors.firstName?.message}
                {...profileForm.register('firstName')}
              />
              <TextField
                label="Apellido"
                maxLength={100}
                disabled={updatePending}
                labelClassName="!mb-1.5 !text-[10px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={profileForm.formState.errors.lastName?.message}
                {...profileForm.register('lastName')}
              />
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[8px] font-medium text-slate-400">Correo electrónico</p>
                  <p className="mt-1 truncate text-[10px] font-semibold text-slate-700">{profile.email}</p>
                </div>
                <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-1 text-[7px] font-semibold text-slate-500">
                  Protegido
                </span>
              </div>
              <p className="mt-2 border-t border-slate-200 pt-2 text-[8px] leading-3 text-slate-400">
                El correo identifica tu acceso. Cambiarlo requiere verificar una nueva dirección, por eso no se modifica desde este formulario.
              </p>
            </div>

            {updateError ? (
              <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
                {getErrorMessage(updateError)}
              </p>
            ) : null}

            {profileSaved ? (
              <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[8px] leading-4 text-emerald-700">
                Tus datos personales se actualizaron correctamente.
              </p>
            ) : null}

            <div className="mt-auto grid grid-cols-3 gap-2 pt-5">
              <ProfileMetric label="Cuenta desde" value={formatDate(profile.createdAt)} />
              <ProfileMetric label="Actualizado" value={formatDate(profile.updatedAt)} />
              <ProfileMetric label={extraMetricLabel} value={extraMetricValue} emphasize />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 sm:px-5">
            <p className="text-[7px] leading-3 text-slate-400">Los cambios afectan cómo apareces dentro de QualityTrack.</p>
            <Button
              type="submit"
              className="!h-7 shrink-0 !px-3 !text-[8px]"
              disabled={updatePending || !profileForm.formState.isDirty}
            >
              {updatePending ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>

        <div className="flex h-full min-h-[490px] flex-col gap-4">
          <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/60 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-700">
                  <SidebarNavIcon name="users" className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-[7px] font-bold uppercase tracking-[0.14em] text-blue-600">{contextEyebrow}</p>
                  <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">{contextTitle}</h2>
                </div>
              </div>
              <p className="mt-2 text-[8px] leading-4 text-slate-400">{contextDescription}</p>
            </div>
            <div className="flex flex-1 flex-col px-4 py-4 sm:px-5">{contextContent}</div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
              <div>
                <p className="text-[7px] font-bold uppercase tracking-[0.14em] text-blue-600">Seguridad</p>
                <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">Contraseña de acceso</h2>
                <p className="mt-1 text-[8px] text-slate-400">Actualízala sin alterar tus roles ni tu cuenta.</p>
              </div>
              <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold tracking-[0.18em] text-slate-500">••••••</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 sm:px-5">
              <div className="min-w-0">
                {passwordSaved ? (
                  <p className="text-[8px] font-medium text-emerald-700">Contraseña actualizada correctamente.</p>
                ) : (
                  <p className="text-[8px] text-slate-400">Se solicitará tu contraseña actual.</p>
                )}
              </div>
              <Button
                variant="secondary"
                className="!h-7 shrink-0 !px-3 !text-[8px]"
                onClick={() => {
                  resetPasswordMutation()
                  passwordForm.reset()
                  setPasswordSaved(false)
                  setPasswordOpen(true)
                }}
              >
                Cambiar contraseña
              </Button>
            </div>
          </section>
        </div>
      </div>

      {passwordOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-change-password-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onSubmit={(event) => void savePassword(event)}
          >
            <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">Cuenta · Seguridad</p>
              <h2 id="profile-change-password-title" className="mt-0.5 text-[14px] font-semibold text-slate-950">
                Cambiar contraseña
              </h2>
              <p className="mt-1 text-[9px] leading-4 text-slate-500">Confirma tu contraseña actual antes de establecer una nueva.</p>
            </div>

            <div className="space-y-3.5 px-4 py-4">
              <TextField
                label="Contraseña actual"
                type="password"
                autoComplete="current-password"
                disabled={passwordPending}
                labelClassName="!mb-1.5 !text-[10px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register('currentPassword')}
              />
              <TextField
                label="Nueva contraseña"
                type="password"
                autoComplete="new-password"
                disabled={passwordPending}
                labelClassName="!mb-1.5 !text-[10px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={passwordForm.formState.errors.newPassword?.message}
                hint="Usa al menos 8 caracteres."
                {...passwordForm.register('newPassword')}
              />
              <TextField
                label="Confirmar nueva contraseña"
                type="password"
                autoComplete="new-password"
                disabled={passwordPending}
                labelClassName="!mb-1.5 !text-[10px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register('confirmPassword')}
              />

              {passwordError ? (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
                  {getErrorMessage(passwordError)}
                </p>
              ) : null}
            </div>

            <div className="flex justify-end gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
              <Button
                type="button"
                variant="secondary"
                className="!h-7 !px-2.5 !text-[8px]"
                onClick={() => {
                  passwordForm.reset()
                  resetPasswordMutation()
                  setPasswordOpen(false)
                }}
                disabled={passwordPending}
              >
                Cancelar
              </Button>
              <Button type="submit" className="!h-7 !px-2.5 !text-[8px]" disabled={passwordPending}>
                {passwordPending ? 'Actualizando…' : 'Actualizar contraseña'}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </PageContainer>
  )
}

function ProfileMetric({
  label,
  value,
  emphasize = false,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${emphasize ? 'border-blue-100 bg-blue-50/70' : 'border-slate-100 bg-slate-50/70'}`}>
      <p className={`text-[7px] font-semibold uppercase tracking-[0.1em] ${emphasize ? 'text-blue-500' : 'text-slate-400'}`}>{label}</p>
      <p className={`mt-1 truncate text-[9px] font-semibold ${emphasize ? 'text-blue-800' : 'text-slate-700'}`}>{value}</p>
    </div>
  )
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value))
}

function getStatusLabel(status: UserProfileStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Activo'
    case 'SUSPENDED':
      return 'Suspendido'
    case 'PENDING_ACTIVATION':
      return 'Pendiente de activación'
    case 'PENDING_VERIFICATION':
      return 'Pendiente de verificación'
  }
}

function getStatusDotClass(status: UserProfileStatus): string {
  if (status === 'ACTIVE') return 'bg-emerald-400'
  if (status === 'SUSPENDED') return 'bg-red-400'
  return 'bg-amber-400'
}

function getStatusDarkClasses(status: UserProfileStatus): string {
  if (status === 'ACTIVE') return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
  if (status === 'SUSPENDED') return 'border-red-400/20 bg-red-400/10 text-red-300'
  return 'border-amber-400/20 bg-amber-400/10 text-amber-300'
}
