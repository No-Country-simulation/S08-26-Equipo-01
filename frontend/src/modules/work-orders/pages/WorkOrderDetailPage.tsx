import { useEffect, useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { Button } from '@/shared/components/ui/Button'
import { CancelWorkOrderDialog } from '../components/CancelWorkOrderDialog'
import { WorkOrderAuthorizedOrigin } from '../components/WorkOrderAuthorizedOrigin'
import { WorkOrderDeliveries } from '../components/WorkOrderDeliveries'
import { WorkOrderDetailHeader } from '../components/WorkOrderDetailHeader'
import { WorkOrderDocuments } from '../components/WorkOrderDocuments'
import {
  canOpenWorkOrderView,
  getCurrentWorkOrderView,
  WorkOrderFlowSteps,
  type WorkOrderWorkspaceView,
} from '../components/WorkOrderFlowSteps'
import { WorkOrderPreparation } from '../components/WorkOrderPreparation'
import { WorkOrderProduction } from '../components/WorkOrderProduction'
import { WorkOrderQuality } from '../components/WorkOrderQuality'
import { WorkOrderSecondaryDialog } from '../components/WorkOrderSecondaryDialog'
import { WorkOrderSummary } from '../components/WorkOrderSummary'
import { WorkOrderTraceability } from '../components/WorkOrderTraceability'
import { useCancelWorkOrder } from '../hooks/useCancelWorkOrder'
import { useWorkOrder360 } from '../hooks/useWorkOrder360'
import type { CancelWorkOrderFormValues } from '../schemas/workOrderCancellation.schema'

const workspaceViews: WorkOrderWorkspaceView[] = [
  'summary',
  'preparation',
  'production',
  'quality',
  'delivery',
  'traceability',
]

const operationalViews = [
  'preparation',
  'production',
  'quality',
  'delivery',
] as const

type OperationalView = (typeof operationalViews)[number]
type SecondaryView = 'documents'

const viewLabels: Record<OperationalView, string> = {
  preparation: 'Preparación',
  production: 'Producción',
  quality: 'Calidad',
  delivery: 'Entrega',
}

function isOperationalView(view: WorkOrderWorkspaceView): view is OperationalView {
  return operationalViews.includes(view as OperationalView)
}

export function WorkOrderDetailPage() {
  const { workOrderId } = useParams()
  const session = useSessionStore((state) => state.session)
  const [cancelOpen, setCancelOpen] = useState(false)
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const numericId = Number(workOrderId)
  const validId =
    Number.isInteger(numericId) && numericId > 0 ? numericId : null
  const query = useWorkOrder360(validId)
  const cancelMutation = useCancelWorkOrder(validId ?? 0)

  const requestedView = searchParams.get('view')
  const requestedWorkspaceView = workspaceViews.includes(
    requestedView as WorkOrderWorkspaceView,
  )
    ? (requestedView as WorkOrderWorkspaceView)
    : null
  const secondaryView: SecondaryView | null =
    requestedView === 'documents' ? 'documents' : null

  useEffect(() => {
    if (!query.data || !location.hash) return

    const frame = window.requestAnimationFrame(() => {
      const targetId = decodeURIComponent(location.hash.slice(1))
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [location.hash, query.data, requestedView])

  const cancel = async (values: CancelWorkOrderFormValues) => {
    try {
      await cancelMutation.mutateAsync({
        reason: values.reason.trim() || undefined,
      })
      return true
    } catch {
      return false
    }
  }

  if (validId === null) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={new Error('El identificador de la orden no es válido.')}
          title="No pudimos abrir la orden de trabajo"
        />
      </PageContainer>
    )
  }

  if (query.isPending) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando orden de trabajo…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={query.error}
          title="No pudimos cargar la orden de trabajo"
        />
      </PageContainer>
    )
  }

  const data = query.data
  const roles = session?.user.roles ?? []
  const canCancel =
    data.workOrder.status === 'CREATED' &&
    (roles.includes('ADMIN') || roles.includes('PRODUCTION'))
  const currentView = getCurrentWorkOrderView(data.workOrder.status)
  const activeView =
    requestedWorkspaceView &&
    canOpenWorkOrderView(data.workOrder.status, requestedWorkspaceView)
      ? requestedWorkspaceView
      : currentView
  const historicalViewLabel = isOperationalView(activeView)
    ? viewLabels[activeView]
    : null
  const viewingHistoricalStage =
    historicalViewLabel !== null && activeView !== currentView

  const selectWorkspaceView = (view: WorkOrderWorkspaceView) => {
    if (!canOpenWorkOrderView(data.workOrder.status, view)) return
    setSearchParams({ view })
  }

  const renderWorkspaceContent = () => {
    if (activeView === 'summary') {
      return <WorkOrderSummary data={data} />
    }

    if (activeView === 'production') {
      return <WorkOrderProduction data={data} />
    }

    if (activeView === 'quality') {
      return <WorkOrderQuality data={data} />
    }

    if (activeView === 'delivery') {
      return <WorkOrderDeliveries data={data} />
    }

    if (activeView === 'traceability') {
      return <WorkOrderTraceability data={data} />
    }

    return <WorkOrderPreparation data={data} />
  }

  const closeSecondaryView = () => {
    setSearchParams({ view: currentView })
  }

  return (
    <PageContainer className="py-4 lg:py-3">
      <WorkOrderDetailHeader
        workOrder={data.workOrder}
        canCancel={canCancel}
        onCancel={() => {
          cancelMutation.reset()
          setCancelOpen(true)
        }}
        onOpenDocuments={() => setSearchParams({ view: 'documents' })}
        onOpenTraceability={() => setSearchParams({ view: 'traceability' })}
      />

      <div className="space-y-3">
        <WorkOrderFlowSteps
          status={data.workOrder.status}
          activeView={activeView}
          onSelect={selectWorkspaceView}
        />

        <WorkOrderAuthorizedOrigin workOrder={data.workOrder} />

        {data.workOrder.status === 'CANCELLED' ? (
          <section className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/45 px-3.5 py-2.5">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
            <div>
              <p className="text-[9px] font-semibold text-red-900">
                Orden de trabajo cancelada
              </p>
              <p className="mt-0.5 text-[8px] leading-4 text-red-800/75">
                {data.workOrder.cancellationReason?.trim()
                  ? data.workOrder.cancellationReason
                  : 'No se registró un motivo de cancelación.'}
              </p>
            </div>
          </section>
        ) : null}

        {viewingHistoricalStage && historicalViewLabel ? (
          <section className="flex flex-col gap-2 rounded-xl border border-blue-100 bg-blue-50/45 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[8px] leading-4 text-blue-900">
              Estás consultando <strong>{historicalViewLabel}</strong> como
              referencia histórica. La etapa ya no es editable y el proceso se
              encuentra en <strong>{viewLabels[currentView]}</strong>.
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={() => setSearchParams({ view: currentView })}
            >
              Volver a etapa actual
            </Button>
          </section>
        ) : null}

        {renderWorkspaceContent()}
      </div>

      <WorkOrderSecondaryDialog
        open={secondaryView === 'documents'}
        eyebrow="Orden de trabajo"
        title="Documentos relacionados"
        description="Consulta los documentos del expediente y los recursos vinculados a esta orden."
        onClose={closeSecondaryView}
      >
        <WorkOrderDocuments documents={data.documents} />
      </WorkOrderSecondaryDialog>

      <CancelWorkOrderDialog
        workOrder={cancelOpen ? data.workOrder : null}
        submitting={cancelMutation.isPending}
        error={cancelMutation.error}
        onClose={() => {
          cancelMutation.reset()
          setCancelOpen(false)
        }}
        onSubmit={cancel}
      />
    </PageContainer>
  )
}
