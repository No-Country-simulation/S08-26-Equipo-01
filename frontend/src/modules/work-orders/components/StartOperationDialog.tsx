import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { MachineDto } from '@/modules/machines'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  startOperationExecutionSchema,
  type StartOperationExecutionFormValues,
} from '../schemas/production.schemas'
import type { RoutingOperationDto } from '../types/workOrder.types'

interface StartOperationDialogProps {
  open: boolean
  operation: RoutingOperationDto | null
  operatorLabel: string
  machines: MachineDto[]
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: StartOperationExecutionFormValues) => Promise<boolean>
}

export function StartOperationDialog({
  open,
  operation,
  operatorLabel,
  machines,
  submitting,
  error,
  onClose,
  onSubmit,
}: StartOperationDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StartOperationExecutionFormValues>({
    resolver: zodResolver(startOperationExecutionSchema),
    defaultValues: {
      machineId: '',
      startNotes: '',
    },
  })

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  if (!open || !operation) return null

  const availableMachines = machines.filter(
    (machine) => machine.status === 'AVAILABLE',
  )

  const close = () => {
    reset()
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) reset()
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="start-operation-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Producción · Iniciar operación
          </p>
          <h2
            id="start-operation-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            {operation.code} · {operation.name}
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            Se registrará un nuevo intento con hora de inicio real.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 sm:grid-cols-2">
            <div>
              <p className="text-[7px] font-medium text-slate-400">Operador</p>
              <p className="mt-0.5 text-[9px] font-semibold text-slate-900">
                {operatorLabel}
              </p>
            </div>
            <div>
              <p className="text-[7px] font-medium text-slate-400">
                Tiempo estimado
              </p>
              <p className="mt-0.5 text-[9px] font-semibold text-slate-900">
                {operation.estimatedMinutes} min
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="execution-machine"
              className="mb-1.5 block text-[10px] font-semibold text-slate-800"
            >
              Máquina
            </label>
            <select
              id="execution-machine"
              className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-[10px] text-slate-950 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              {...register('machineId')}
            >
              <option value="">Sin máquina asignada</option>
              {availableMachines.map((machine) => (
                <option key={machine.id} value={String(machine.id)}>
                  {machine.code} · {machine.name} · {machine.type}
                </option>
              ))}
            </select>
            {availableMachines.length === 0 ? (
              <p className="mt-1 text-[8px] leading-4 text-amber-700">
                No hay máquinas disponibles. Puede iniciarse sin máquina si el proceso lo permite.
              </p>
            ) : null}
          </div>

          <TextareaField
            label="Notas de inicio"
            maxLength={2000}
            placeholder="Condiciones iniciales, preparación o indicaciones de turno…"
            labelClassName="!mb-1.5 !text-[10px]"
            className="!min-h-20 !rounded-lg !px-3 !py-2 !text-[10px] !shadow-none placeholder:!text-[9px]"
            error={errors.startNotes?.message}
            {...register('startNotes')}
          />

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
            {submitting ? 'Iniciando…' : 'Iniciar operación'}
          </Button>
        </div>
      </form>
    </div>
  )
}
