import {
  formatQuotationDate,
  formatQuotationMoney,
} from '../model/quotationPresenter'

interface QuotationDocumentSheetItem {
  key: string | number
  description: string
  quantity: number
  unitPrice: number
  subtotal: number
}

interface QuotationDocumentSheetProps {
  quotationNumber: string
  revision: number
  customerName: string
  caseNumber: string
  requestNumber: string
  validUntil: string | null
  estimatedDeliveryDate: string | null
  currency: string
  taxRate: number
  subtotal: number
  tax: number
  total: number
  items: QuotationDocumentSheetItem[]
  materialLabel?: string | null
  compact?: boolean
  className?: string
}

export function QuotationDocumentSheet({
  quotationNumber,
  revision,
  customerName,
  caseNumber,
  requestNumber,
  validUntil,
  estimatedDeliveryDate,
  currency,
  taxRate,
  subtotal,
  tax,
  total,
  items,
  materialLabel,
  compact = false,
  className = '',
}: QuotationDocumentSheetProps) {
  return (
    <article
      className={`customer-quotation-print-area quotation-document-sheet flex flex-col rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_-32px_rgba(15,23,42,0.4)] ${
        compact
          ? 'min-h-0 px-4 py-4 sm:px-5 sm:py-4'
          : 'min-h-0 px-4 py-4 sm:px-5 sm:py-5'
      } ${className}`}
    >
      <header
        className={`quotation-sheet-header flex items-start justify-between gap-4 border-b border-slate-200 ${
          compact ? 'pb-3' : 'pb-3.5'
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src="/brand/qualitytrack-mark.svg"
            alt="QualityTrack"
            className={compact ? 'h-9 w-9 shrink-0' : 'h-10 w-10 shrink-0'}
          />
          <div>
            <p
              className={
                compact
                  ? 'text-[12px] font-bold tracking-tight text-slate-950'
                  : 'text-[12px] font-bold tracking-tight text-slate-950'
              }
            >
              Quality<span className="text-blue-600">Track</span>
            </p>
            <p className="mt-0.5 text-[7px] uppercase tracking-[0.11em] text-slate-400">
              Gestión de calidad
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Cotización
          </p>
          <p className="mt-1 text-[12px] font-bold text-slate-950">
            {quotationNumber} · Rev. {revision}
          </p>
        </div>
      </header>

      <div
        className={`quotation-sheet-meta grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 sm:grid-cols-[1.5fr_0.75fr_0.75fr] ${
          compact ? 'mt-3 px-3.5 py-3' : 'mt-4 px-3.5 py-3'
        }`}
      >
        <div>
          <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Cliente
          </p>
          <p className="mt-1.5 text-[11px] font-semibold text-slate-900">
            {customerName}
          </p>
          <p className="mt-1 text-[8px] text-slate-400">
            {caseNumber} · {requestNumber}
          </p>
        </div>

        <div>
          <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Válida hasta
          </p>
          <p className="mt-1.5 text-[10px] font-semibold text-slate-900">
            {formatQuotationDate(validUntil)}
          </p>
        </div>

        <div>
          <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Entrega estimada
          </p>
          <p className="mt-1.5 text-[10px] font-semibold text-slate-900">
            {formatQuotationDate(estimatedDeliveryDate)}
          </p>
        </div>
      </div>

      <section className={`quotation-sheet-scope ${compact ? 'mt-4' : 'mt-5'}`}>
        <div className="flex items-center justify-between gap-4">
          <h3
            className={
              compact
                ? 'text-[11px] font-semibold text-slate-950'
                : 'text-[10px] font-semibold text-slate-950'
            }
          >
            Alcance comercial
          </h3>
          <span className="text-[8px] font-medium text-slate-400">
            {items.length} concepto{items.length === 1 ? '' : 's'}
          </span>
        </div>

        <div
          className={`overflow-hidden rounded-2xl border border-slate-200 bg-white ${
            compact ? 'mt-2' : 'mt-2'
          }`}
        >
          {items.length === 0 ? (
            <div className="bg-slate-50/70 px-4 py-5 text-center text-[9px] text-slate-400">
              Todavía no hay conceptos en esta revisión.
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.key}
                className={
                  index === 0
                    ? `grid gap-3 bg-slate-50/70 sm:grid-cols-[minmax(0,1fr)_115px_120px] ${
                        compact ? 'px-3.5 py-2.5' : 'px-3 py-3'
                      }`
                    : `grid gap-3 border-t border-slate-200 sm:grid-cols-[minmax(0,1fr)_115px_120px] ${
                        compact ? 'px-3.5 py-2.5' : 'px-3 py-3'
                      }`
                }
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold leading-5 text-slate-900">
                    {item.description || 'Concepto sin descripción'}
                  </p>
                  {index === 0 && materialLabel ? (
                    <p className="mt-1 text-[8px] leading-4 text-slate-400">
                      {materialLabel}
                    </p>
                  ) : null}
                </div>

                <p className="self-center text-right text-[9px] text-slate-600">
                  {item.quantity} ×{' '}
                  {formatQuotationMoney(item.unitPrice, currency)}
                </p>

                <p className="self-center text-right text-[11px] font-bold text-slate-950">
                  {formatQuotationMoney(item.subtotal, currency)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <div
        className={`quotation-sheet-bottom mt-auto grid gap-5 sm:grid-cols-[1fr_0.76fr] ${
          compact ? 'pt-5' : 'pt-6'
        }`}
      >
        <section>
          <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Condiciones comerciales
          </p>
          <ul
            className={
              compact
                ? 'mt-2 space-y-1 text-[7px] leading-3.5 text-slate-600'
                : 'mt-2 space-y-1 text-[6.5px] leading-3.5 text-slate-600'
            }
          >
            <li>• Precios expresados en {currency}.</li>
            <li>• Vigencia hasta el {formatQuotationDate(validUntil)}.</li>
            <li>
              • Entrega estimada: {formatQuotationDate(estimatedDeliveryDate)}.
            </li>
            <li>
              • La aprobación de esta propuesta no crea automáticamente la orden
              de trabajo.
            </li>
          </ul>
        </section>

        <dl
          className={`rounded-2xl border border-blue-100 bg-blue-50/45 ${
            compact ? 'px-3.5 py-3' : 'px-3 py-2.5'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[8px] text-slate-500">Subtotal</dt>
            <dd className="text-[10px] font-semibold text-slate-900">
              {formatQuotationMoney(subtotal, currency)}
            </dd>
          </div>

          <div className="mt-2 flex items-center justify-between gap-4">
            <dt className="text-[8px] text-slate-500">IVA · {taxRate}%</dt>
            <dd className="text-[10px] font-semibold text-slate-900">
              {formatQuotationMoney(tax, currency)}
            </dd>
          </div>

          <div className="mt-3.5 flex items-end justify-between gap-4 border-t border-blue-100 pt-3.5">
            <dt className="text-[8px] font-bold uppercase tracking-[0.08em] text-blue-700">
              Total
            </dt>
            <dd className="text-[17px] font-bold tracking-tight text-slate-950">
              {formatQuotationMoney(total, currency)}
            </dd>
          </div>
        </dl>
      </div>

      <footer
        className={`quotation-sheet-note border-t border-slate-100 ${
          compact ? 'mt-4 pt-3' : 'mt-5 pt-3'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-[7px] leading-4 text-slate-400">
            Documento representativo de la revisión vigente.
          </p>
          <p className="text-[7px] font-medium text-slate-400">
            QualityTrack · {quotationNumber}
          </p>
        </div>
      </footer>
    </article>
  )
}
