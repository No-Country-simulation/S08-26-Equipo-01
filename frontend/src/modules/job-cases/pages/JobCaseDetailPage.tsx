import { useEffect, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'
import { useCreateQuotation, useQuotations } from '@/modules/quotations'
import { useWorkOrders } from '@/modules/work-orders'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { CompleteJobCaseReviewDialog } from '../components/CompleteJobCaseReviewDialog'
import { InformationRequestForm } from '../components/InformationRequestForm'
import { JobCaseActionBar } from '../components/JobCaseActionBar'
import { JobCaseClarifications } from '../components/JobCaseClarifications'
import { JobCaseDetailHeader } from '../components/JobCaseDetailHeader'
import { JobCaseDocuments } from '../components/JobCaseDocuments'
import { JobCaseFlowSteps } from '../components/JobCaseFlowSteps'
import { JobCaseMaterial } from '../components/JobCaseMaterial'
import { JobCaseRecentActivity } from '../components/JobCaseRecentActivity'
import { JobCaseSourceCard } from '../components/JobCaseSourceCard'
import { JobCaseSummary } from '../components/JobCaseSummary'
import { JobCaseTimelineDialog } from '../components/JobCaseTimelineDialog'
import { MaterialSpecificationForm } from '../components/MaterialSpecificationForm'
import { useJobCaseDetail } from '../hooks/useJobCaseDetail'
import {
  useCompleteJobCaseReview,
  useDefineJobCaseMaterial,
  useRequestJobCaseInformation,
  useTakeJobCase,
} from '../hooks/useJobCaseMutations'
import { useJobCaseRecentActivity } from '../hooks/useJobCaseTimeline'

type ActionPanel = 'information' | 'material' | null

export function JobCaseDetailPage() {
  const { caseId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [actionPanel, setActionPanel] = useState<ActionPanel>(null)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const historyDialogOpen = searchParams.get('view') === 'traceability'
  const session = useSessionStore((state) => state.session)
  const numericId = Number(caseId)
  const validId =
    Number.isInteger(numericId) && numericId > 0 ? numericId : null
  const detailQuery = useJobCaseDetail(validId)
  const canReadQuotationFlow =
    session?.user.roles.includes('ADMIN') === true ||
    session?.user.roles.includes('COMMERCIAL') === true
  const quotationsQuery = useQuotations(canReadQuotationFlow)
  const workOrdersQuery = useWorkOrders(validId !== null)
  const recentActivityQuery = useJobCaseRecentActivity(validId)
  const takeMutation = useTakeJobCase(validId ?? 0)
  const infoMutation = useRequestJobCaseInformation(validId ?? 0)
  const materialMutation = useDefineJobCaseMaterial(validId ?? 0)
  const completeMutation = useCompleteJobCaseReview(validId ?? 0)
  const createQuotationMutation = useCreateQuotation()

  useEffect(() => {
    if (!detailQuery.data || !location.hash) return

    const frame = window.requestAnimationFrame(() => {
      const targetId = decodeURIComponent(location.hash.slice(1))
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [detailQuery.data, location.hash])

  if (validId === null || !session) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={new Error('No fue posible abrir este expediente.')}
          title="Expediente no disponible"
        />
      </PageContainer>
    )
  }

  if (detailQuery.isPending) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando expediente…" />
      </PageContainer>
    )
  }

  if (detailQuery.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={detailQuery.error}
          title="No pudimos cargar el expediente"
        />
      </PageContainer>
    )
  }

  const jobCase = detailQuery.data
  const currentQuotation =
    quotationsQuery.data?.find((quotation) => quotation.caseId === validId) ??
    null
  const workOrderId =
    workOrdersQuery.data?.find((workOrder) => workOrder.caseId === validId)
      ?.id ?? null
  const quotationLookupReady =
    !canReadQuotationFlow ||
    (!quotationsQuery.isPending && !quotationsQuery.isError)
  const mutationError =
    takeMutation.error ??
    infoMutation.error ??
    materialMutation.error ??
    completeMutation.error ??
    createQuotationMutation.error

  const submitInformation = async (values: { question: string }) => {
    await infoMutation.mutateAsync(values)
    setActionPanel(null)
  }

  const submitMaterial = async (values: {
    materialName: string
    standardOrGrade: string
    technicalNotes: string
  }) => {
    await materialMutation.mutateAsync(values)
    setActionPanel(null)
  }

  const completeReview = async () => {
    try {
      await completeMutation.mutateAsync()
      setCompleteDialogOpen(false)
    } catch {
      // The mutation error remains visible inside the confirmation dialog.
    }
  }

  const createQuotation = async () => {
    const quotation = await createQuotationMutation.mutateAsync(validId)
    navigate(`/quotations/${quotation.id}`)
  }

  return (
    <PageContainer className="py-4 lg:py-3">
      <JobCaseDetailHeader jobCase={jobCase} />

      <div className="space-y-4">
        <JobCaseFlowSteps status={jobCase.status} />

        <JobCaseSourceCard jobCase={jobCase} />

        {mutationError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700"
          >
            {getErrorMessage(mutationError)}
          </div>
        ) : null}

        {canReadQuotationFlow &&
        jobCase.status === 'READY_FOR_QUOTATION' &&
        quotationsQuery.isError ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-[8px] leading-4 text-amber-800">
            No pudimos verificar si este expediente ya tiene una cotización.
            Vuelve a intentarlo antes de iniciar un flujo comercial para evitar
            duplicados.
          </div>
        ) : null}

        {actionPanel === 'information' ? (
          <InformationRequestForm
            isSubmitting={infoMutation.isPending}
            onCancel={() => setActionPanel(null)}
            onSubmit={submitInformation}
          />
        ) : null}

        {actionPanel === 'material' ? (
          <MaterialSpecificationForm
            current={jobCase.materialSpecification}
            isSubmitting={materialMutation.isPending}
            onCancel={() => setActionPanel(null)}
            onSubmit={submitMaterial}
          />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-stretch">
          <JobCaseSummary jobCase={jobCase} />

          <JobCaseActionBar
            jobCase={jobCase}
            user={session.user}
            taking={takeMutation.isPending}
            completing={completeMutation.isPending}
            creatingQuotation={createQuotationMutation.isPending}
            quotationId={currentQuotation?.id ?? null}
            quotationLookupReady={quotationLookupReady}
            onTake={() => takeMutation.mutate()}
            onRequestInformation={() => setActionPanel('information')}
            onDefineMaterial={() => setActionPanel('material')}
            onComplete={() => setCompleteDialogOpen(true)}
            onCreateQuotation={() => void createQuotation()}
            onOpenQuotation={() => {
              if (currentQuotation) {
                navigate(`/quotations/${currentQuotation.id}`)
              }
            }}
          />
        </div>

        <JobCaseDocuments documents={jobCase.documents} />

        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <JobCaseMaterial
            specification={jobCase.materialSpecification}
            request={jobCase.request}
          />

          <JobCaseClarifications requests={jobCase.informationRequests} />
        </div>

        {recentActivityQuery.isPending ? (
          <LoadingState label="Cargando actividad reciente…" />
        ) : recentActivityQuery.isError ? (
          <ErrorState
            error={recentActivityQuery.error}
            title="No pudimos cargar la actividad reciente"
          />
        ) : (
          <JobCaseRecentActivity
            caseId={validId}
            workOrderId={workOrderId}
            events={recentActivityQuery.data.items}
            hasMore={recentActivityQuery.data.hasMore}
            onOpenHistory={() => {
              const next = new URLSearchParams(searchParams)
              next.set('view', 'traceability')
              setSearchParams(next)
            }}
          />
        )}
      </div>

      <JobCaseTimelineDialog
        open={historyDialogOpen}
        caseId={validId}
        caseNumber={jobCase.caseNumber}
        workOrderId={workOrderId}
        onClose={() => {
          const next = new URLSearchParams(searchParams)
          next.delete('view')
          setSearchParams(next, { replace: true })
        }}
      />

      <CompleteJobCaseReviewDialog
        open={completeDialogOpen}
        jobCase={jobCase}
        submitting={completeMutation.isPending}
        error={completeMutation.error}
        onClose={() => {
          if (!completeMutation.isPending) {
            completeMutation.reset()
            setCompleteDialogOpen(false)
          }
        }}
        onConfirm={() => void completeReview()}
      />
    </PageContainer>
  )
}
