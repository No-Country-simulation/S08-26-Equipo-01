import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  workOrderPlanningSchema,
  type WorkOrderPlanningFormValues,
} from '../schemas/workOrderPreparation.schemas'
import {
  formatWorkOrderDate,
  getWorkOrderPriorityLabel,
} from '../model/workOrderPresenter'
import type { WorkOrderDetailDto } from '../types/workOrder.types'

interface WorkOrderPlanningCardProps {
  workOrder: WorkOrderDetailDto
  canEdit: boolean
  saving: boolean
  error: unknown
  onSave: (values: WorkOrderPlanningFormValues) => Promise<boolean>
}

export function WorkOrderPlanningCard({
  workOrder,
  canEdit,
  saving,
  error,
  onSave,
}: WorkOrderPlanningCardProps) {
  const [editing, setEditing] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkOrderPlanningFormValues>({
    resolver: zodResolver(workOrderPlanningSchema),
    defaultValues: {
      priority: workOrder.priority,
      plannedStartDate: workOrder.plannedStartDate ?? '',
      plannedEndDate: workOrder.plannedEndDate ?? '',
    },
  })

  useEffect(() => {
    reset({
      priority: workOrder.priority,
      plannedStartDate: workOrder.plannedStartDate ?? '',
      plannedEndDate: workOrder.plannedEndDate ?? '',
    })
  }, [reset, workOrder])

  const submit = handleSubmit(async (values) => {
    setDateError(null)

    if (values.plannedStartDate > values.plannedEndDate) {
      setDateError(
        'La fecha de inicio no puede ser posterior a la fecha de fin.',
      )
      return
    }

    if (
      workOrder.agreedDeliveryDate &&
      values.plannedEndDate >= workOrder.agreedDeliveryDate
    ) {
      setDateError(
        'La fabricación debe terminar antes de la entrega comprometida.',
      )
      return
    }

    if (await onSave(values)) setEditing(false)
  })

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            01 · Planificación
          </p>
          <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
            Parámetros operativos
          </h2>
        </div>

        {canEdit && !editing ? (
          <Button
            size="sm"
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={() => setEditing(true)}
          >
            Editar planificación
          </Button>
        ) : null}
      </div>

      {editing ? (
        <form
          className="grid gap-3 px-4 py-3.5 lg:grid-cols-3"
          onSubmit={(event) => void submit(event)}
        >
          <div>
            <label
              htmlFor="planning-priority"
              className="mb-1.5 block text-[10px] font-semibold text-slate-800"
            >
              Prioridad
            </label>
            <select
              id="planning-priority"
              className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-[10px] text-slate-950 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              {...register('priority')}
            >
              <option value="LOW">Baja</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>

          <TextField
            label="Inicio planeado"
            type="date"
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.plannedStartDate?.message}
            {...register('plannedStartDate')}
          />

          <TextField
            label="Fin planeado"
            type="date"
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.plannedEndDate?.message}
            {...register('plannedEndDate')}
          />

          {dateError ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[8px] leading-4 text-amber-800 lg:col-span-3">
              {dateError}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700 lg:col-span-3">
              {getErrorMessage(error)}
            </p>
          ) : null}

          <div className="flex justify-end gap-1.5 lg:col-span-3">
            <Button
              variant="secondary"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={() => {
                reset()
                setDateError(null)
                setEditing(false)
              }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="!h-7 !px-2.5 !text-[8px]"
              disabled={saving}
            >
              {saving ? 'Guardando…' : 'Guardar planificación'}
            </Button>
          </div>
        </form>
      ) : (
        <dl className="grid gap-3 px-4 py-3.5 sm:grid-cols-2 lg:grid-cols-5">
          <DataItem label="Cantidad planeada" value={workOrder.plannedQuantity ?? 'Sin definir'} />
          <DataItem label="Prioridad" value={getWorkOrderPriorityLabel(workOrder.priority)} />
          <DataItem label="Inicio planeado" value={formatWorkOrderDate(workOrder.plannedStartDate)} />
          <DataItem label="Fin planeado" value={formatWorkOrderDate(workOrder.plannedEndDate)} />
          <DataItem label="Entrega comprometida" value={formatWorkOrderDate(workOrder.agreedDeliveryDate)} />
        </dl>
      )}
    </section>
  )
}

function DataItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[8px] font-medium text-slate-400">{label}</dt>
      <dd className="mt-1 text-[10px] font-semibold text-slate-800">{value}</dd>
    </div>
  )
}
