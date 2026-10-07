import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  createDeliverySchema,
  type CreateDeliveryFormValues,
} from '../schemas/delivery.schemas'
import type { WorkOrderDeliveryDestinationDto } from '../types/workOrder.types'

interface CreateDeliveryDialogProps {
  open: boolean
  availableQuantity: number
  requestedDestination: WorkOrderDeliveryDestinationDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CreateDeliveryFormValues) => Promise<boolean>
}

function defaults(
  availableQuantity: number,
  requestedDestination: WorkOrderDeliveryDestinationDto | null,
): CreateDeliveryFormValues {
  const hasAddress =
    requestedDestination?.mode === 'SAVED_ADDRESS' ||
    requestedDestination?.mode === 'CUSTOM_ADDRESS'

  return {
    quantity: availableQuantity || 1,
    destinationLabel: hasAddress ? requestedDestination.label ?? '' : '',
    destinationContactName:
      hasAddress ? requestedDestination.contactName ?? '' : '',
    destinationAddress: hasAddress ? requestedDestination.address ?? '' : '',
    destinationCity: hasAddress ? requestedDestination.city ?? '' : '',
    destinationState: hasAddress ? requestedDestination.state ?? '' : '',
    destinationPostalCode:
      hasAddress ? requestedDestination.postalCode ?? '' : '',
    destinationCountry:
      hasAddress ? requestedDestination.country ?? 'México' : 'México',
    destinationInstructions:
      hasAddress ? requestedDestination.deliveryInstructions ?? '' : '',
    deliveryMethod:
      requestedDestination?.mode === 'CUSTOMER_PICKUP'
        ? 'Recolección en planta'
        : 'Entrega local',
  }
}

export function CreateDeliveryDialog({
  open,
  availableQuantity,
  requestedDestination,
  submitting,
  error,
  onClose,
  onSubmit,
}: CreateDeliveryDialogProps) {
  const [quantityError, setQuantityError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDeliveryFormValues>({
    resolver: zodResolver(createDeliverySchema),
    defaultValues: defaults(availableQuantity, requestedDestination),
  })

  useEffect(() => {
    if (!open) return
    reset(defaults(availableQuantity, requestedDestination))
  }, [availableQuantity, open, requestedDestination, reset])

  if (!open) return null

  const close = () => {
    reset()
    setQuantityError(null)
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    setQuantityError(null)

    if (values.quantity > availableQuantity) {
      setQuantityError(
        `Solo hay ${availableQuantity} pieza${availableQuantity === 1 ? '' : 's'} disponibles para reservar.`,
      )
      return
    }

    if (await onSubmit(values)) close()
  })

  const hasRequestedAddress =
    requestedDestination?.mode === 'SAVED_ADDRESS' ||
    requestedDestination?.mode === 'CUSTOM_ADDRESS'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-delivery-title"
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Entrega · Preparación
          </p>
          <h2
            id="create-delivery-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            Preparar despacho
          </h2>
          <p className="mt-1 text-[9px] text-slate-500">
            {availableQuantity} piezas disponibles para reservar.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          {hasRequestedAddress ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/55 px-3 py-2.5">
              <p className="text-[8px] font-semibold text-emerald-800">
                Destino acordado en la solicitud
              </p>
              <p className="mt-1 text-[8px] leading-4 text-emerald-700">
                Los datos se precargaron desde la solicitud. Puedes ajustarlos
                para este despacho sin modificar el acuerdo histórico.
              </p>
            </div>
          ) : requestedDestination?.mode === 'DEFINE_LATER' ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/65 px-3 py-2.5">
              <p className="text-[8px] font-semibold text-amber-800">
                El destino quedó pendiente en la solicitud
              </p>
              <p className="mt-1 text-[8px] leading-4 text-amber-700">
                Confirma ahora la dirección real antes de crear el despacho.
              </p>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Cantidad"
              type="number"
              min="1"
              max={availableQuantity}
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.quantity?.message}
              {...register('quantity', { valueAsNumber: true })}
            />
            <TextField
              label="Método de entrega"
              maxLength={80}
              placeholder="Ej. Entrega local o paquetería"
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.deliveryMethod?.message}
              {...register('deliveryMethod')}
            />
          </div>

          <TextField
            label="Nombre del destino (opcional)"
            placeholder="Ej. Planta principal"
            maxLength={120}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.destinationLabel?.message}
            {...register('destinationLabel')}
          />

          <TextField
            label="Contacto en destino (opcional)"
            placeholder="No tiene que ser quien finalmente reciba"
            maxLength={160}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.destinationContactName?.message}
            {...register('destinationContactName')}
          />

          <TextareaField
            label="Dirección"
            maxLength={300}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!min-h-16 !rounded-lg !px-3 !py-2 !text-[10px] !shadow-none"
            error={errors.destinationAddress?.message}
            {...register('destinationAddress')}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Ciudad"
              maxLength={120}
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.destinationCity?.message}
              {...register('destinationCity')}
            />
            <TextField
              label="Estado"
              maxLength={120}
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.destinationState?.message}
              {...register('destinationState')}
            />
            <TextField
              label="Código postal"
              maxLength={20}
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.destinationPostalCode?.message}
              {...register('destinationPostalCode')}
            />
            <TextField
              label="País"
              maxLength={100}
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.destinationCountry?.message}
              {...register('destinationCountry')}
            />
          </div>

          <TextareaField
            label="Indicaciones de entrega (opcional)"
            maxLength={1000}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!min-h-16 !rounded-lg !px-3 !py-2 !text-[10px] !shadow-none"
            error={errors.destinationInstructions?.message}
            {...register('destinationInstructions')}
          />

          <p className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-[8px] leading-4 text-blue-800">
            Esta entrega conservará su propio snapshot del destino. “Recibido
            por” se registra hasta confirmar la entrega real.
          </p>

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
            {submitting ? 'Creando…' : 'Crear entrega'}
          </Button>
        </div>
      </form>
    </div>
  )
}
