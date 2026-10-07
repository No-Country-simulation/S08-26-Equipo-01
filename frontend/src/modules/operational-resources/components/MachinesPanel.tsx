import { useMemo, useState } from 'react'
import {
  useMachineMutations,
  useMachines,
  type MachineDto,
  type ManageableMachineStatus,
} from '@/modules/machines'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import {
  InternalListingHeader,
  InternalListingPanel,
  InternalListingResultsBar,
  InternalListingSearchInput,
} from '@/shared/components/listing/InternalListing'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import {
  formatResourceDate,
  getMachineStatusPresentation,
} from '../model/resourcePresenter'
import type { CreateMachineFormValues } from '../schemas/resource.schemas'
import { CreateMachineDialog } from './CreateMachineDialog'
import { MachineStatusDialog } from './MachineStatusDialog'

interface MachinesPanelProps {
  canManage: boolean
}

export function MachinesPanel({ canManage }: MachinesPanelProps) {
  const query = useMachines()
  const mutations = useMachineMutations()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [statusTarget, setStatusTarget] = useState<MachineDto | null>(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    if (!term) return query.data ?? []

    return (query.data ?? []).filter((machine) =>
      [machine.code, machine.name, machine.type ?? ''].some((value) =>
        value.toLocaleLowerCase().includes(term),
      ),
    )
  }, [query.data, search])

  if (query.isPending) return <LoadingState label="Cargando máquinas…" />

  if (query.isError) {
    return (
      <ErrorState error={query.error} title="No pudimos cargar las máquinas" />
    )
  }

  const machines = query.data
  const available = machines.filter(
    (machine) => machine.status === 'AVAILABLE',
  ).length
  const inUse = machines.filter((machine) => machine.status === 'IN_USE').length
  const unavailable = machines.filter(
    (machine) =>
      machine.status === 'MAINTENANCE' ||
      machine.status === 'OUT_OF_SERVICE',
  ).length

  const create = async (values: CreateMachineFormValues) => {
    try {
      await mutations.create.mutateAsync({
        code: values.code.trim(),
        name: values.name.trim(),
        type: values.type.trim() || undefined,
      })
      return true
    } catch {
      return false
    }
  }

  const updateStatus = async (status: ManageableMachineStatus) => {
    if (!statusTarget) return false

    try {
      await mutations.updateStatus.mutateAsync({
        machineId: statusTarget.id,
        payload: { status },
      })
      return true
    } catch {
      return false
    }
  }

  return (
    <>
      <InternalListingPanel className="mt-0">
        <InternalListingHeader
          eyebrow="Parque de máquinas"
          title="Disponibilidad operativa"
          aside={
            canManage ? (
              <Button
                size="sm"
                className="!h-8 !px-3 !text-[9px]"
                onClick={() => {
                  mutations.create.reset()
                  setCreateOpen(true)
                }}
              >
                Registrar máquina
              </Button>
            ) : undefined
          }
        />

        <div className="grid border-b border-slate-100 bg-white sm:grid-cols-3 sm:divide-x sm:divide-slate-100">
          <Metric label="Disponibles" value={available} valueClassName="text-emerald-700" />
          <Metric label="En uso" value={inUse} valueClassName="text-blue-700" />
          <Metric label="No disponibles" value={unavailable} valueClassName="text-amber-700" />
        </div>

        <div className="border-b border-slate-200 bg-slate-50/65 px-4 py-2.5 sm:px-5">
          <InternalListingSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar código, nombre o tipo…"
            ariaLabel="Buscar máquina"
          />
        </div>

        <InternalListingResultsBar
          count={filtered.length}
          singular="máquina visible"
          plural="máquinas visibles"
          onClear={search ? () => setSearch('') : undefined}
          clearLabel="Limpiar búsqueda"
        />

        {filtered.length === 0 ? (
          <div className="bg-slate-50/40 p-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <EmptyState
                title={
                  machines.length === 0
                    ? 'Sin máquinas registradas'
                    : 'Sin coincidencias'
                }
                description={
                  machines.length === 0
                    ? 'Registra el parque de máquinas para poder asignarlo a las ejecuciones de producción.'
                    : 'Prueba con otro código, nombre o tipo.'
                }
              />
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 bg-white">
            {filtered.map((machine) => {
              const status = getMachineStatusPresentation(machine.status)

              return (
                <article
                  key={machine.id}
                  className="grid gap-3 px-4 py-3 transition hover:bg-blue-50/25 sm:px-5 lg:grid-cols-[150px_minmax(220px,1fr)_150px_160px_100px] lg:items-center"
                >
                  <div>
                    <p className="text-[10px] font-semibold text-slate-950">
                      {machine.code}
                    </p>
                    <p className="mt-0.5 text-[7px] text-slate-400">
                      Alta {formatResourceDate(machine.createdAt)}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-semibold text-slate-900">
                      {machine.name}
                    </p>
                    <p className="mt-0.5 truncate text-[8px] text-slate-400">
                      {machine.type ?? 'Tipo no especificado'}
                    </p>
                  </div>

                  <Badge tone={status.tone} className="w-fit px-2 py-0.5 text-[7px]">
                    {status.label}
                  </Badge>

                  <p className="text-[8px] text-slate-400">
                    Actualizada {formatResourceDate(machine.updatedAt)}
                  </p>

                  <div className="lg:text-right">
                    {canManage ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="!h-8 !px-3 !text-[9px]"
                        disabled={machine.status === 'IN_USE'}
                        title={
                          machine.status === 'IN_USE'
                            ? 'El estado se libera al finalizar o cancelar la ejecución.'
                            : undefined
                        }
                        onClick={() => {
                          mutations.updateStatus.reset()
                          setStatusTarget(machine)
                        }}
                      >
                        {machine.status === 'IN_USE' ? 'En ejecución' : 'Cambiar'}
                      </Button>
                    ) : (
                      <span className="text-[7px] text-slate-400">
                        Solo lectura
                      </span>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </InternalListingPanel>

      <CreateMachineDialog
        open={createOpen}
        submitting={mutations.create.isPending}
        error={mutations.create.error}
        onClose={() => {
          mutations.create.reset()
          setCreateOpen(false)
        }}
        onSubmit={create}
      />

      <MachineStatusDialog
        machine={statusTarget}
        submitting={mutations.updateStatus.isPending}
        error={mutations.updateStatus.error}
        onClose={() => {
          mutations.updateStatus.reset()
          setStatusTarget(null)
        }}
        onSubmit={updateStatus}
      />
    </>
  )
}

function Metric({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: number
  valueClassName: string
}) {
  return (
    <div className="px-4 py-3">
      <p className="text-[7px] font-medium text-slate-400">{label}</p>
      <p className={`mt-0.5 text-[14px] font-bold ${valueClassName}`}>
        {value}
      </p>
    </div>
  )
}
