import { useEffect } from 'react'
import type { QuotationPreviewData } from '../schemas/quotation.schema'
import type { QuotationDetailDto } from '../types/quotation.types'
import { QuotationDocumentSheet } from './QuotationDocumentSheet'

interface QuotationPreviewDialogProps {
  quotation: QuotationDetailDto
  preview: QuotationPreviewData
  onClose: () => void
}

export function QuotationPreviewDialog({
  quotation,
  preview,
  onClose,
}: QuotationPreviewDialogProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const currency =
    preview.currency.trim().length === 3
      ? preview.currency.toUpperCase()
      : quotation.currency

  const materialName =
    quotation.source.materialSpecification?.materialName ??
    quotation.source.materialRequirement
  const materialStandard =
    quotation.source.materialSpecification?.standardOrGrade
  const materialLabel = [materialName, materialStandard]
    .filter(Boolean)
    .join(' / ')

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 sm:p-4"
      onMouseDown={onClose}
    >
      <div className="flex w-[min(86vw,820px)] max-h-[94vh] flex-col">
        <div className="mb-2 flex shrink-0 items-center justify-between px-1 text-white/80">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-200">
              Vista del cliente
            </p>
            <p className="mt-0.5 text-[9px] text-white/60">
              Previsualización antes de enviar la cotización
            </p>
          </div>

          <p className="text-[8px] text-white/55">Esc para volver</p>
        </div>

        <section
          role="dialog"
          aria-modal="true"
          aria-label="Vista previa de cotización"
          className="min-h-0 max-h-[88vh] overflow-y-auto rounded-2xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <QuotationDocumentSheet
            quotationNumber={quotation.quotationNumber}
            revision={quotation.revision}
            customerName={quotation.customerName}
            caseNumber={quotation.caseNumber}
            requestNumber={quotation.requestNumber}
            validUntil={preview.validUntil || null}
            estimatedDeliveryDate={preview.estimatedDeliveryDate || null}
            currency={currency}
            taxRate={preview.taxRate}
            subtotal={preview.totals.subtotal}
            tax={preview.totals.tax}
            total={preview.totals.total}
            materialLabel={
              materialLabel ||
              'Según especificación técnica de la solicitud'
            }
            compact
            items={preview.items.map((item, index) => ({
              key: item.id ?? `preview-${index}`,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.quantity * item.unitPrice,
            }))}
            className="rounded-2xl"
          />
        </section>
      </div>
    </div>
  )
}
