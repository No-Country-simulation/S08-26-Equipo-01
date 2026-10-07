import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import {
  informationRequestSchema,
  type InformationRequestFormValues,
} from '../schemas/jobCase.schemas'

interface InformationRequestFormProps {
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: InformationRequestFormValues) => Promise<void>
}

export function InformationRequestForm({
  isSubmitting,
  onCancel,
  onSubmit,
}: InformationRequestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InformationRequestFormValues>({
    resolver: zodResolver(informationRequestSchema),
    defaultValues: { question: '' },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="information-request-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-5 py-4">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Solicitud de información
          </p>
          <h2
            id="information-request-title"
            className="mt-1 text-base font-semibold text-slate-950"
          >
            Solicitar aclaración al cliente
          </h2>
          <p className="mt-1.5 text-[10px] leading-5 text-slate-500">
            Describe con precisión qué dato necesita el equipo para continuar
            con la revisión del expediente.
          </p>
        </div>

        <div className="px-5 py-4">
          <TextareaField
            label="Pregunta para el cliente"
            placeholder="Ej. Confirma la tolerancia requerida para el diámetro final de la pieza."
            labelClassName="!mb-1.5 !text-[10px]"
            className="!min-h-28 !rounded-lg !px-3 !py-2.5 !text-[10px] !shadow-none placeholder:!text-[9px]"
            error={errors.question?.message}
            autoFocus
            {...register('question')}
          />

          <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2 text-[8px] leading-4 text-amber-800">
            Al enviarla, el expediente quedará esperando la respuesta del
            cliente.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">
          <Button
            size="sm"
            variant="ghost"
            className="!h-8 !px-3 !text-[9px]"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            type="submit"
            className="!h-8 !px-3 !text-[9px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando…' : 'Enviar aclaración'}
          </Button>
        </div>
      </form>
    </div>
  )
}
