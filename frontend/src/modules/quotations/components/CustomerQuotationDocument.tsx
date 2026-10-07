import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import type { CustomerQuotationDetailDto } from '../types/customerQuotation.types'
import { QuotationDocumentSheet } from './QuotationDocumentSheet'

interface CustomerQuotationDocumentProps {
  quotation: CustomerQuotationDetailDto
  customerName: string
}

export function CustomerQuotationDocument({
  quotation,
  customerName,
}: CustomerQuotationDocumentProps) {
  const printQuotation = () => {
    const previousTitle = document.title

    document.title = `${quotation.quotationNumber}-Rev-${quotation.revision}`
    document.body.classList.add('printing-customer-quotation')

    try {
      window.print()
    } finally {
      document.body.classList.remove('printing-customer-quotation')
      document.title = previousTitle
    }
  }

  const material = [
    quotation.source.materialName,
    quotation.source.standardOrGrade,
  ]
    .filter(Boolean)
    .join(' / ')

  return (
    <div className="flex h-full flex-col rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/25 p-3.5 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.28)]">
      <div className="customer-quotation-print-hidden mb-3 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <SidebarNavIcon name="quotations" className="h-[17px] w-[17px]" />
          </div>
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Propuesta comercial
            </p>
            <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
              Detalle de cotización
            </h2>
            <p className="mt-0.5 text-[8px] text-slate-500">
              Vista previa del documento enviado por Comercial.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={printQuotation}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-[8px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 8V3h10v5" />
            <rect x="5" y="14" width="14" height="7" rx="1.5" />
            <path d="M5 17H3V10a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7h-2" />
            <path d="M17 11h.01" />
          </svg>
          Imprimir
        </button>
      </div>

      <QuotationDocumentSheet
        quotationNumber={quotation.quotationNumber}
        revision={quotation.revision}
        customerName={customerName}
        caseNumber={quotation.caseNumber}
        requestNumber={quotation.requestNumber}
        validUntil={quotation.validUntil}
        estimatedDeliveryDate={quotation.estimatedDeliveryDate}
        currency={quotation.currency}
        taxRate={quotation.taxRate}
        subtotal={quotation.subtotal}
        tax={quotation.tax}
        total={quotation.total}
        materialLabel={
          material ||
          quotation.source.materialRequirement ||
          'Según especificación técnica de la solicitud'
        }
        items={quotation.items.map((item) => ({
          key: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        }))}
      />
    </div>
  )
}
