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
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        onSubmit={handleSubmit(async (values) => {
          if (await onSubmit(values)) {
            reset()
          }
        })}
      >
        <h2
          id="adjust-quotation-title"
          className="text-lg font-semibold text-slate-950"
        >
          Solicitar ajuste
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Explica con claridad qué debe cambiar. El equipo comercial preparará
          una nueva revisión.
        </p>

        <div className="mt-5">
          <TextareaField
            label="Ajuste solicitado"
            placeholder="Ej. Necesitamos revisar la fecha de entrega y el precio del tratamiento superficial."
            error={errors.notes?.message}
            {...register('notes')}
          />
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {getErrorMessage(error)}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={close} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Enviando…' : 'Solicitar ajuste'}
          </Button>
        </div>
      </form>
    </div>
  )
}
