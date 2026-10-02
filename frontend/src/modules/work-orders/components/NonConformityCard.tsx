import { useMemo, useState } from 'react'
import { useSessionStore } from '@/modules/auth'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { EditNonConformityDialog } from './EditNonConformityDialog'
import { NonConformityDispositionDialog } from './NonConformityDispositionDialog'
import { ReworkExecutionPanel } from './ReworkExecutionPanel'
import { ReworkRoutingCard } from './ReworkRoutingCard'
import { UseAsIsDialog } from './UseAsIsDialog'
import { useNonConformityMutations } from '../hooks/useNonConformityMutations'
import {
  formatNonConformityDateTime,
  getDispositionLabel,
  hasCompleteNonConformityDetails,
  isReworkRoutingCompleted,
} from '../model/nonConformityPresenter'
import type {
  NonConformityDetailsFormValues,
  UseAsIsFormValues,
} from '../schemas/nonConformity.schemas'
import type {
  NonConformityDto,
  ScrapResolutionDto,
} from '../types/quality.types'
import type {
  OperationExecutionDto,
  RoutingSheetDto,
  WorkOrderStatus,
} from '../types/workOrder.types'

interface NonConformityCardProps {
  nonConformity: NonConformityDto
  routingSheets: RoutingSheetDto[]
  executions: OperationExecutionDto[]
  workOrderStatus: WorkOrderStatus
}

export function NonConformityCard({
  nonConformity,
  routingSheets,
  executions,
  workOrderStatus,
}: NonConformityCardProps) {
  const session = useSessionStore((state) => state.session)
  const roles = session?.user.roles ?? []
  const isAdmin = roles.includes('ADMIN')
  const isQuality = roles.includes('QUALITY')
  const isEngineering = roles.includes('ENGINEERING')
  const canEditDetails = isAdmin || isQuality
  const canRework = isAdmin || isEngineering
  const canScrap = isAdmin || isQuality || isEngineering
  const canChooseDisposition = canRework || canScrap || isAdmin
  const mutations = useNonConformityMutations(nonConformity.workOrderId)
  const [editOpen, setEditOpen] = useState(false)
  const [dispositionOpen, setDispositionOpen] = useState(false)
  const [useAsIsOpen, setUseAsIsOpen] = useState(false)
  const [scrapResult, setScrapResult] = useState<ScrapResolutionDto | null>(
    null,
  )

  const reworkRoutings = useMemo(
    () =>
      routingSheets
        .filter(
          (routing) =>
            routing.purpose === 'REWORK' &&
            routing.nonConformityId === nonConformity.id,
        )
        .sort((left, right) => left.revision - right.revision),
    [nonConformity.id, routingSheets],
  )
  const productionRouting = routingSheets.find(
    (routing) => routing.purpose === 'PRODUCTION',
  )
  const latestRework = reworkRoutings.at(-1)
  const detailsComplete = hasCompleteNonConformityDetails(nonConformity)
  const latestCompleted = latestRework
    ? isReworkRoutingCompleted(latestRework, executions)
    : false
  const canCreateAnotherRework =
    nonConformity.status === 'OPEN' &&
    nonConformity.disposition === 'REWORK' &&
    workOrderStatus === 'QUALITY_HOLD' &&
    canRework &&
    (!latestRework || latestCompleted)

  const mutationError =
    mutations.updateDetails.error ??
    mutations.createRework.error ??
    mutations.scrap.error ??
    mutations.useAsIs.error

  const saveDetails = async (values: NonConformityDetailsFormValues) => {
    try {
      await mutations.updateDetails.mutateAsync({
        nonConformityId: nonConformity.id,
        payload: {
          affectedQuantity: values.affectedQuantity,
          severity: values.severity.trim(),
          description: values.description.trim(),
        },
      })
      return true
    } catch {
      return false
    }
  }

  const chooseRework = async () => {
    mutations.createRework.reset()

    try {
      await mutations.createRework.mutateAsync(nonConformity.id)
      setDispositionOpen(false)
    } catch {
      // El error se presenta en la tarjeta.
    }
  }

  const chooseScrap = async () => {
    mutations.scrap.reset()

    try {
      const result = await mutations.scrap.mutateAsync(nonConformity.id)
      setScrapResult(result)
      setDispositionOpen(false)
    } catch {
      // El error se presenta en la tarjeta.
    }
  }

  const authorizeUseAsIs = async (values: UseAsIsFormValues) => {
    try {
      await mutations.useAsIs.mutateAsync({
        nonConformityId: nonConformity.id,
        payload: { reason: values.reason.trim() },
      })
      return true
    } catch {
      return false
    }
  }

  const open = nonConformity.status === 'OPEN'

  return (
    <article
      id={`non-conformity-${nonConformity.id}`}
      className="scroll-mt-24 overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm target:ring-2 target:ring-blue-300"
    >
      <div className="border-b border-red-100 bg-red-50/55 px-3.5 py-3">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-red-600">
              No conformidad
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h3 className="text-[11px] font-semibold text-slate-950">
                {nonConformity.number}
              </h3>
              <Badge tone={open ? 'danger' : 'success'}>
                {nonConformity.status}
              </Badge>
              {nonConformity.severity ? (
                <Badge tone="warning">{nonConformity.severity}</Badge>
              ) : null}
            </div>
            <p className="mt-0.5 text-[8px] text-slate-400">
              Originada por inspección #{nonConformity.originalInspectionId} ·{' '}
              {formatNonConformityDateTime(nonConformity.openedAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {open && nonConformity.disposition === null && canEditDetails ? (
              <Button
                size="sm"
                className="!h-7 !px-2.5 !text-[8px]"
                variant="secondary"
                onClick={() => setEditOpen(true)}
              >
                {detailsComplete ? 'Editar datos' : 'Completar datos'}
              </Button>
            ) : null}

            {open &&
            detailsComplete &&
            nonConformity.disposition === null &&
            canChooseDisposition ? (
              <Button size="sm" className="!h-7 !px-2.5 !text-[8px]" onClick={() => setDispositionOpen(true)}>
                Definir disposición
              </Button>
            ) : null}

            {canCreateAnotherRework && latestRework ? (
              <Button
                size="sm"
                className="!h-7 !px-2.5 !text-[8px]"
                onClick={() => void chooseRework()}
                disabled={mutations.createRework.isPending}
              >
                {mutations.createRework.isPending
                  ? 'Creando…'
                  : 'Nuevo ciclo de retrabajo'}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-3 px-3.5 py-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50/70 px-3 py-2.5">
            <p className="text-[7px] text-slate-400">Cantidad afectada</p>
            <p className="mt-0.5 text-[9px] font-semibold text-slate-900">
              {nonConformity.affectedQuantity ?? 'Pendiente'}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50/70 px-3 py-2.5">
            <p className="text-[7px] text-slate-400">Disposición</p>
            <p className="mt-0.5 text-[9px] font-semibold text-slate-900">
              {getDispositionLabel(nonConformity.disposition)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50/70 px-3 py-2.5">
            <p className="text-[7px] text-slate-400">Estado de la OT</p>
            <p className="mt-0.5 text-[9px] font-semibold text-slate-900">
              {workOrderStatus}
            </p>
          </div>
        </div>

        {nonConformity.description ? (
          <div>
            <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
              Descripción
            </p>
            <p className="mt-0.5 text-[8px] leading-4 text-slate-600">
              {nonConformity.description}
            </p>
          </div>
        ) : (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[8px] leading-4 text-amber-800">
            La NC necesita cantidad afectada, severidad y descripción antes de
            elegir una disposición.
          </p>
        )}

        {mutationError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
            {getErrorMessage(mutationError)}
          </p>
        ) : null}

        {scrapResult ? (
          <section
            className={
              scrapResult.readyForDelivery
                ? 'rounded-xl border border-emerald-200 bg-emerald-50 p-4'
                : 'rounded-xl border border-amber-200 bg-amber-50 p-4'
            }
          >
            <p className="text-[9px] font-semibold text-slate-900">
              Resultado del descarte
            </p>
            <p className="mt-1.5 text-[8px] leading-4 text-slate-600">
              Aceptadas antes: {scrapResult.acceptedQuantityBeforeScrap} ·
              descartadas: {scrapResult.affectedQuantity} · disponibles:{' '}
              {scrapResult.remainingAcceptedQuantity} /{' '}
              {scrapResult.plannedQuantity}.
            </p>
            <p className="mt-1 text-[8px] font-semibold text-slate-700">
              {scrapResult.readyForDelivery
                ? 'La cantidad comprometida sigue cubierta: NC cerrada y OT lista para entrega.'
                : 'Queda cantidad faltante: la NC y la OT permanecen bloqueadas hasta una resolución posterior.'}
            </p>
          </section>
        ) : null}

        {nonConformity.disposition === 'SCRAP' && open && !scrapResult ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[8px] leading-4 text-amber-800">
            SCRAP ya fue registrado, pero el backend mantuvo la NC OPEN. Esto
            significa que la cantidad restante no cubre la cantidad planificada;
            no se libera la OT de forma artificial.
          </p>
        ) : null}

        {nonConformity.resolutionNotes ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[8px] leading-4 text-emerald-800">
            Resolución: {nonConformity.resolutionNotes}
            {nonConformity.resolvedByName
              ? ` · ${nonConformity.resolvedByName}`
              : ''}
            {nonConformity.closedAt
              ? ` · ${formatNonConformityDateTime(nonConformity.closedAt)}`
              : ''}
          </p>
        ) : null}

        {nonConformity.disposition === 'REWORK' && reworkRoutings.length > 0 ? (
          <div className="space-y-3 border-t border-slate-100 pt-3">
            {reworkRoutings.map((routing) => (
              <div key={routing.id}>
                <ReworkRoutingCard
                  routing={routing}
                  productionRouting={productionRouting}
                  nonConformityNumber={nonConformity.number}
                  canDesign={canRework}
                  active={routing.id === latestRework?.id && open}
                />
                {routing.id === latestRework?.id ? (
                  <ReworkExecutionPanel
                    routing={routing}
                    nonConformity={nonConformity}
                    executions={executions}
                    workOrderStatus={workOrderStatus}
                  />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {nonConformity.disposition === 'REWORK' &&
        open &&
        !latestRework &&
        canRework ? (
          <Button
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={() => void chooseRework()}
            disabled={mutations.createRework.isPending}
          >
            {mutations.createRework.isPending
              ? 'Creando ruta…'
              : 'Crear ruta de retrabajo'}
          </Button>
        ) : null}
      </div>

      <EditNonConformityDialog
        open={editOpen}
        nonConformity={nonConformity}
        submitting={mutations.updateDetails.isPending}
        error={mutations.updateDetails.error}
        onClose={() => {
          mutations.updateDetails.reset()
          setEditOpen(false)
        }}
        onSubmit={saveDetails}
      />

      <NonConformityDispositionDialog
        open={dispositionOpen}
        nonConformity={nonConformity}
        canRework={canRework}
        canScrap={canScrap}
        canUseAsIs={isAdmin}
        submitting={
          mutations.createRework.isPending || mutations.scrap.isPending
        }
        error={mutations.createRework.error ?? mutations.scrap.error}
        onClose={() => setDispositionOpen(false)}
        onRework={() => void chooseRework()}
        onScrap={() => void chooseScrap()}
        onUseAsIs={() => {
          setDispositionOpen(false)
          setUseAsIsOpen(true)
        }}
      />

      <UseAsIsDialog
        open={useAsIsOpen}
        nonConformity={nonConformity}
        submitting={mutations.useAsIs.isPending}
        error={mutations.useAsIs.error}
        onClose={() => {
          mutations.useAsIs.reset()
          setUseAsIsOpen(false)
        }}
        onSubmit={authorizeUseAsIs}
      />
    </article>
  )
}
