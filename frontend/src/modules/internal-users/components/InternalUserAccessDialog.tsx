import { useMemo, useState } from 'react'
import type { SystemRole } from '@/modules/auth'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  getInternalRoleDescription,
  getInternalRoleLabel,
  getInternalUserStatusPresentation,
  internalRoles,
} from '../model/internalUserPresenter'
import type {
  InternalUserAccessStatus,
  InternalUserDto,
} from '../types/internalUser.types'

interface InternalUserAccessDialogProps {
  user: InternalUserDto | null
  rolesSubmitting: boolean
  statusSubmitting: boolean
  rolesError: unknown
  statusError: unknown
  onClose: () => void
  onSaveRoles: (roles: SystemRole[]) => Promise<boolean>
  onChangeStatus: (status: InternalUserAccessStatus) => Promise<boolean>
}

export function InternalUserAccessDialog(
  props: InternalUserAccessDialogProps,
) {
  if (!props.user) return null

  return (
    <InternalUserAccessDialogContent
      key={props.user.id}
      {...props}
      user={props.user}
    />
  )
}

interface InternalUserAccessDialogContentProps
  extends Omit<InternalUserAccessDialogProps, 'user'> {
  user: InternalUserDto
}

function InternalUserAccessDialogContent({
  user,
  rolesSubmitting,
  statusSubmitting,
  rolesError,
  statusError,
  onClose,
  onSaveRoles,
  onChangeStatus,
}: InternalUserAccessDialogContentProps) {
  const [selectedRoles, setSelectedRoles] = useState<SystemRole[]>(
    () => user.roles,
  )

  const rolesChanged = useMemo(() => {
    if (user.roles.length !== selectedRoles.length) return true
    return user.roles.some((role) => !selectedRoles.includes(role))
  }, [selectedRoles, user.roles])

  const status = getInternalUserStatusPresentation(user.status)
  const pending =
    user.status === 'PENDING_ACTIVATION' ||
    user.status === 'PENDING_VERIFICATION'

  const toggleRole = (role: SystemRole) => {
    setSelectedRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role],
    )
  }

  const saveRoles = async () => {
    if (selectedRoles.length === 0) return
    await onSaveRoles(selectedRoles)
  }

  const nextStatus: InternalUserAccessStatus =
    user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="internal-user-access-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Administración · Acceso interno
            </p>
            <h2
              id="internal-user-access-title"
              className="mt-0.5 truncate text-[14px] font-semibold text-slate-950"
            >
              {user.firstName} {user.lastName}
            </h2>
            <p className="mt-0.5 truncate text-[9px] text-slate-500">
              {user.email}
            </p>
          </div>
          <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
            {status.label}
          </Badge>
        </div>

        <div className="space-y-4 px-4 py-3.5">
          <section>
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className="text-[10px] font-semibold text-slate-950">
                  Roles internos
                </h3>
                <p className="mt-0.5 text-[8px] leading-4 text-slate-400">
                  Debe conservar al menos un rol.
                </p>
              </div>

              <Button
                size="sm"
                className="!h-7 !px-2.5 !text-[8px]"
                disabled={
                  !rolesChanged ||
                  selectedRoles.length === 0 ||
                  rolesSubmitting ||
                  statusSubmitting
                }
                onClick={() => void saveRoles()}
              >
                {rolesSubmitting ? 'Guardando…' : 'Guardar roles'}
              </Button>
            </div>

            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {internalRoles.map((role) => {
                const selected = selectedRoles.includes(role)

                return (
                  <label
                    key={role}
                    className={
                      selected
                        ? 'flex cursor-pointer gap-2.5 rounded-lg border border-blue-300 bg-blue-50/70 px-3 py-2.5'
                        : 'flex cursor-pointer gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition hover:bg-slate-50'
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={rolesSubmitting || statusSubmitting}
                      onChange={() => toggleRole(role)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                    />
                    <span>
                      <span className="block text-[9px] font-semibold text-slate-900">
                        {getInternalRoleLabel(role)}
                      </span>
                      <span className="mt-0.5 block text-[7px] leading-3 text-slate-400">
                        {getInternalRoleDescription(role)}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>

            {selectedRoles.length === 0 ? (
              <p className="mt-2 text-[8px] text-red-600">
                El usuario debe conservar al menos un rol.
              </p>
            ) : null}

            {rolesError ? (
              <p
                role="alert"
                className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700"
              >
                {getErrorMessage(rolesError)}
              </p>
            ) : null}
          </section>

          <section className="border-t border-slate-100 pt-3">
            <h3 className="text-[10px] font-semibold text-slate-950">
              Estado de acceso
            </h3>

            {pending ? (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <div>
                  <p className="text-[9px] font-semibold text-amber-900">
                    Activación pendiente
                  </p>
                  <p className="mt-0.5 text-[8px] leading-4 text-amber-700">
                    La cuenta se activará cuando la persona complete la invitación y establezca su contraseña.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[9px] font-semibold text-slate-900">
                    {user.status === 'SUSPENDED'
                      ? 'Acceso suspendido'
                      : 'Acceso habilitado'}
                  </p>
                  <p className="mt-0.5 max-w-xl text-[8px] leading-4 text-slate-500">
                    {user.status === 'SUSPENDED'
                      ? 'Reactivar permite que la cuenta vuelva a autenticarse con sus roles actuales.'
                      : 'Suspender bloquea nuevos inicios de sesión. El backend protege al último administrador activo.'}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant={user.status === 'SUSPENDED' ? 'primary' : 'danger'}
                  className="!h-7 shrink-0 !px-2.5 !text-[8px]"
                  disabled={rolesSubmitting || statusSubmitting}
                  onClick={() => void onChangeStatus(nextStatus)}
                >
                  {statusSubmitting
                    ? 'Actualizando…'
                    : user.status === 'SUSPENDED'
                      ? 'Reactivar acceso'
                      : 'Suspender acceso'}
                </Button>
              </div>
            )}

            {statusError ? (
              <p
                role="alert"
                className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700"
              >
                {getErrorMessage(statusError)}
              </p>
            ) : null}
          </section>
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <Button
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={onClose}
            disabled={rolesSubmitting || statusSubmitting}
          >
            Cerrar
          </Button>
        </div>
      </section>
    </div>
  )
}
