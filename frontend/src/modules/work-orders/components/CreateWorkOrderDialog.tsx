import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { formatWorkOrderDate } from '../model/workOrderPresenter'
import {
  createWorkOrderSchema,
  type CreateWorkOrderFormValues,
} from '../schemas/createWorkOrder.schema'

interface CreateWorkOrderDialogProps {
  open: boolean
  quotationNumber: string
  quotationRevision: number
  customerName: string
  plannedQuantity: number
  agreedDeliveryDate: string | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CreateWorkOrderFormValues) => Promise<boolean>
}

const priorityOptions = [
  { value: 'LOW', label: 'Baja' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
] as const

export function CreateWorkOrderDialog({
  open,
  quotationNumber,
  quotationRevision,
  customerName,
  plannedQuantity,
  agreedDeliveryDate,
  submitting,
  error,
  onClose,
  onSubmit,
}: CreateWorkOrderDialogProps) {
  const [planningError, setPlanningError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkOrderFormValues>({
    resolver: zodResolver(createWorkOrderSchema),
    defaultValues: {
      priority: 'NORMAL',
      plannedStartDate: '',
      plannedEndDate: '',
    },
  })

  if (!open) return null

  const close = () => {
    reset()
    setPlanningError(null)
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    setPlanningError(null)

    if (values.plannedStartDate > values.plannedEndDate) {
      setPlanningError(
        'La fecha de inicio no puede ser posterior a la fecha de fin.',
      )
      return
    }

    if (agreedDeliveryDate && values.plannedEndDate >= agreedDeliveryDate) {
      setPlanningError(
        'La fabricación debe terminar antes de la fecha comprometida de entrega.',
      )
      return
    }

    if (await onSubmit(values)) {
      reset()
      setPlanningError(null)
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-work-order-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Nueva orden de trabajo
          </p>
          <h2
            id="create-work-order-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            Preparar paquete operativo
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            Convierte la revisión aprobada en una OT lista para preparación técnica.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          <section className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <DataItem label="Cotización" value={`${quotationNumber} · R${quotationRevision}`} />
            <DataItem label="Cliente" value={customerName} />
            <DataItem label="Cantidad" value={`${plannedQuantity} piezas`} />
            <DataItem label="Entrega" value={formatWorkOrderDate(agreedDeliveryDate)} />
          </section>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label
                htmlFor="work-order-priority"
                className="mb-1.5 block text-[10px] font-semibold text-slate-800"
              >
                Prioridad
              </label>
              <div className="relative">
                <select
                  id="work-order-priority"
                  className="h-8 w-full appearance-none rounded-lg border border-slate-300 bg-white px-2.5 pr-8 !text-[10px] !font-normal !leading-none text-slate-950 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  {...register('priority')}
                >
                  {priorityOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="text-[10px] font-normal"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                  fill="currentColor"
                >
                  <path d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </div>
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
          </div>

          <p className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-[8px] leading-4 text-slate-500">
            La cantidad se conserva como snapshot. La OT nace en preparación y
            documentos, routing y liberación se gestionan después.
          </p>

          {planningError ? (
            <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[8px] leading-4 text-amber-800">
              {planningError}
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <Button variant="secondary" className="!h-7 !px-2.5 !text-[8px]" onClick={close} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" className="!h-7 !px-2.5 !text-[8px]" disabled={submitting}>
            {submitting ? 'Creando orden…' : 'Crear orden de trabajo'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[7px] text-slate-400">{label}</p>
      <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-900">{value}</p>
    </div>
  )
}
