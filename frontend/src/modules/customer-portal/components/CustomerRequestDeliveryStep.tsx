import type { ReactNode } from 'react'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Card } from '@/shared/components/ui/Card'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import type { CustomerRequestFormValues } from '../schemas/customerRequest.schemas'
import type { CustomerAddressDto } from '../types/customerCompany.types'
import type { RequestDeliveryMode } from '../types/customerRequest.types'

interface CustomerRequestDeliveryStepProps {
  register: UseFormRegister<CustomerRequestFormValues>
  errors: FieldErrors<CustomerRequestFormValues>
  setValue: UseFormSetValue<CustomerRequestFormValues>
  deliveryMode: RequestDeliveryMode
  selectedAddressId: string
  addresses: CustomerAddressDto[]
  addressesPending: boolean
  actions: ReactNode
}

const modes: {
  value: RequestDeliveryMode
  title: string
  detail: string
}[] = [
  {
    value: 'SAVED_ADDRESS',
    title: 'Dirección de mi empresa',
    detail: 'Usa una ubicación guardada y conserva una copia en esta solicitud.',
  },
  {
    value: 'CUSTOM_ADDRESS',
    title: 'Otro destino',
    detail: 'Indica una dirección distinta sólo para este trabajo.',
  },
  {
    value: 'DEFINE_LATER',
    title: 'Definir más adelante',
    detail: 'El destino se acordará con el equipo durante la revisión.',
  },
]

export function CustomerRequestDeliveryStep({
  register,
  errors,
  setValue,
  deliveryMode,
  selectedAddressId,
  addresses,
  addressesPending,
  actions,
}: CustomerRequestDeliveryStepProps) {
  return (
    <div className="grid min-w-0 gap-4 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
      <Card className="min-w-0 p-3.5 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.32)] lg:h-full lg:min-h-0 lg:overflow-y-auto lg:[scrollbar-gutter:stable]">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <SidebarNavIcon name="deliveries" className="h-[17px] w-[17px]" />
          </div>
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Entrega acordada
            </p>
            <h2 className="mt-0.5 text-base font-semibold text-slate-950">
              ¿Dónde quieres recibir el pedido?
            </h2>
            <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
              Esta información acompañará la solicitud hasta Logística. Si
              cambia después, cada entrega conservará su propio historial.
            </p>
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {modes.map((mode) => {
            const selected = deliveryMode === mode.value
            const savedUnavailable =
              mode.value === 'SAVED_ADDRESS' &&
              !addressesPending &&
              addresses.length === 0

            return (
              <button
                key={mode.value}
                type="button"
                disabled={savedUnavailable}
                onClick={() =>
                  setValue('deliveryMode', mode.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className={
                  selected
                    ? 'rounded-xl border border-blue-500 bg-blue-50/70 p-3 text-left shadow-sm'
                    : savedUnavailable
                      ? 'cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-left opacity-55'
                      : 'rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/25'
                }
              >
                <p className="text-[9px] font-semibold text-slate-900">
                  {mode.title}
                </p>
                <p className="mt-1 text-[8px] leading-4 text-slate-500">
                  {savedUnavailable
                    ? 'Tu empresa todavía no tiene direcciones guardadas.'
                    : mode.detail}
                </p>
              </button>
            )
          })}
        </div>

        <input type="hidden" {...register('deliveryMode')} />
        <input type="hidden" {...register('customerAddressId')} />

        {deliveryMode === 'SAVED_ADDRESS' ? (
          <section className="mt-4 border-t border-slate-100 pt-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Direcciones de la empresa
            </p>
            <div className="mt-2 space-y-2">
              {addresses.map((address) => {
                const selected = selectedAddressId === String(address.id)

                return (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => {
                      setValue('customerAddressId', String(address.id), {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                      setValue(
                        'deliveryContactName',
                        address.contactName ?? '',
                        { shouldDirty: true },
                      )
                      setValue(
                        'deliveryContactPhone',
                        address.contactPhone ?? '',
                        { shouldDirty: true },
                      )
                      setValue(
                        'deliveryInstructions',
                        address.deliveryInstructions ?? '',
                        { shouldDirty: true },
                      )
                    }}
                    className={
                      selected
                        ? 'w-full rounded-xl border border-blue-400 bg-blue-50/55 px-3 py-2.5 text-left'
                        : 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-blue-200'
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[9px] font-semibold text-slate-950">
                        {address.label}
                      </p>
                      {address.defaultAddress ? (
                        <span className="text-[7px] font-semibold text-blue-600">
                          Predeterminada
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[8px] leading-4 text-slate-500">
                      {address.address}, {address.city}, {address.state},{' '}
                      {address.postalCode}, {address.country}
                    </p>
                  </button>
                )
              })}
            </div>
            {errors.customerAddressId?.message ? (
              <p className="mt-1.5 text-[8px] text-red-600">
                {errors.customerAddressId.message}
              </p>
            ) : null}
          </section>
        ) : null}

        {deliveryMode === 'CUSTOM_ADDRESS' ? (
          <section className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
            <TextField
              label="Nombre del destino (opcional)"
              placeholder="Ej. Almacén Guadalajara"
              maxLength={120}
              labelClassName="!mb-1 !text-[9px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.deliveryLabel?.message}
              {...register('deliveryLabel')}
            />
            <TextareaField
              label="Dirección"
              className="!min-h-14 !rounded-lg !px-2.5 !py-2 !text-[10px] !leading-4 !shadow-none"
              labelClassName="!mb-1 !text-[9px]"
              maxLength={300}
              error={errors.deliveryAddress?.message}
              {...register('deliveryAddress')}
            />
            <div className="grid gap-2.5 sm:grid-cols-2">
              <TextField
                label="Ciudad"
                maxLength={120}
                labelClassName="!mb-1 !text-[9px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={errors.deliveryCity?.message}
                {...register('deliveryCity')}
              />
              <TextField
                label="Estado"
                maxLength={120}
                labelClassName="!mb-1 !text-[9px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={errors.deliveryState?.message}
                {...register('deliveryState')}
              />
              <TextField
                label="Código postal"
                maxLength={20}
                labelClassName="!mb-1 !text-[9px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={errors.deliveryPostalCode?.message}
                {...register('deliveryPostalCode')}
              />
              <TextField
                label="País"
                maxLength={100}
                labelClassName="!mb-1 !text-[9px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={errors.deliveryCountry?.message}
                {...register('deliveryCountry')}
              />
            </div>
          </section>
        ) : null}

        {deliveryMode === 'SAVED_ADDRESS' ||
        deliveryMode === 'CUSTOM_ADDRESS' ? (
          <section className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Contacto en destino
              </p>
              <p className="mt-0.5 text-[8px] text-slate-500">
                Es opcional. No tiene que ser la persona que finalmente reciba
                físicamente el pedido.
              </p>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <TextField
                label="Nombre (opcional)"
                maxLength={160}
                labelClassName="!mb-1 !text-[9px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={errors.deliveryContactName?.message}
                {...register('deliveryContactName')}
              />
              <TextField
                label="Teléfono (opcional)"
                maxLength={30}
                labelClassName="!mb-1 !text-[9px]"
                className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                error={errors.deliveryContactPhone?.message}
                {...register('deliveryContactPhone')}
              />
            </div>
            <TextareaField
              label="Indicaciones de entrega (opcional)"
              className="!min-h-14 !rounded-lg !px-2.5 !py-2 !text-[10px] !leading-4 !shadow-none"
              labelClassName="!mb-1 !text-[9px]"
              maxLength={1000}
              placeholder="Ej. Acceso por almacén, horario, referencias..."
              error={errors.deliveryInstructions?.message}
              {...register('deliveryInstructions')}
            />
          </section>
        ) : null}
      </Card>

      <div className="flex min-w-0 min-h-0 flex-col gap-2.5 lg:h-full">
        <Card className="hidden min-h-0 flex-1 p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.28)] lg:block">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Cómo se usará
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
            Del acuerdo a Logística
          </h2>

          <ol className="mt-3 space-y-3">
            {[
              'La solicitud guarda una copia del destino acordado.',
              'Comercial puede verlo durante la revisión.',
              'Cuando llegue a Entrega, Logística recibe esos datos precargados.',
              'La persona que realmente recibe se registra hasta la entrega final.',
            ].map((item, index) => (
              <li key={item} className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[8px] font-bold text-blue-600">
                  {index + 1}
                </span>
                <p className="text-[9px] leading-4 text-slate-600">{item}</p>
              </li>
            ))}
          </ol>

          {deliveryMode === 'DEFINE_LATER' ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50/65 px-3 py-2.5 text-[8px] leading-4 text-amber-800">
              Podrás enviar la solicitud así. El destino deberá acordarse antes
              del despacho.
            </p>
          ) : null}
        </Card>

        <div className="min-w-0 shrink-0">{actions}</div>
      </div>
    </div>
  )
}
