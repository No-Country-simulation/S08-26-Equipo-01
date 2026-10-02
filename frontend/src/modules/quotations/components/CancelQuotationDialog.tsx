import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  cancelQuotationSchema,
  type CancelQuotationFormValues,
} from '../schemas/quotationCancellation.schema'
import type { QuotationDetailDto } from '../types/quotation.types'

interface CancelQuotationDialogProps {
  quotation: QuotationDetailDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CancelQuotationFormValues) => Promise<boolean>
}

export function CancelQuotationDialog({
  quotation,
  submitting,
  error,
  onClose,
  onSubmit,
}: CancelQuotationDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CancelQuotationFormValues>({
    resolver: zodResolver(cancelQuotationSchema),
    defaultValues: { reason: '' },
  })

  if (!quotation) return null

  const close = () => {
    reset()
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) close()
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-quotation-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-red-100 bg-gradient-to-r from-white via-white to-red-50/70 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-red-600">
            {quotation.quotationNumber} · revisión {quotation.revision}
          </p>
          <h2
            id="cancel-quotation-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            Cancelar cotización
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            {quotation.status === 'SENT'
              ? 'El cliente dejará de poder responder esta revisión. El historial se conserva.'
              : 'El borrador quedará cerrado y conservará su historial.'}
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          <TextareaField
            label="Motivo (opcional)"
            maxLength={2000}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!min-h-20 !rounded-lg !px-3 !py-2 !text-[10px] !shadow-none placeholder:!text-[9px]"
            error={errors.reason?.message}
            {...register('reason')}
          />

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <Button
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={close}
            disabled={submitting}
          >
            Volver
          </Button>
          <Button
            variant="danger"
            type="submit"
            className="!h-7 !px-2.5 !text-[8px]"
            disabled={submitting}
          >
            {submitting ? 'Cancelando…' : 'Cancelar cotización'}
          </Button>
        </div>
      </form>
    </div>
  )
}
