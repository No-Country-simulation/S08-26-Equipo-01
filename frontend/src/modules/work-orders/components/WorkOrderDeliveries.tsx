import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { CancelDeliveryDialog } from './CancelDeliveryDialog'
import {
  CompleteDeliveryDialog,
  type DeliveryEvidenceOption,
} from './CompleteDeliveryDialog'
import { CreateDeliveryDialog } from './CreateDeliveryDialog'
import { DeliveryCard } from './DeliveryCard'
import { DeliveryEvidenceDialog } from './DeliveryEvidenceDialog'
import { DeliveryStagePanel } from './DeliveryStagePanel'
import { DeliveryWorkspace } from './DeliveryWorkspace'
import { DispatchDeliveryDialog } from './DispatchDeliveryDialog'
import { useDeliveryMutations } from '../hooks/useDeliveryMutations'
import {
  getAvailableDeliveryQuantity,
  getDeliveredQuantity,
  getOpenDeliveryQuantity,
} from '../model/deliveryPresenter'
import type {
  AttachDeliveryEvidenceFormValues,
  CancelDeliveryFormValues,
  CompleteDeliveryFormValues,
  CreateDeliveryFormValues,
  DispatchDeliveryFormValues,
} from '../schemas/delivery.schemas'
import type { DeliveryDto } from '../types/delivery.types'
import type { WorkOrder360Dto } from '../types/workOrder360.types'

interface WorkOrderDeliveriesProps {
  data: WorkOrder360Dto
}

type DialogType = 'dispatch' | 'complete' | 'evidence' | 'cancel' | null

export function WorkOrderDeliveries({ data }: WorkOrderDeliveriesProps) {
  const session = useSessionStore((state) => state.session)
  const location = useLocation()
  const roles = session?.user.roles ?? []
  const canManage = roles.includes('ADMIN') || roles.includes('LOGISTICS')
  const mutations = useDeliveryMutations()
  const [createOpen, setCreateOpen] = useState(false)
  const [target, setTarget] = useState<DeliveryDto | null>(null)
  const [dialog, setDialog] = useState<DialogType>(null)
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(
    null,
  )

  const deliveries = useMemo(
    () =>
      [...data.deliveries].sort(
        (left, right) =>
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime(),
      ),
    [data.deliveries],
  )

  const evidenceOptions = useMemo<DeliveryEvidenceOption[]>(
    () =>
      data.documents
        .filter((entry) => entry.document.documentType === 'DELIVERY_EVIDENCE')
        .flatMap((entry) =>
          entry.versions.map((version) => ({
            id: version.id,
            label: `${entry.document.name} · v${version.version} · ${version.fileName}`,
          })),
        ),
    [data.documents],
  )

  const latestFirst = [...deliveries].reverse()
  const priorityDelivery =
    latestFirst.find((delivery) => delivery.status === 'DISPATCHED') ??
    latestFirst.find((delivery) => delivery.status === 'PENDING') ??
    latestFirst.find((delivery) => delivery.status === 'DELIVERED') ??
    latestFirst.at(0) ??
    null

  const selectedDelivery =
    deliveries.find((delivery) => delivery.id === selectedDeliveryId) ??
    priorityDelivery

  useEffect(() => {
    const match = location.hash.match(/^#delivery-(\d+)$/)
    if (!match) return

    const deliveryId = Number(match[1])
    if (!deliveries.some((delivery) => delivery.id === deliveryId)) return

    setSelectedDeliveryId(deliveryId)
  }, [deliveries, location.hash])

  useEffect(() => {
    if (!selectedDelivery || location.hash !== `#delivery-${selectedDelivery.id}`) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`delivery-${selectedDelivery.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [location.hash, selectedDelivery])

  const plannedQuantity = data.workOrder.plannedQuantity ?? 0
  const inProgressQuantity = getOpenDeliveryQuantity(deliveries)
  const deliveredQuantity = getDeliveredQuantity(deliveries)
  const availableQuantity = getAvailableDeliveryQuantity(
    data.workOrder.plannedQuantity,
    deliveries,
  )
  const canCreate =
    canManage &&
    data.workOrder.status === 'READY_FOR_DELIVERY' &&
    availableQuantity > 0
  const viewingAnotherDelivery =
    selectedDelivery !== null &&
    priorityDelivery !== null &&
    selectedDelivery.id !== priorityDelivery.id

  const actionError =
    mutations.create.error ??
    mutations.dispatch.error ??
    mutations.complete.error ??
    mutations.uploadEvidence.error ??
    mutations.attachEvidence.error ??
    mutations.cancel.error

  const create = async (values: CreateDeliveryFormValues) => {
    try {
      await mutations.create.mutateAsync({
        workOrderId: data.workOrder.id,
        payload: {
          quantity: values.quantity,
          ...(values.destinationLabel.trim()
            ? { destinationLabel: values.destinationLabel.trim() }
            : {}),
          ...(values.destinationContactName.trim()
            ? { destinationContactName: values.destinationContactName.trim() }
            : {}),
          destinationAddress: values.destinationAddress.trim(),
          destinationCity: values.destinationCity.trim(),
          destinationState: values.destinationState.trim(),
          destinationPostalCode: values.destinationPostalCode.trim(),
          destinationCountry: values.destinationCountry.trim(),
          ...(values.destinationInstructions.trim()
            ? {
                destinationInstructions:
                  values.destinationInstructions.trim(),
              }
            : {}),
          deliveryMethod: values.deliveryMethod.trim(),
        },
      })
      setSelectedDeliveryId(null)
      return true
    } catch {
      return false
    }
  }

  const dispatch = async (values: DispatchDeliveryFormValues) => {
    if (!target) return false

    try {
      await mutations.dispatch.mutateAsync({
        deliveryId: target.id,
        payload: {
          ...(values.carrier.trim() ? { carrier: values.carrier.trim() } : {}),
          ...(values.trackingNumber.trim()
            ? { trackingNumber: values.trackingNumber.trim() }
            : {}),
        },
      })
      setTarget(null)
      setDialog(null)
      setSelectedDeliveryId(null)
      return true
    } catch {
      return false
    }
  }

  const complete = async (
    values: CompleteDeliveryFormValues,
    evidenceFile: File | null,
  ) => {
    if (!target) return false

    try {
      let evidenceDocumentVersionId = values.evidenceDocumentVersionId
        ? Number(values.evidenceDocumentVersionId)
        : undefined

      if (evidenceFile) {
        const updatedDelivery = await mutations.uploadEvidence.mutateAsync({
          deliveryId: target.id,
          file: evidenceFile,
        })
        evidenceDocumentVersionId =
          updatedDelivery.evidenceDocumentVersionId ?? undefined
        setTarget(updatedDelivery)
      }

      await mutations.complete.mutateAsync({
        deliveryId: target.id,
        payload: {
          receivedByName: values.receivedByName.trim(),
          deliveredAt: new Date(values.deliveredAt).toISOString(),
          ...(evidenceDocumentVersionId
            ? { evidenceDocumentVersionId }
            : {}),
        },
      })
      setTarget(null)
      setDialog(null)
      setSelectedDeliveryId(null)
      return true
    } catch {
      return false
    }
  }

  const uploadEvidence = async (file: File) => {
    if (!target) return false

    try {
      await mutations.uploadEvidence.mutateAsync({
        deliveryId: target.id,
        file,
      })
      setTarget(null)
      setDialog(null)
      setSelectedDeliveryId(null)
      return true
    } catch {
      return false
    }
  }

  const attachEvidence = async (values: AttachDeliveryEvidenceFormValues) => {
    if (!target) return false

    try {
      await mutations.attachEvidence.mutateAsync({
        deliveryId: target.id,
        payload: { documentVersionId: Number(values.documentVersionId) },
      })
      setTarget(null)
      setDialog(null)
      setSelectedDeliveryId(null)
      return true
    } catch {
      return false
    }
  }

  const cancel = async (values: CancelDeliveryFormValues) => {
    if (!target) return false

    try {
      await mutations.cancel.mutateAsync({
        deliveryId: target.id,
        payload: { reason: values.reason.trim() },
      })
      setTarget(null)
      setDialog(null)
      setSelectedDeliveryId(null)
      return true
    } catch {
      return false
    }
  }

  const openDialog = (delivery: DeliveryDto, type: DialogType) => {
    mutations.dispatch.reset()
    mutations.complete.reset()
    mutations.uploadEvidence.reset()
    mutations.attachEvidence.reset()
    mutations.cancel.reset()
    setTarget(delivery)
    setDialog(type)
  }

  return (
    <div className="space-y-3">
      {data.workOrder.status !== 'READY_FOR_DELIVERY' &&
      data.workOrder.status !== 'DELIVERED' ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2.5 text-[8px] leading-4 text-amber-800">
          Esta es una consulta histórica. La OT debe estar READY_FOR_DELIVERY
          para crear o gestionar nuevos despachos.
        </p>
      ) : null}

      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
          {getErrorMessage(actionError)}
        </p>
      ) : null}

      {viewingAnotherDelivery ? (
        <section className="flex flex-col gap-2 rounded-xl border border-blue-100 bg-blue-50/45 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[8px] leading-4 text-blue-900">
            Estás consultando la entrega #{selectedDelivery.id}. La entrega con
            prioridad operativa es #{priorityDelivery.id}.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={() => setSelectedDeliveryId(null)}
          >
            Volver a entrega prioritaria
          </Button>
        </section>
      ) : null}

      <div
        id={selectedDelivery ? `delivery-${selectedDelivery.id}` : undefined}
        className="scroll-mt-24 grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(285px,0.75fr)] lg:items-stretch"
      >
        <DeliveryWorkspace
          delivery={selectedDelivery}
          plannedQuantity={plannedQuantity}
          availableQuantity={availableQuantity}
          requestedDestination={data.workOrder.source.deliveryDestination}
        />

        <DeliveryStagePanel
          delivery={selectedDelivery}
          plannedQuantity={plannedQuantity}
          inProgressQuantity={inProgressQuantity}
          deliveredQuantity={deliveredQuantity}
          availableQuantity={availableQuantity}
          canManage={canManage}
          canCreate={canCreate}
          onCreate={() => {
            mutations.create.reset()
            setCreateOpen(true)
          }}
          onDispatch={() => {
            if (selectedDelivery) openDialog(selectedDelivery, 'dispatch')
          }}
          onComplete={() => {
            if (selectedDelivery) openDialog(selectedDelivery, 'complete')
          }}
          onEvidence={() => {
            if (selectedDelivery) openDialog(selectedDelivery, 'evidence')
          }}
          onCancel={() => {
            if (selectedDelivery) openDialog(selectedDelivery, 'cancel')
          }}
        />
      </div>

      {deliveries.length > 0 ? (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
          <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Historial logístico
              </p>
              <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
                Entregas de la orden
              </h2>
            </div>
            <span className="text-[8px] text-slate-400">
              {deliveries.length} registro
              {deliveries.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {[...deliveries].reverse().map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                selected={delivery.id === selectedDelivery?.id}
                onSelect={() => setSelectedDeliveryId(delivery.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <CreateDeliveryDialog
        open={createOpen}
        availableQuantity={availableQuantity}
        requestedDestination={data.workOrder.source.deliveryDestination}
        submitting={mutations.create.isPending}
        error={mutations.create.error}
        onClose={() => {
          mutations.create.reset()
          setCreateOpen(false)
        }}
        onSubmit={create}
      />

      <DispatchDeliveryDialog
        delivery={dialog === 'dispatch' ? target : null}
        submitting={mutations.dispatch.isPending}
        error={mutations.dispatch.error}
        onClose={() => {
          mutations.dispatch.reset()
          setTarget(null)
          setDialog(null)
        }}
        onSubmit={dispatch}
      />

      <CompleteDeliveryDialog
        delivery={dialog === 'complete' ? target : null}
        evidenceOptions={evidenceOptions}
        submitting={mutations.complete.isPending}
        uploading={mutations.uploadEvidence.isPending}
        error={mutations.complete.error}
        uploadError={mutations.uploadEvidence.error}
        onClose={() => {
          mutations.complete.reset()
          mutations.uploadEvidence.reset()
          setTarget(null)
          setDialog(null)
        }}
        onSubmit={complete}
      />

      <DeliveryEvidenceDialog
        delivery={dialog === 'evidence' ? target : null}
        options={evidenceOptions}
        submitting={mutations.attachEvidence.isPending}
        uploading={mutations.uploadEvidence.isPending}
        error={mutations.attachEvidence.error}
        uploadError={mutations.uploadEvidence.error}
        onClose={() => {
          mutations.uploadEvidence.reset()
          mutations.attachEvidence.reset()
          setTarget(null)
          setDialog(null)
        }}
        onSubmit={attachEvidence}
        onUpload={uploadEvidence}
      />

      <CancelDeliveryDialog
        delivery={dialog === 'cancel' ? target : null}
        submitting={mutations.cancel.isPending}
        error={mutations.cancel.error}
        onClose={() => {
          mutations.cancel.reset()
          setTarget(null)
          setDialog(null)
        }}
        onSubmit={cancel}
      />
    </div>
  )
}
