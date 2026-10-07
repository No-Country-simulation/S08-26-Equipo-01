import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  customerAddressSchema,
  type CustomerAddressFormValues,
} from '../schemas/customerCompany.schemas'
import type { CustomerAddressDto } from '../types/customerCompany.types'

interface CustomerAddressDialogProps {
  open: boolean
  address: CustomerAddressDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CustomerAddressFormValues) => Promise<boolean>
}

const emptyValues: CustomerAddressFormValues = {
  label: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'México',
  contactName: '',
  contactPhone: '',
  deliveryInstructions: '',
  defaultAddress: false,
}

const inputClassName =
  '!h-9 !rounded-lg !border-slate-200 !px-3 !text-[10px] !shadow-sm'
const labelClassName = '!mb-1.5 !text-[9px] !font-semibold'
const textareaClassName =
  '!min-h-[68px] !resize-none !rounded-lg !border-slate-200 !px-3 !py-2 !text-[10px] !leading-4 !shadow-sm'

export function CustomerAddressDialog({
  open,
  address,
  submitting,
  error,
  onClose,
  onSubmit,
}: CustomerAddressDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerAddressFormValues>({
    resolver: zodResolver(customerAddressSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    reset(
      address
        ? {
            label: address.label,
            address: address.address,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            contactName: address.contactName ?? '',
            contactPhone: address.contactPhone ?? '',
            deliveryInstructions: address.deliveryInstructions ?? '',
            defaultAddress: address.defaultAddress,
          }
        : emptyValues,
    )
  }, [address, open, reset])

  if (!open) return null

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) {
      reset(emptyValues)
      onClose()
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[2px] sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-address-title"
        className="flex max-h-[min(92dvh,760px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-blue-100/80 bg-white shadow-[0_28px_90px_-32px_rgba(15,23,42,0.55)]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/80 px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <SidebarNavIcon name="company" className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Empresa · Direcciones
              </p>
              <h2
                id="customer-address-title"
                className="mt-0.5 text-[15px] font-semibold tracking-tight text-slate-950"
              >
                {address ? 'Editar dirección' : 'Agregar dirección'}
              </h2>
              <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
                Guarda ubicaciones que podrás reutilizar al crear nuevas solicitudes.
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Cerrar"
            className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md border border-slate-200/80 bg-white/80 text-[12px] font-medium leading-none text-slate-400 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            onClick={onClose}
            disabled={submitting}
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Nombre de la ubicación"
              placeholder="Ej. Planta principal"
              maxLength={120}
              labelClassName={labelClassName}
              className={inputClassName}
              error={errors.label?.message}
              {...register('label')}
            />
            <TextField
              label="País"
              maxLength={100}
              labelClassName={labelClassName}
              className={inputClassName}
              error={errors.country?.message}
              {...register('country')}
            />
          </div>

          <div className="mt-3">
            <TextareaField
              label="Dirección"
              className={textareaClassName}
              labelClassName={labelClassName}
              maxLength={300}
              error={errors.address?.message}
              {...register('address')}
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <TextField
              label="Ciudad"
              maxLength={120}
              labelClassName={labelClassName}
              className={inputClassName}
              error={errors.city?.message}
              {...register('city')}
            />
            <TextField
              label="Estado"
              maxLength={120}
              labelClassName={labelClassName}
              className={inputClassName}
              error={errors.state?.message}
              {...register('state')}
            />
            <TextField
              label="Código postal"
              maxLength={20}
              labelClassName={labelClassName}
              className={inputClassName}
              error={errors.postalCode?.message}
              {...register('postalCode')}
            />
          </div>

          <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50/55 p-3.5">
            <div className="mb-3">
              <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Contacto habitual
              </p>
              <p className="mt-0.5 text-[8px] leading-4 text-slate-500">
                Opcional. Se sugerirá al utilizar esta dirección en una solicitud.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Nombre"
                maxLength={160}
                labelClassName={labelClassName}
                className={inputClassName}
                error={errors.contactName?.message}
                {...register('contactName')}
              />
              <TextField
                label="Teléfono"
                maxLength={30}
                labelClassName={labelClassName}
                className={inputClassName}
                error={errors.contactPhone?.message}
                {...register('contactPhone')}
              />
            </div>

            <div className="mt-3">
              <TextareaField
                label="Indicaciones habituales"
                className={textareaClassName}
                labelClassName={labelClassName}
                maxLength={1000}
                error={errors.deliveryInstructions?.message}
                {...register('deliveryInstructions')}
              />
            </div>
          </section>

          <label className="mt-3 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/45 px-3 py-2.5">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200"
              {...register('defaultAddress')}
            />
            <span>
              <span className="block text-[9px] font-semibold text-slate-800">
                Usar como dirección predeterminada
              </span>
              <span className="mt-0.5 block text-[8px] leading-4 text-slate-500">
                Se mostrará primero al elegir un destino de entrega.
              </span>
            </span>
          </label>

          {error ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-gradient-to-r from-white to-slate-50/80 px-4 py-3 sm:px-5">
          <Button
            variant="secondary"
            className="!h-8 !px-3 !text-[9px]"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            className="!h-8 !px-3 !text-[9px]"
            onClick={() => void submit()}
            disabled={submitting}
          >
            {submitting
              ? 'Guardando…'
              : address
                ? 'Guardar cambios'
                : 'Agregar dirección'}
          </Button>
        </footer>
      </section>
    </div>
  )
}
