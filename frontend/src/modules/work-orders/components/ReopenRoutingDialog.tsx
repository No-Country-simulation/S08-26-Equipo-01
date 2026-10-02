import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  reopenRoutingSchema,
  type ReopenRoutingFormValues,
} from '../schemas/workOrderPreparation.schemas'

interface ReopenRoutingDialogProps {
  open: boolean
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: ReopenRoutingFormValues) => Promise<boolean>
}

export function ReopenRoutingDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: ReopenRoutingDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReopenRoutingFormValues>({
    resolver: zodResolver(reopenRoutingSchema),
    defaultValues: { reason: '' },
  })

  if (!open) return null

  const close = () => {
    reset()
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) {
      reset()
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="reopen-routing-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-amber-100 bg-gradient-to-r from-white via-white to-amber-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-amber-700">
            Corrección controlada
          </p>
          <h2
            id="reopen-routing-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            Reabrir hoja de ruta
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            La ruta volverá de APPROVED a DRAFT. El motivo quedará registrado en
            trazabilidad.
          </p>
        </div>

        <div className="px-4 py-3.5">
          <TextareaField
            label="Motivo de reapertura"
            maxLength={1000}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!min-h-20 !rounded-lg !px-3 !py-2 !text-[10px] !shadow-none placeholder:!text-[9px]"
            error={errors.reason?.message}
            {...register('reason')}
          />

          {error ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <Button variant="secondary" className="!h-7 !px-2.5 !text-[8px]" onClick={close} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" className="!h-7 !px-2.5 !text-[8px]" disabled={submitting}>
            {submitting ? 'Reabriendo…' : 'Reabrir para corregir'}
          </Button>
        </div>
      </form>
    </div>
  )
}
