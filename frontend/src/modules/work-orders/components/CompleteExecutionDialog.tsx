import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  completeOperationExecutionSchema,
  type CompleteOperationExecutionFormValues,
} from '../schemas/production.schemas'
import type { OperationExecutionDto } from '../types/workOrder.types'

interface CompleteExecutionDialogProps {
  open: boolean
  execution: OperationExecutionDto | null
  plannedQuantity: number | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CompleteOperationExecutionFormValues) => Promise<boolean>
}

export function CompleteExecutionDialog({
  open,
  execution,
  plannedQuantity,
  submitting,
  error,
  onClose,
  onSubmit,
}: CompleteExecutionDialogProps) {
  const [quantityError, setQuantityError] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompleteOperationExecutionFormValues>({
    resolver: zodResolver(completeOperationExecutionSchema),
    defaultValues: {
      quantityProcessed: plannedQuantity ?? 1,
      quantityAccepted: plannedQuantity ?? 1,
      quantityRejected: 0,
      completionNotes: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      quantityProcessed: plannedQuantity ?? 1,
      quantityAccepted: plannedQuantity ?? 1,
      quantityRejected: 0,
      completionNotes: '',
    })
  }, [open, plannedQuantity, reset])

  const processed = useWatch({ control, name: 'quantityProcessed' })
  const accepted = useWatch({ control, name: 'quantityAccepted' })
  const rejected = useWatch({ control, name: 'quantityRejected' })

  if (!open || !execution) return null

  const close = () => {
    reset()
    setQuantityError(null)
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    setQuantityError(null)

    if (
      values.quantityAccepted + values.quantityRejected !==
      values.quantityProcessed
    ) {
      setQuantityError(
        'La cantidad procesada debe ser igual a aceptada + rechazada.',
      )
      return
    }

    if (await onSubmit(values)) {
      reset()
      setQuantityError(null)
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-execution-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-emerald-100 bg-gradient-to-r from-white via-white to-emerald-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-emerald-700">
            Producción · Finalizar ejecución
          </p>
          <h2
            id="complete-execution-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            {execution.operationCode} · {execution.operationName}
          </h2>
          <p className="mt-1 text-[9px] text-slate-500">
            Resultado real del intento #{execution.attemptNumber}.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          <div className="grid gap-3 sm:grid-cols-3">
            <TextField
              label="Procesadas"
              type="number"
              min="1"
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.quantityProcessed?.message}
              {...register('quantityProcessed', { valueAsNumber: true })}
            />
            <TextField
              label="Aceptadas"
              type="number"
              min="0"
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.quantityAccepted?.message}
              {...register('quantityAccepted', { valueAsNumber: true })}
            />
            <TextField
              label="Rechazadas"
              type="number"
              min="0"
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.quantityRejected?.message}
              {...register('quantityRejected', { valueAsNumber: true })}
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2">
            <span className="text-[8px] text-slate-500">
              Aceptadas + rechazadas
            </span>
            <span
              className={
                accepted + rejected === processed
                  ? 'text-[9px] font-semibold text-emerald-700'
                  : 'text-[9px] font-semibold text-amber-700'
              }
            >
              {accepted + rejected} / {processed}
            </span>
          </div>

          <TextareaField
            label="Notas de finalización"
            maxLength={2000}
            placeholder="Resultado, observaciones, desviaciones o condiciones encontradas…"
            labelClassName="!mb-1.5 !text-[10px]"
            className="!min-h-20 !rounded-lg !px-3 !py-2 !text-[10px] !shadow-none placeholder:!text-[9px]"
            error={errors.completionNotes?.message}
            {...register('completionNotes')}
          />

          {quantityError ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[8px] leading-4 text-amber-800">
              {quantityError}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
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
            Cancelar
          </Button>
          <Button
            type="submit"
            className="!h-7 !px-2.5 !text-[8px]"
            disabled={submitting}
          >
            {submitting ? 'Finalizando…' : 'Finalizar operación'}
          </Button>
        </div>
      </form>
    </div>
  )
}
