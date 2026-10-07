import { Button } from '@/shared/components/ui/Button'
import {
  formatQuotationDate,
  formatQuotationMoney,
} from '../model/quotationPresenter'
import type { QuotationFormTotals } from '../schemas/quotation.schema'

interface QuotationTotalsCardProps {
  totals: QuotationFormTotals
  currency: string
  taxRate: number
  validUntil: string
  estimatedDeliveryDate: string
  editable: boolean
  saving: boolean
  sending: boolean
  actionError: string | null
  sendLabel: string
  onPreview: () => void
  onSend: () => void
}

export function QuotationTotalsCard({
  totals,
  currency,
  taxRate,
  validUntil,
  estimatedDeliveryDate,
  editable,
  saving,
  sending,
  actionError,
  sendLabel,
  onPreview,
  onSend,
}: QuotationTotalsCardProps) {
  const safeCurrency =
    currency.trim().length === 3 ? currency.toUpperCase() : 'MXN'

  return (
    <aside className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Resumen
        </p>
        <h2 className="mt-0.5 text-[13px] font-semibold text-slate-950">
          Resumen comercial
        </h2>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-3.5">
        <dl className="space-y-2.5 text-[8.5px]">
          <div className="flex justify-between gap-4 text-slate-500">
            <dt>Subtotal</dt>
            <dd className="font-semibold text-slate-900">
              {formatQuotationMoney(totals.subtotal, safeCurrency)}
            </dd>
          </div>

          <div className="flex justify-between gap-4 text-slate-500">
            <dt>IVA · {Number.isFinite(taxRate) ? taxRate : 0}%</dt>
            <dd className="font-semibold text-slate-900">
              {formatQuotationMoney(totals.tax, safeCurrency)}
            </dd>
          </div>

          <div className="border-t border-slate-200 pt-2.5">
            <div className="flex items-end justify-between gap-4">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="text-right text-[15px] font-bold tracking-tight text-slate-950">
                {formatQuotationMoney(totals.total, safeCurrency)}
              </dd>
            </div>
          </div>
        </dl>

        <section className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-[8px] font-bold text-slate-900">Condiciones</p>
          <ul className="mt-1.5 space-y-1.5 text-[7.5px] leading-3.5 text-slate-600">
            <li>
              • Vigencia:{' '}
              {validUntil
                ? 'hasta ' + formatQuotationDate(validUntil)
                : 'sin definir'}
            </li>
            <li>
              • Entrega estimada:{' '}
              {estimatedDeliveryDate
                ? formatQuotationDate(estimatedDeliveryDate)
                : 'sin definir'}
            </li>
            <li>• Precios en {safeCurrency} + IVA incluido en el total.</li>
          </ul>
        </section>

        {editable ? (
          <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2">
            <p className="text-[8px] font-semibold text-blue-900">
              ¿Todo listo?
            </p>
            <p className="mt-1 text-[7.5px] leading-4 text-blue-800/80">
              Revisa importes y condiciones. Al enviarla, esta revisión quedará
              congelada.
            </p>
          </div>
        ) : null}

        {actionError ? (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700"
          >
            {actionError}
          </p>
        ) : null}

        <div className="mt-auto space-y-1.5 pt-3">
          <Button
            size="sm"
            variant="secondary"
            className="!h-8 !w-full !justify-center !text-[8px]"
            onClick={onPreview}
            disabled={saving || sending}
          >
            Vista previa
          </Button>

          {editable ? (
            <Button
              size="sm"
              className="!h-8 !w-full !justify-center !text-[8px]"
              onClick={onSend}
              disabled={saving || sending}
            >
              {sending ? 'Enviando…' : sendLabel}
            </Button>
          ) : null}
        </div>
      </div>

      <p className="border-t border-slate-100 bg-slate-50/60 px-4 py-1.5 text-[6.5px] leading-3 text-slate-400">
        Los importes se recalculan y validan en backend al guardar o enviar.
      </p>
    </aside>
  )
}
