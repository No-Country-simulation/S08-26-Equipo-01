import { Button } from '@/shared/components/ui/Button'

interface CustomerRequestStepActionsProps {
  step: number
  pending: boolean
  onBack: () => void
  onContinue: () => void
}

const descriptions = [
  'Completa la información básica para continuar.',
  'Revisa requisitos y documentos antes de continuar.',
  'Define cómo deseas recibir el pedido.',
  'Confirma la información antes de enviar.',
]

export function CustomerRequestStepActions({
  step,
  pending,
  onBack,
  onContinue,
}: CustomerRequestStepActionsProps) {
  const finalStep = step === 3

  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-white via-white to-slate-50/80 p-3 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.28)]">
      <div className="mb-2">
        <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          Paso {step + 1} de 4
        </p>
        <p className="mt-0.5 text-[8px] leading-4 text-slate-500">
          {descriptions[step]}
        </p>
      </div>

      <div className={step === 0 ? 'grid grid-cols-1' : 'grid grid-cols-2 gap-2'}>
        {step > 0 ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={onBack}
            disabled={pending}
            className="!h-8 w-full !px-3 !text-[10px]"
          >
            Atrás
          </Button>
        ) : null}

        {finalStep ? (
          <Button
            size="sm"
            type="submit"
            disabled={pending}
            className="!h-8 w-full !px-3 !text-[10px]"
          >
            {pending ? 'Enviando…' : 'Enviar'}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onContinue}
            disabled={pending}
            className="!h-8 w-full !px-3 !text-[10px]"
          >
            {step === 2 ? 'Revisar' : 'Continuar'}
          </Button>
        )}
      </div>
    </div>
  )
}
