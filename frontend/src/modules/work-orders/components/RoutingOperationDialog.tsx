import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  routingOperationSchema,
  type RoutingOperationFormValues,
} from '../schemas/workOrderPreparation.schemas'
import type { RoutingOperationDto } from '../types/workOrder.types'

interface RoutingOperationDialogProps {
  open: boolean
  operation?: RoutingOperationDto
  nextSequence: number
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: RoutingOperationFormValues) => Promise<boolean>
}

export function RoutingOperationDialog({
  open,
  operation,
  nextSequence,
  submitting,
  error,
  onClose,
  onSubmit,
}: RoutingOperationDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoutingOperationFormValues>({
    resolver: zodResolver(routingOperationSchema),
    defaultValues: {
      sequenceNumber: operation?.sequenceNumber ?? nextSequence,
      code: operation?.code ?? '',
      name: operation?.name ?? '',
      instructions: operation?.instructions ?? '',
      estimatedMinutes: operation?.estimatedMinutes ?? 30,
    },
  })

  useEffect(() => {
    reset({
      sequenceNumber: operation?.sequenceNumber ?? nextSequence,
      code: operation?.code ?? '',
      name: operation?.name ?? '',
      instructions: operation?.instructions ?? '',
      estimatedMinutes: operation?.estimatedMinutes ?? 30,
    })
  }, [nextSequence, operation, reset])

  if (!open) return null

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
        aria-labelledby="routing-operation-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Hoja de ruta
          </p>
          <h2
            id="routing-operation-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            {operation ? 'Editar operación' : 'Agregar operación'}
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            Define qué debe hacerse y cuánto tiempo se estima. La ejecución real
            se registra después.
          </p>
        </div>

        <div className="grid gap-3 px-4 py-3.5 sm:grid-cols-2">
          <TextField
            label="Secuencia"
            type="number"
            min="1"
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.sequenceNumber?.message}
            {...register('sequenceNumber', { valueAsNumber: true })}
          />
          <TextField
            label="Código"
            maxLength={40}
            placeholder="OP-010"
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.code?.message}
            {...register('code')}
          />
          <div className="sm:col-span-2">
            <TextField
              label="Nombre"
              maxLength={150}
              placeholder="Torneado exterior"
              labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.name?.message}
              {...register('name')}
            />
          </div>
          <TextField
            label="Tiempo estimado (min)"
            type="number"
            min="1"
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.estimatedMinutes?.message}
            {...register('estimatedMinutes', { valueAsNumber: true })}
          />
          <div className="sm:col-span-2">
            <TextareaField
              label="Instrucciones"
              placeholder="Indicaciones técnicas para ejecutar la operación…"
              labelClassName="!mb-1.5 !text-[10px]"
              className="!min-h-20 !rounded-lg !px-3 !py-2 !text-[10px] !shadow-none placeholder:!text-[9px]"
              error={errors.instructions?.message}
              {...register('instructions')}
            />
          </div>

          {error ? (
            <p className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <Button variant="secondary" className="!h-7 !px-2.5 !text-[8px]" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" className="!h-7 !px-2.5 !text-[8px]" disabled={submitting}>
            {submitting
              ? 'Guardando…'
              : operation
                ? 'Guardar cambios'
                : 'Agregar operación'}
          </Button>
        </div>
      </form>
    </div>
  )
}
