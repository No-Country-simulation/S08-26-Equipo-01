import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  customerRejectionSchema,
  type CustomerRejectionFormValues,
} from '../schemas/customerQuotation.schemas'

interface RejectQuotationDialogProps {
  open: boolean
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CustomerRejectionFormValues) => Promise<boolean>
}

export function RejectQuotationDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: RejectQuotationDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerRejectionFormValues>({
    resolver: zodResolver(customerRejectionSchema),
    defaultValues: { reason: '' },
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
        aria-labelledby="reject-quotation-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        onSubmit={handleSubmit(async (values) => {
          if (await onSubmit(values)) {
            reset()
          }
        })}
      >
        <h2
          id="reject-quotation-title"
          className="text-lg font-semibold text-slate-950"
        >
          Rechazar cotización
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          El motivo es opcional, pero puede ayudar al equipo comercial a cerrar
          correctamente el flujo.
        </p>

        <div className="mt-5">
          <TextareaField
            label="Motivo del rechazo"
            placeholder="Puedes indicar por qué no continuarás con esta propuesta."
            error={errors.reason?.message}
            {...register('reason')}
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
          <Button type="submit" variant="danger" disabled={submitting}>
            {submitting ? 'Rechazando…' : 'Rechazar cotización'}
          </Button>
        </div>
      </form>
    </div>
  )
}
