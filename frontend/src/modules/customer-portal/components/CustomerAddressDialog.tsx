import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-address-title"
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Empresa · Direcciones
          </p>
          <h2
            id="customer-address-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            {address ? 'Editar dirección' : 'Guardar dirección'}
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            Estas direcciones pueden reutilizarse al crear nuevas solicitudes.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          <TextField
            label="Nombre"
            placeholder="Ej. Planta principal"
            maxLength={120}
            error={errors.label?.message}
            {...register('label')}
          />
          <TextareaField
            label="Dirección"
            className="!min-h-16"
            maxLength={300}
            error={errors.address?.message}
            {...register('address')}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Ciudad"
              maxLength={120}
              error={errors.city?.message}
              {...register('city')}
            />
            <TextField
              label="Estado"
              maxLength={120}
              error={errors.state?.message}
              {...register('state')}
            />
            <TextField
              label="Código postal"
              maxLength={20}
              error={errors.postalCode?.message}
              {...register('postalCode')}
            />
            <TextField
              label="País"
              maxLength={100}
              error={errors.country?.message}
              {...register('country')}
            />
          </div>

          <div className="border-t border-slate-100 pt-3">
            <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Contacto habitual (opcional)
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Nombre"
                maxLength={160}
                error={errors.contactName?.message}
                {...register('contactName')}
              />
              <TextField
                label="Teléfono"
                maxLength={30}
                error={errors.contactPhone?.message}
                {...register('contactPhone')}
              />
            </div>
            <TextareaField
              label="Indicaciones habituales"
              className="mt-3 !min-h-16"
              maxLength={1000}
              error={errors.deliveryInstructions?.message}
              {...register('deliveryInstructions')}
            />
          </div>

          <label className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300"
              {...register('defaultAddress')}
            />
            <span>
              <span className="block text-[9px] font-semibold text-slate-800">
                Usar como dirección predeterminada
              </span>
              <span className="mt-0.5 block text-[8px] leading-4 text-slate-500">
                Se mostrará primero al crear una solicitud.
              </span>
            </span>
          </label>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <Button
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={() => void submit()}
            disabled={submitting}
          >
            {submitting ? 'Guardando…' : address ? 'Guardar cambios' : 'Guardar dirección'}
          </Button>
        </div>
      </section>
    </div>
  )
}
