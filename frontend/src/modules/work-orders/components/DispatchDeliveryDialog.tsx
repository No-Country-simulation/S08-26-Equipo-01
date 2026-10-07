import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  dispatchDeliverySchema,
  type DispatchDeliveryFormValues,
} from '../schemas/delivery.schemas'
import type { DeliveryDto } from '../types/delivery.types'

interface DispatchDeliveryDialogProps {
  delivery: DeliveryDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: DispatchDeliveryFormValues) => Promise<boolean>
}

export function DispatchDeliveryDialog({
  delivery,
  submitting,
  error,
  onClose,
  onSubmit,
}: DispatchDeliveryDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DispatchDeliveryFormValues>({
    resolver: zodResolver(dispatchDeliverySchema),
    defaultValues: { carrier: '', trackingNumber: '' },
  })

  if (!delivery) return null

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
        aria-labelledby="dispatch-delivery-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Entrega #{delivery.id}
          </p>
          <h2 id="dispatch-delivery-title" className="mt-0.5 text-[14px] font-semibold text-slate-950">
            Confirmar salida de planta
          </h2>
          <p className="mt-1 text-[9px] text-slate-500">
            Registra la salida real de planta. La entrega quedará marcada como en tránsito.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          <TextField
            label="Transportista (opcional)"
            maxLength={120}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.carrier?.message}
            {...register('carrier')}
          />
          <TextField
            label="Guía o número de seguimiento (opcional)"
            maxLength={160}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.trackingNumber?.message}
            {...register('trackingNumber')}
          />

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <Button variant="secondary" className="!h-7 !px-2.5 !text-[8px]" onClick={close} disabled={submitting}>Cancelar</Button>
          <Button type="submit" className="!h-7 !px-2.5 !text-[8px]" disabled={submitting}>
            {submitting ? 'Despachando…' : 'Confirmar despacho'}
          </Button>
        </div>
      </form>
    </div>
  )
}
