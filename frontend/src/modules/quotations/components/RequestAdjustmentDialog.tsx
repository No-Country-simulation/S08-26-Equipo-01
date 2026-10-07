import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  customerAdjustmentSchema,
  type CustomerAdjustmentFormValues,
} from '../schemas/customerQuotation.schemas'

interface RequestAdjustmentDialogProps {
  open: boolean
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CustomerAdjustmentFormValues) => Promise<boolean>
}

export function RequestAdjustmentDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: RequestAdjustmentDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerAdjustmentFormValues>({
    resolver: zodResolver(customerAdjustmentSchema),
    defaultValues: { notes: '' },
  })

  if (!open) return null

  const close = () => {
    reset()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="adjust-quotation-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl"
        onSubmit={handleSubmit(async (values) => {
          if (await onSubmit(values)) reset()
        })}
      >
        <header className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/70 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Solicitud · Cotización
          </p>
          <h2
            id="adjust-quotation-title"
            className="mt-0.5 text-[15px] font-semibold tracking-tight text-slate-950"
          >
            Solicitar ajuste
          </h2>
          <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
            Explica qué necesitas cambiar para que el equipo comercial prepare una nueva revisión.
          </p>
        </header>

        <div className="px-4 py-4">
          <TextareaField
            label="Ajuste solicitado"
            placeholder="Ej. Necesitamos revisar la fecha de entrega y el precio del tratamiento superficial."
            labelClassName="!mb-1.5 !text-[10px]"
            className="!min-h-[76px] !resize-none !rounded-lg !px-3 !py-2 !text-[10px] !leading-4 !shadow-sm"
            error={errors.notes?.message}
            {...register('notes')}
          />

          {error ? (
            <div
              role="alert"
              className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[8px] leading-4 text-red-700"
            >
              {getErrorMessage(error)}
            </div>
          ) : null}
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
          <Button
            variant="secondary"
            className="!h-8 !px-3 !text-[9px]"
            onClick={close}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="!h-8 !px-3 !text-[9px]"
            disabled={submitting}
          >
            {submitting ? 'Enviando…' : 'Solicitar ajuste'}
          </Button>
        </footer>
      </form>
    </div>
  )
}
