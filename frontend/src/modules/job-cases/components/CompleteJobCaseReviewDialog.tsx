import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  getJobCaseClarificationSummary,
  getJobCaseMaterialSummary,
} from '../model/jobCasePresenter'
import type { JobCaseDetailDto } from '../types/jobCase.types'

interface CompleteJobCaseReviewDialogProps {
  open: boolean
  jobCase: JobCaseDetailDto
  submitting: boolean
  error: unknown
  onClose: () => void
  onConfirm: () => void
}

function SummaryRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-[9px] text-slate-500">{label}</dt>
      <dd className="max-w-[65%] text-right text-[9px] font-semibold text-slate-900">
        {value}
      </dd>
    </div>
  )
}

export function CompleteJobCaseReviewDialog({
  open,
  jobCase,
  submitting,
  error,
  onClose,
  onConfirm,
}: CompleteJobCaseReviewDialogProps) {
  if (!open) return null

  const clarificationSummary = getJobCaseClarificationSummary(
    jobCase.informationRequests,
  )
  const materialSummary = getJobCaseMaterialSummary(jobCase)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-review-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-5 py-4">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Cierre de revisión
          </p>
          <h2
            id="complete-review-title"
            className="mt-1 text-base font-semibold text-slate-950"
          >
            ¿Completar la revisión del expediente?
          </h2>
          <p className="mt-1.5 text-[10px] leading-5 text-slate-600">
            {jobCase.caseNumber} pasará a{' '}
            <strong className="font-semibold text-slate-900">
              Listo para cotizar
            </strong>
            .
          </p>
        </div>

        <div className="px-5 py-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-3">
            <p className="text-[9px] font-semibold text-amber-900">
              Esta acción cierra la etapa de revisión.
            </p>
            <p className="mt-1 text-[9px] leading-4 text-amber-800">
              Después de continuar ya no podrás modificar la especificación
              técnica ni solicitar nuevas aclaraciones desde esta etapa. Si
              existiera un error posterior, la revisión tendría que reabrirse
              mediante un flujo específico.
            </p>
          </div>

          <div className="mt-4">
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Verifica antes de continuar
            </p>

            <dl className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/45 px-3">
              <SummaryRow
                label="Material técnico"
                value={materialSummary}
              />
              <SummaryRow
                label="Documentación"
                value={`${jobCase.documents.length} archivo${
                  jobCase.documents.length === 1 ? '' : 's'
                } disponible${
                  jobCase.documents.length === 1 ? '' : 's'
                }`}
              />
              <SummaryRow
                label="Aclaraciones"
                value={clarificationSummary}
              />
            </dl>
          </div>

          {error ? (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[9px] leading-4 text-red-700"
            >
              {getErrorMessage(error)}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
            className="!h-8 !px-3 !text-[9px]"
          >
            Seguir revisando
          </Button>
          <Button
            onClick={onConfirm}
            disabled={submitting}
            className="!h-8 !px-3 !text-[9px]"
          >
            {submitting ? 'Completando…' : 'Completar revisión'}
          </Button>
        </div>
      </section>
    </div>
  )
}
