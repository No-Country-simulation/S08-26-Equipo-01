import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { CompleteQualityInspectionDialog } from './CompleteQualityInspectionDialog'
import { NonConformitySection } from './NonConformitySection'
import { ProductionMaterialsCard } from './ProductionMaterialsCard'
import { QualityInspectionHistory } from './QualityInspectionHistory'
import { QualityInspectionWorkspace } from './QualityInspectionWorkspace'
import { QualityCheckDialog } from './QualityCheckDialog'
import { QualityPendingWorkspace } from './QualityPendingWorkspace'
import { QualityStagePanel } from './QualityStagePanel'
import {
  type QualityDetail,
  useQualityHashNavigation,
} from '../hooks/useQualityHashNavigation'
import { useQualityMutations } from '../hooks/useQualityMutations'
import type { QualityCheckFormValues } from '../schemas/quality.schemas'
import type {
  QualityCheckDto,
  QualityInspectionDto,
  SaveQualityCheckPayload,
} from '../types/quality.types'
import type { WorkOrder360Dto } from '../types/workOrder360.types'

interface WorkOrderQualityProps {
  data: WorkOrder360Dto
}

interface CheckTarget {
  inspectionId: number
  qualityCheck: QualityCheckDto | null
}

export function WorkOrderQuality({ data }: WorkOrderQualityProps) {
  const session = useSessionStore((state) => state.session)
  const location = useLocation()
  const roles = session?.user.roles ?? []
  const currentUserId = Number(session?.user.id)
  const isAdmin = roles.includes('ADMIN')
  const isQuality = roles.includes('QUALITY')
  const canManageQuality = isAdmin || isQuality
  const mutations = useQualityMutations(data.workOrder.id)
  const [checkTarget, setCheckTarget] = useState<CheckTarget | null>(null)
  const [completionTarget, setCompletionTarget] =
    useState<QualityInspectionDto | null>(null)
  const [selectedInspectionId, setSelectedInspectionId] = useState<
    number | null
  >(null)
  const [detail, setDetail] = useState<QualityDetail>(() => {
    if (location.hash.startsWith('#non-conformity-')) return 'nonConformity'
    if (location.hash.startsWith('#material-lot-')) return 'materials'
    return null
  })

  const inspections = useMemo(
    () =>
      [...data.qualityInspections].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      ),
    [data.qualityInspections],
  )

  useQualityHashNavigation({
    hash: location.hash,
    inspections,
    detail,
    selectedInspectionId,
    setDetail,
    setSelectedInspectionId,
  })

  const activeInspection =
    inspections.find((inspection) => inspection.status === 'IN_PROGRESS') ??
    inspections.find((inspection) => inspection.status === 'PENDING') ??
    inspections.at(0) ??
    null

  const selectedInspection =
    inspections.find((inspection) => inspection.id === selectedInspectionId) ??
    activeInspection

  const viewingHistoricalInspection =
    selectedInspection !== null &&
    activeInspection !== null &&
    selectedInspection.id !== activeInspection.id

  const openNonConformity =
    [...data.nonConformities]
      .filter((item) => item.status === 'OPEN')
      .sort((left, right) => right.id - left.id)
      .at(0) ?? null
  const productionRouting =
    data.routingSheets.find((routing) => routing.purpose === 'PRODUCTION') ??
    null

  const canModifyInspection = (inspection: QualityInspectionDto) =>
    inspection.status === 'IN_PROGRESS' &&
    (isAdmin ||
      (isQuality &&
        Number.isFinite(currentUserId) &&
        inspection.inspectorId === currentUserId))

  const selectedCanEdit =
    selectedInspection !== null &&
    !viewingHistoricalInspection &&
    canModifyInspection(selectedInspection)

  const selectedCanStart =
    selectedInspection !== null &&
    !viewingHistoricalInspection &&
    canManageQuality &&
    selectedInspection.status === 'PENDING' &&
    data.workOrder.status === 'QUALITY_PENDING'

  const selectedCanComplete =
    selectedInspection !== null &&
    !viewingHistoricalInspection &&
    canModifyInspection(selectedInspection)

  const startInspection = async (inspectionId: number) => {
    mutations.startInspection.reset()

    try {
      await mutations.startInspection.mutateAsync({
        inspectionId,
        payload: {},
      })
    } catch {
      // El error se presenta en el workspace de Calidad.
    }
  }

  const saveCheck = async (values: QualityCheckFormValues) => {
    if (!checkTarget) return false

    let payload: SaveQualityCheckPayload

    if (values.type === 'NUMERIC_RANGE') {
      if (
        values.nominalValue === undefined ||
        values.lowerLimit === undefined ||
        values.upperLimit === undefined ||
        values.measuredValue === undefined
      ) {
        return false
      }

      payload = {
        type: 'NUMERIC_RANGE',
        name: values.name.trim(),
        nominalValue: values.nominalValue,
        lowerLimit: values.lowerLimit,
        upperLimit: values.upperLimit,
        measuredValue: values.measuredValue,
        unit: values.unit.trim(),
        ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
      }
    } else {
      if (!values.result) return false

      payload = {
        type: 'PASS_FAIL',
        name: values.name.trim(),
        result: values.result,
        ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
      }
    }

    try {
      if (checkTarget.qualityCheck) {
        await mutations.updateCheck.mutateAsync({
          inspectionId: checkTarget.inspectionId,
          checkId: checkTarget.qualityCheck.id,
          payload,
        })
      } else {
        await mutations.addCheck.mutateAsync({
          inspectionId: checkTarget.inspectionId,
          payload,
        })
      }

      setCheckTarget(null)
      return true
    } catch {
      return false
    }
  }

  const completeInspection = async () => {
    if (!completionTarget) return false

    try {
      await mutations.completeInspection.mutateAsync(completionTarget.id)
      setCompletionTarget(null)
      setSelectedInspectionId(null)
      return true
    } catch {
      return false
    }
  }

  const actionError = mutations.startInspection.error
  const latestReworkMaterial = data.materials.at(-1)

  return (
    <div className="space-y-3">
      {!canManageQuality ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-[8px] leading-4 text-slate-500">
          Las inspecciones son de solo lectura para tu rol. Las decisiones de
          Calidad aparecen únicamente cuando tu rol las permite.
        </p>
      ) : null}

      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
          {getErrorMessage(actionError)}
        </p>
      ) : null}

      {viewingHistoricalInspection ? (
        <section className="flex flex-col gap-2 rounded-xl border border-blue-100 bg-blue-50/45 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[8px] leading-4 text-blue-900">
            Estás consultando la inspección #{selectedInspection?.id} como
            referencia histórica. La inspección actual es #
            {activeInspection?.id}.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={() => setSelectedInspectionId(null)}
          >
            Volver a inspección actual
          </Button>
        </section>
      ) : null}

      {selectedInspection?.status === 'PENDING' &&
      data.workOrder.status === 'QUALITY_PENDING' &&
      !viewingHistoricalInspection ? (
        <QualityPendingWorkspace
          inspection={selectedInspection}
          productionRouting={productionRouting}
          executions={data.production.executions}
          plannedQuantity={data.production.plannedQuantity}
          pinnedDocuments={data.workOrder.pinnedDocuments}
          materials={data.materials}
          canStart={selectedCanStart}
          starting={
            mutations.startInspection.isPending &&
            mutations.startInspection.variables?.inspectionId ===
              selectedInspection.id
          }
          onStart={() => {
            void startInspection(selectedInspection.id)
          }}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(285px,0.75fr)] lg:items-stretch">
          <QualityInspectionWorkspace
            inspection={selectedInspection}
            canStart={false}
            canEdit={selectedCanEdit}
            canComplete={false}
            starting={false}
            onStart={() => undefined}
            onAddCheck={() => {
              if (!selectedInspection) return
              mutations.addCheck.reset()
              setCheckTarget({
                inspectionId: selectedInspection.id,
                qualityCheck: null,
              })
            }}
            onEditCheck={(qualityCheck) => {
              if (!selectedInspection) return
              mutations.updateCheck.reset()
              setCheckTarget({
                inspectionId: selectedInspection.id,
                qualityCheck,
              })
            }}
            onComplete={() => undefined}
          />

          <QualityStagePanel
            inspection={selectedInspection}
            openNonConformity={openNonConformity}
            workOrderStatus={data.workOrder.status}
            canStart={selectedCanStart}
            canComplete={selectedCanComplete}
            starting={
              mutations.startInspection.isPending &&
              mutations.startInspection.variables?.inspectionId ===
                selectedInspection?.id
            }
            onStart={() => {
              if (selectedInspection) {
                void startInspection(selectedInspection.id)
              }
            }}
            onComplete={() => {
              if (!selectedInspection) return
              mutations.completeInspection.reset()
              setCompletionTarget(selectedInspection)
            }}
            onOpenNonConformity={() =>
              setDetail((current) =>
                current === 'nonConformity' ? null : 'nonConformity',
              )
            }
            onOpenHistory={() =>
              setDetail((current) => (current === 'history' ? null : 'history'))
            }
            inspectionCount={inspections.length}
          />
        </div>
      )}

      {data.workOrder.status === 'REWORK_IN_PROGRESS' ? (
        <section className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/45 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-amber-700">
              Material de retrabajo
            </p>
            <p className="mt-1 text-[9px] font-semibold text-slate-900">
              {latestReworkMaterial
                ? 'Lote ' +
                  latestReworkMaterial.consumption.lotNumber +
                  ' · ' +
                  latestReworkMaterial.consumption.quantityUsed +
                  ' ' +
                  latestReworkMaterial.consumption.unit
                : 'Sin consumo adicional registrado'}
            </p>
            <p className="mt-1 text-[7px] text-slate-500">
              Registra únicamente material consumido durante la corrección.
            </p>
          </div>
          <Button
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={() =>
              setDetail((current) =>
                current === 'materials' ? null : 'materials',
              )
            }
          >
            {detail === 'materials' ? 'Ocultar materiales' : 'Registrar / ver'}
          </Button>
        </section>
      ) : null}

      {detail === 'nonConformity' ? <NonConformitySection data={data} /> : null}

      {detail === 'materials' &&
      data.workOrder.status === 'REWORK_IN_PROGRESS' ? (
        <ProductionMaterialsCard consumptions={data.materials} />
      ) : null}

      {detail === 'history' ? (
        <QualityInspectionHistory
          inspections={inspections}
          activeInspectionId={activeInspection?.id ?? null}
          onSelect={(inspectionId) => {
            setSelectedInspectionId(inspectionId)
            setDetail(null)
          }}
        />
      ) : null}

      <QualityCheckDialog
        open={checkTarget !== null}
        qualityCheck={checkTarget?.qualityCheck ?? null}
        submitting={
          mutations.addCheck.isPending || mutations.updateCheck.isPending
        }
        error={
          checkTarget?.qualityCheck
            ? mutations.updateCheck.error
            : mutations.addCheck.error
        }
        onClose={() => {
          mutations.addCheck.reset()
          mutations.updateCheck.reset()
          setCheckTarget(null)
        }}
        onSubmit={saveCheck}
      />

      <CompleteQualityInspectionDialog
        inspection={completionTarget}
        submitting={mutations.completeInspection.isPending}
        error={mutations.completeInspection.error}
        onClose={() => {
          mutations.completeInspection.reset()
          setCompletionTarget(null)
        }}
        onConfirm={completeInspection}
      />
    </div>
  )
}
