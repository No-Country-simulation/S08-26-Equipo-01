import { useState } from 'react'
import type {
  MachineDto,
  ManageableMachineStatus,
} from '@/modules/machines'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { manageableMachineStatuses } from '../model/resourcePresenter'

interface MachineStatusDialogProps {
  machine: MachineDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (status: ManageableMachineStatus) => Promise<boolean>
}

export function MachineStatusDialog(props: MachineStatusDialogProps) {
  if (!props.machine) return null

  return (
    <MachineStatusDialogContent
      key={props.machine.id}
      {...props}
      machine={props.machine}
    />
  )
}

interface MachineStatusDialogContentProps
  extends Omit<MachineStatusDialogProps, 'machine'> {
  machine: MachineDto
}

function getInitialStatus(machine: MachineDto): ManageableMachineStatus {
  if (
    machine.status === 'AVAILABLE' ||
    machine.status === 'MAINTENANCE' ||
    machine.status === 'OUT_OF_SERVICE'
  ) {
    return machine.status
  }

  return 'AVAILABLE'
}

function MachineStatusDialogContent({
  machine,
  submitting,
  error,
  onClose,
  onSubmit,
}: MachineStatusDialogContentProps) {
  const [status, setStatus] = useState<ManageableMachineStatus>(
    () => getInitialStatus(machine),
  )

  const submit = async () => {
    if (await onSubmit(status)) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="machine-status-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Recursos · Máquinas
          </p>
          <h2
            id="machine-status-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            Estado de {machine.code}
          </h2>
          <p className="mt-1 text-[9px] text-slate-500">{machine.name}</p>
        </div>

        <div className="space-y-2 px-4 py-3.5">
          {manageableMachineStatuses.map((option) => (
            <label
              key={option.value}
              className={
                status === option.value
                  ? 'flex cursor-pointer gap-2.5 rounded-lg border border-blue-300 bg-blue-50/70 px-3 py-2.5'
                  : 'flex cursor-pointer gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition hover:bg-slate-50'
              }
            >
              <input
                type="radio"
                name="machine-status"
                value={option.value}
                checked={status === option.value}
                disabled={submitting}
                onChange={() => setStatus(option.value)}
                className="mt-0.5"
              />
              <span>
                <span className="block text-[9px] font-semibold text-slate-900">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-[8px] leading-4 text-slate-500">
                  {option.description}
                </span>
              </span>
            </label>
          ))}

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700"
            >
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
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
            disabled={submitting || status === machine.status}
          >
            {submitting ? 'Actualizando…' : 'Guardar estado'}
          </Button>
        </div>
      </section>
    </div>
  )
}
