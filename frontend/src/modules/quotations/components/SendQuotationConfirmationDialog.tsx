import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  formatQuotationDate,
  formatQuotationMoney,
} from '../model/quotationPresenter'
import type { QuotationPreviewData } from '../schemas/quotation.schema'
import type { QuotationDetailDto } from '../types/quotation.types'

interface SendQuotationConfirmationDialogProps {
  quotation: QuotationDetailDto
  preview: QuotationPreviewData
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

export function SendQuotationConfirmationDialog({
  quotation,
  preview,
  submitting,
  error,
  onClose,
  onConfirm,
}: SendQuotationConfirmationDialogProps) {
  const currency =
    preview.currency.trim().length === 3
      ? preview.currency.toUpperCase()
      : quotation.currency
  const isAdjustmentRevision = Boolean(quotation.adjustmentNotes)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-quotation-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/70 px-5 py-4">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Confirmar envío
          </p>
          <h2
            id="send-quotation-title"
            className="mt-1 text-base font-semibold text-slate-950"
          >
            ¿Enviar esta revisión al cliente?
          </h2>
          <p className="mt-1.5 text-[10px] leading-5 text-slate-600">
            {quotation.quotationNumber} · Revisión {quotation.revision}
          </p>
        </div>

        <div className="px-5 py-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50/55 px-3.5 py-3">
            <p className="text-[9px] font-semibold text-blue-950">
              Esta revisión quedará congelada al enviarse.
            </p>
            <p className="mt-1 text-[9px] leading-4 text-blue-900/75">
              Confirma importes y condiciones antes de continuar. Después del
              envío ya no podrás editar directamente esta revisión.
            </p>
          </div>

          <div className="mt-4">
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Resumen del envío
            </p>

            <dl className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/45 px-3">
              <SummaryRow
                label="Total"
                value={formatQuotationMoney(preview.totals.total, currency)}
              />
              <SummaryRow
                label="Vigencia"
                value={formatQuotationDate(preview.validUntil || null)}
              />
              <SummaryRow
                label="Entrega estimada"
                value={formatQuotationDate(
                  preview.estimatedDeliveryDate || null,
                )}
              />
              <SummaryRow
                label="Conceptos"
                value={`${preview.items.length} concepto${
                  preview.items.length === 1 ? '' : 's'
                }`}
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
            variant="secondary"
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
            {submitting
              ? 'Enviando…'
              : isAdjustmentRevision
                ? 'Enviar nueva revisión'
                : 'Enviar cotización'}
          </Button>
        </div>
      </section>
    </div>
  )
}
