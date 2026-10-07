import type { ReactNode } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Card } from '@/shared/components/ui/Card'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import type { CustomerRequestFormValues } from '../schemas/customerRequest.schemas'

interface CustomerRequestDetailsStepProps {
  register: UseFormRegister<CustomerRequestFormValues>
  errors: FieldErrors<CustomerRequestFormValues>
  actions: ReactNode
}

export function CustomerRequestDetailsStep({
  register,
  errors,
  actions,
}: CustomerRequestDetailsStepProps) {
  return (
    <div className="grid gap-4 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
      <Card className="p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.32)] [&_label]:mb-1.5 [&_label]:text-[11px] lg:h-full lg:min-h-0 lg:overflow-y-auto lg:[scrollbar-gutter:stable]">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <SidebarNavIcon name="requests" className="h-[17px] w-[17px]" />
          </div>
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Información base
            </p>
            <h2 className="mt-0.5 text-[15px] font-semibold text-slate-950">
              Detalles del trabajo
            </h2>
            <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
              Usa un nombre reconocible para que tu equipo encuentre la solicitud
              después.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <TextField
            label="Nombre del trabajo"
            className="!h-10 !text-xs"
            maxLength={200}
            error={errors.title?.message}
            {...register('title')}
          />

          <TextareaField
            label="Descripción"
            className="!min-h-24 !py-2.5 !text-xs"
            maxLength={5000}
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid gap-3 md:grid-cols-3">
            <TextField
              label="Cantidad"
              className="!h-9 !text-xs"
              type="number"
              min={1}
              error={errors.quantity?.message}
              {...register('quantity', { valueAsNumber: true })}
            />
            <TextField
              label="Fecha requerida"
              className="!h-9 !text-xs"
              type="date"
              error={errors.requestedDeliveryDate?.message}
              {...register('requestedDeliveryDate')}
            />
            <TextField
              label="Referencia cliente"
              className="!h-9 !text-xs"
              maxLength={120}
              error={errors.customerReference?.message}
              {...register('customerReference')}
            />
          </div>
        </div>
      </Card>

      <div className="flex min-h-0 flex-col gap-2.5 lg:h-full">
        <Card className="hidden min-h-0 flex-1 p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.28)] lg:block lg:overflow-y-auto lg:[scrollbar-gutter:stable]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <SidebarNavIcon name="cases" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Siguiente etapa
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
                Qué pasa después
              </h2>
            </div>
          </div>

          <ol className="mt-1">
            {[
              'El equipo revisa el alcance y la documentación.',
              'Puede pedirte información técnica adicional.',
              'Cuando esté listo, recibirás una cotización.',
            ].map((item, index) => (
              <li
                key={item}
                className="flex gap-2.5 border-b border-slate-100 py-2 last:border-b-0"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[8px] font-bold text-blue-600">
                  {index + 1}
                </span>
                <p className="text-[9px] leading-4 text-slate-600">{item}</p>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="hidden shrink-0 border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/65 p-3.5 shadow-none lg:block">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-emerald-700">
            No te preocupes por el proceso
          </p>
          <h3 className="mt-1.5 text-[12px] font-semibold text-slate-950">
            Describe el resultado que necesitas.
          </h3>
          <p className="mt-1.5 text-[8px] leading-4 text-slate-600">
            El equipo define proceso y material durante la revisión si hace
            falta.
          </p>
        </Card>

        <div className="shrink-0">{actions}</div>
      </div>
    </div>
  )
}
