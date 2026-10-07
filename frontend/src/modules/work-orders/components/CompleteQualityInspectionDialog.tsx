import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { countQualityCheckResults } from '../model/qualityPresenter'
import type { QualityInspectionDto } from '../types/quality.types'

interface CompleteQualityInspectionDialogProps {
  inspection: QualityInspectionDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onConfirm: () => Promise<boolean>
}

export function CompleteQualityInspectionDialog({
  inspection,
  submitting,
  error,
  onClose,
  onConfirm,
}: CompleteQualityInspectionDialogProps) {
  if (!inspection) return null

  const totals = countQualityCheckResults(inspection.checks)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-quality-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Calidad · Cerrar inspección
          </p>
          <h2
            id="complete-quality-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            Finalizar inspección #{inspection.id}
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            El resultado queda histórico y no se sobrescribe después.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          <div className="grid divide-y divide-slate-100 rounded-lg border border-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <Metric label="Controles" value={inspection.checks.length} />
            <Metric label="PASS" value={totals.pass} valueClassName="text-emerald-700" />
            <Metric label="FAIL" value={totals.fail} valueClassName="text-red-600" />
          </div>

          {totals.fail > 0 ? (
            <div className="rounded-lg border border-red-200 bg-red-50/70 px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <Badge tone="danger" className="px-2 py-0.5 text-[7px]">
                  REJECTED
                </Badge>
                <p className="text-[9px] font-semibold text-red-900">
                  Se abrirá una no conformidad
                </p>
              </div>
              <p className="mt-1 text-[8px] leading-4 text-red-700">
                La inspección se conserva, se crea una NC OPEN y la OT pasa a QUALITY_HOLD.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <Badge tone="success" className="px-2 py-0.5 text-[7px]">
                  APPROVED
                </Badge>
                <p className="text-[9px] font-semibold text-emerald-900">
                  La orden podrá avanzar
                </p>
              </div>
              <p className="mt-1 text-[8px] leading-4 text-emerald-700">
                La OT pasará a READY_FOR_DELIVERY, todavía sin marcarse como entregada.
              </p>
            </div>
          )}

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <Button
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant={totals.fail > 0 ? 'danger' : 'primary'}
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={() => void onConfirm()}
            disabled={submitting}
          >
            {submitting ? 'Finalizando…' : 'Finalizar inspección'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  valueClassName = 'text-slate-950',
}: {
  label: string
  value: number
  valueClassName?: string
}) {
  return (
    <div className="px-3 py-2.5">
      <p className="text-[7px] text-slate-400">{label}</p>
      <p className={`mt-0.5 text-[13px] font-bold ${valueClassName}`}>
        {value}
      </p>
    </div>
  )
}
