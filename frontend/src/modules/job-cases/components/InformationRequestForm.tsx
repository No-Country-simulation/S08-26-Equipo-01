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
    <form
      className="rounded-xl border border-blue-100 bg-white p-3.5 shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-[12px] font-semibold text-slate-950">
        Solicitar aclaración al cliente
      </h2>
      <p className="mt-1 text-[9px] text-slate-500">
        El expediente pasará a esperando información del cliente.
      </p>

      <div className="mt-3">
        <TextareaField
          label="Pregunta"
          placeholder="Describe exactamente qué información necesita el equipo."
          labelClassName="!mb-1.5 !text-[10px]"
          className="!min-h-20 !rounded-lg !px-3 !py-2 !text-[10px] !shadow-none placeholder:!text-[9px]"
          error={errors.question?.message}
          {...register('question')}
        />
      </div>

      <div className="mt-3 flex justify-end gap-1.5">
        <Button
          size="sm"
          className="!h-7 !px-2.5 !text-[8px]"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button size="sm" type="submit" className="!h-7 !px-2.5 !text-[8px]" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando…' : 'Solicitar información'}
        </Button>
      </div>
    </form>
  )
}
