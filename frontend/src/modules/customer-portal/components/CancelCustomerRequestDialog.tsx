import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  cancelCustomerRequestSchema,
  type CancelCustomerRequestFormValues,
} from '../schemas/customerRequest.schemas'

interface CancelCustomerRequestDialogProps {
  open: boolean
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CancelCustomerRequestFormValues) => Promise<boolean>
}

export function CancelCustomerRequestDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: CancelCustomerRequestDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CancelCustomerRequestFormValues>({
    resolver: zodResolver(cancelCustomerRequestSchema),
    defaultValues: { reason: '' },
  })

  if (!open) return null

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
        aria-labelledby="cancel-request-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-red-100 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <header className="border-b border-red-100 bg-gradient-to-r from-white via-white to-red-50/70 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-red-600">
            Solicitud · Cancelación
          </p>
          <h2
            id="cancel-request-title"
            className="mt-0.5 text-[15px] font-semibold tracking-tight text-slate-950"
          >
            Cancelar solicitud
          </h2>
          <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
            La solicitud y su expediente asociado se cerrarán mientras aún están en revisión.
          </p>
        </header>

        <div className="px-4 py-4">
          <TextareaField
            label="Motivo (opcional)"
            labelClassName="!mb-1.5 !text-[10px]"
            className="!min-h-[68px] !resize-none !rounded-lg !px-3 !py-2 !text-[10px] !leading-4 !shadow-sm"
            maxLength={1000}
            error={errors.reason?.message}
            {...register('reason')}
          />

          {error ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[8px] leading-4 text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
          <Button
            variant="secondary"
            className="!h-8 !px-3 !text-[9px]"
            onClick={close}
            disabled={submitting}
          >
            Volver
          </Button>
          <Button
            variant="danger"
            type="submit"
            className="!h-8 !px-3 !text-[9px]"
            disabled={submitting}
          >
            {submitting ? 'Cancelando…' : 'Cancelar solicitud'}
          </Button>
        </footer>
      </form>
    </div>
  )
}
