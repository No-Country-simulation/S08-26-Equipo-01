import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  respondInformationSchema,
  type RespondInformationFormValues,
} from '../schemas/customerRequest.schemas'
import type { CustomerInformationRequestDto } from '../types/customerRequest.types'

interface RespondInformationDialogProps {
  request: CustomerInformationRequestDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: RespondInformationFormValues) => Promise<boolean>
}

export function RespondInformationDialog({
  request,
  submitting,
  error,
  onClose,
  onSubmit,
}: RespondInformationDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RespondInformationFormValues>({
    resolver: zodResolver(respondInformationSchema),
    defaultValues: { response: '' },
  })

  if (!request) return null

  const close = () => {
    reset()
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) close()
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="respond-information-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
            Información requerida
          </p>
          <h2
            id="respond-information-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            Responder al equipo
          </h2>
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-slate-800">
            {request.question}
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <TextareaField
            label="Tu respuesta"
            maxLength={4000}
            error={errors.response?.message}
            {...register('response')}
          />

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Enviando…' : 'Enviar respuesta'}
          </Button>
        </div>
      </form>
    </div>
  )
}
