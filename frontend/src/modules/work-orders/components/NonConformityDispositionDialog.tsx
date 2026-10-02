import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import type { NonConformityDto } from '../types/quality.types'

interface NonConformityDispositionDialogProps {
  open: boolean
  nonConformity: NonConformityDto
  canRework: boolean
  canScrap: boolean
  canUseAsIs: boolean
  submitting: boolean
  error: unknown
  onClose: () => void
  onRework: () => void
  onScrap: () => void
  onUseAsIs: () => void
}

interface ChoiceProps {
  code: string
  title: string
  description: string
  permission: string
  enabled: boolean
  submitting: boolean
  onClick: () => void
}

function Choice({
  code,
  title,
  description,
  permission,
  enabled,
  submitting,
  onClick,
}: ChoiceProps) {
  return (
    <button
      type="button"
      disabled={!enabled || submitting}
      onClick={onClick}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-blue-200 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-blue-600">
            {code}
          </p>
          <p className="mt-0.5 text-[9px] font-semibold text-slate-950">
            {title}
          </p>
          <p className="mt-0.5 text-[8px] leading-4 text-slate-500">
            {description}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[7px] font-semibold text-slate-500">
          {enabled ? 'Elegir' : permission}
        </span>
      </div>
    </button>
  )
}

export function NonConformityDispositionDialog({
  open,
  nonConformity,
  canRework,
  canScrap,
  canUseAsIs,
  submitting,
  error,
  onClose,
  onRework,
  onScrap,
  onUseAsIs,
}: NonConformityDispositionDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nc-disposition-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="border-b border-red-100 bg-gradient-to-r from-white via-white to-red-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-red-600">
            {nonConformity.number}
          </p>
          <h2
            id="nc-disposition-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            Definir disposición
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            La decisión queda registrada sin modificar la inspección rechazada de origen.
          </p>
        </div>

        <div className="space-y-2 px-4 py-3.5">
          <Choice
            code="REWORK"
            title="Retrabajar"
            description="Crea una nueva revisión de routing ligada a la NC."
            permission="ENGINEERING"
            enabled={canRework}
            submitting={submitting}
            onClick={onRework}
          />
          <Choice
            code="SCRAP"
            title="Descartar"
            description="Retira la cantidad afectada y recalcula si la OT puede liberarse."
            permission="QUALITY / ENGINEERING"
            enabled={canScrap}
            submitting={submitting}
            onClick={onScrap}
          />
          <Choice
            code="USE_AS_IS"
            title="Aceptar bajo concesión"
            description="Conserva la desviación como evidencia y requiere autorización de ADMIN."
            permission="ADMIN"
            enabled={canUseAsIs}
            submitting={submitting}
            onClick={onUseAsIs}
          />

          <p className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-[8px] leading-4 text-amber-800">
            La disposición no puede cambiarse por otra una vez registrada.
          </p>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <Button
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  )
}
