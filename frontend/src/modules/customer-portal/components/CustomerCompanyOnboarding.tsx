import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { useCreateCustomerCompany } from '../hooks/useCreateCustomerCompany'
import {
  customerCompanySchema,
  type CustomerCompanyFormValues,
} from '../schemas/customerCompany.schemas'
import { CustomerCompanyFields } from './CustomerCompanyFields'

interface CustomerCompanyOnboardingProps {
  onCreated: (customerId: number) => void
  onLogout: () => void
}

const defaultValues: CustomerCompanyFormValues = {
  name: '',
  rfc: '',
  phone: '',
  administrativeEmail: '',
  city: '',
  state: '',
  website: '',
}

const onboardingSteps = [
  {
    number: '01',
    title: 'Crea el contexto de empresa',
    description: 'Aquí vivirán solicitudes, cotizaciones y seguimiento.',
  },
  {
    number: '02',
    title: 'Quedas como administrador',
    description: 'Tu cuenta obtiene el primer acceso de administración.',
  },
  {
    number: '03',
    title: 'Incorpora a tu equipo',
    description: 'Después podrás invitar miembros y asignar permisos.',
  },
]

export function CustomerCompanyOnboarding({
  onCreated,
  onLogout,
}: CustomerCompanyOnboardingProps) {
  const mutation = useCreateCustomerCompany()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerCompanyFormValues>({
    resolver: zodResolver(customerCompanySchema),
    defaultValues,
  })

  const submit = handleSubmit(async (values) => {
    try {
      const customer = await mutation.mutateAsync({
        name: values.name.trim(),
        rfc: values.rfc.trim(),
        phone: values.phone.trim(),
        administrativeEmail: values.administrativeEmail.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        website: values.website.trim(),
      })

      onCreated(customer.id)
    } catch {
      // Mutation error is rendered below.
    }
  })

  return (
    <main className="min-h-screen bg-[#f6f8fc] lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
      <header className="shrink-0 border-b border-slate-200/80 bg-white/90 px-5 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/brand/qualitytrack-mark.svg"
              alt=""
              className="h-8 w-8"
            />
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-950">
                Quality<span className="text-blue-600">Track</span>
              </span>
              <p className="text-[8px] text-slate-400">Portal de cliente</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="!h-7 !px-2.5 !text-[8px]"
            disabled={mutation.isPending}
            onClick={onLogout}
          >
            Cerrar sesión
          </Button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-5 py-4 sm:px-8 lg:min-h-0 lg:flex-1 lg:py-5">
        <div className="grid gap-4 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)]">
          <section className="relative overflow-hidden rounded-2xl border border-blue-900/10 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 p-5 text-white shadow-[0_20px_55px_-38px_rgba(15,23,42,0.55)] sm:p-6 lg:flex lg:min-h-0 lg:flex-col">
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl"
            />

            <div className="relative">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-300">
                Configuración inicial
              </p>
              <h1 className="mt-2 max-w-sm text-[24px] font-bold leading-[1.16] tracking-tight">
                Prepara el espacio de tu empresa
              </h1>
              <p className="mt-3 max-w-md text-[10px] leading-5 text-blue-100/75">
                La cuenta es personal. La empresa es el contexto donde tu equipo
                trabajará con solicitudes, cotizaciones, producción y entregas.
              </p>
            </div>

            <div className="relative mt-6 lg:mt-auto">
              <div className="space-y-0">
                {onboardingSteps.map((step, index) => (
                  <div key={step.number} className="relative flex gap-3 pb-5 last:pb-0">
                    {index < onboardingSteps.length - 1 ? (
                      <span
                        aria-hidden="true"
                        className="absolute left-[11px] top-6 h-[calc(100%-8px)] w-px bg-blue-400/25"
                      />
                    ) : null}

                    <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-300/30 bg-white/10 text-[7px] font-bold text-blue-100 backdrop-blur-sm">
                      {step.number}
                    </span>

                    <div className="pt-0.5">
                      <h2 className="text-[10px] font-semibold text-white">
                        {step.title}
                      </h2>
                      <p className="mt-1 max-w-sm text-[8px] leading-4 text-blue-100/65">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-[8px] font-semibold text-blue-200">
                  ¿Llegaste por invitación?
                </p>
                <p className="mt-1 text-[8px] leading-4 text-blue-100/60">
                  Utiliza el enlace que recibiste por correo. No necesitas crear
                  otra empresa para incorporarte a un equipo existente.
                </p>
              </div>
            </div>
          </section>

          <form
            className="min-h-0"
            onSubmit={(event) => void submit(event)}
            noValidate
          >
            <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_44px_-34px_rgba(15,23,42,0.35)]">
              <div className="shrink-0 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/70 px-4 py-3.5 sm:px-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 21V8l8-4 8 4v13" />
                      <path d="M8 21v-5h8v5" />
                      <path d="M8 10h.01M12 10h.01M16 10h.01M8 13h.01M12 13h.01M16 13h.01" />
                    </svg>
                  </div>

                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                      Datos de empresa
                    </p>
                    <h2 className="mt-0.5 text-[14px] font-semibold text-slate-950">
                      Crea tu empresa
                    </h2>
                    <p className="mt-1 max-w-2xl text-[9px] leading-4 text-slate-500">
                      Solo el nombre es obligatorio. El resto puede completarse
                      ahora o editarse más adelante desde el portal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5 sm:px-5">
                <CustomerCompanyFields
                  register={register}
                  errors={errors}
                  disabled={mutation.isPending}
                />

                {mutation.error ? (
                  <p
                    role="alert"
                    className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700"
                  >
                    {getErrorMessage(mutation.error)}
                  </p>
                ) : null}
              </div>

              <div className="shrink-0 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:px-5">
                <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[8px] leading-4 text-slate-500">
                    Tu cuenta quedará como administrador inicial de esta empresa.
                  </p>

                  <Button
                    type="submit"
                    className="!h-8 !px-3.5 !text-[9px]"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending
                      ? 'Creando empresa…'
                      : 'Crear empresa y continuar'}
                  </Button>
                </div>
              </div>
            </section>
          </form>
        </div>
      </div>
    </main>
  )
}
