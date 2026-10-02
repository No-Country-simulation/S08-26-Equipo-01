import { useMemo, useState } from 'react'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { DocumentCenterFilters } from '../components/DocumentCenterFilters'
import { DocumentCenterRow } from '../components/DocumentCenterRow'
import { DocumentHistoryDialog } from '../components/DocumentHistoryDialog'
import { useDocumentCenter } from '../hooks/useDocumentCenter'
import { useDocumentFileActions } from '../hooks/useDocumentFileActions'
import { documentMatchesSearch } from '../model/documentCenterPresenter'
import type {
  DocumentCenterDto,
  DocumentContextDto,
} from '../types/documentCenter.types'

export function DocumentCenterPage() {
  const query = useDocumentCenter()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('ALL')
  const [context, setContext] = useState<DocumentContextDto | 'ALL'>('ALL')
  const [customerId, setCustomerId] = useState<number | 'ALL'>('ALL')
  const [historyDocument, setHistoryDocument] =
    useState<DocumentCenterDto | null>(null)
  const {
    busyVersionId,
    error: fileError,
    openVersion,
    downloadVersion,
  } = useDocumentFileActions()

  const visibleDocuments = useMemo(() => {
    if (!query.data) return []

    return query.data.filter((document) => {
      if (!documentMatchesSearch(document, search)) return false
      if (type !== 'ALL' && document.documentType !== type) return false
      if (context !== 'ALL' && !document.contexts.includes(context)) {
        return false
      }
      if (customerId !== 'ALL' && document.customerId !== customerId) {
        return false
      }
      return true
    })
  }, [context, customerId, query.data, search, type])

  if (query.isPending) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando centro documental…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={query.error}
          title="No pudimos cargar el centro documental"
        />
      </PageContainer>
    )
  }

  const documents = query.data
  const caseDocuments = documents.filter((document) =>
    document.contexts.includes('CASE'),
  ).length
  const workOrderDocuments = documents.filter((document) =>
    document.contexts.includes('WORK_ORDER'),
  ).length
  const resourceDocuments = documents.filter(
    (document) =>
      document.contexts.includes('MATERIAL') ||
      document.contexts.includes('DELIVERY'),
  ).length
  const hasFilters =
    search.length > 0 ||
    type !== 'ALL' ||
    context !== 'ALL' ||
    customerId !== 'ALL'

  const clearFilters = () => {
    setSearch('')
    setType('ALL')
    setContext('ALL')
    setCustomerId('ALL')
  }

  return (
    <PageContainer className="py-4 lg:py-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
        <div className="px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
              <SidebarNavIcon name="documents" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Operación
              </p>
              <h1 className="mt-0.5 text-[20px] font-bold tracking-tight text-slate-950">
                Centro documental
              </h1>
              <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500">
                Consulta documentos vigentes y su historial conservando el vínculo
                con expediente, orden de trabajo, material o entrega.
              </p>
            </div>
          </div>

          <div className="mt-4 grid border-t border-slate-200/80 pt-3 sm:grid-cols-4">
            <Metric label="Documentos" value={documents.length} />
            <Metric label="Expediente" value={caseDocuments} separated />
            <Metric label="Orden de trabajo" value={workOrderDocuments} separated />
            <Metric label="Material / entrega" value={resourceDocuments} separated />
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
        <div className="flex flex-col gap-2 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Biblioteca transversal
            </p>
            <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
              Documentos vigentes
            </h2>
          </div>
          <p className="text-[8px] text-slate-400">
            {visibleDocuments.length} de {documents.length} visibles
          </p>
        </div>

        <DocumentCenterFilters
          documents={documents}
          search={search}
          type={type}
          context={context}
          customerId={customerId}
          onSearchChange={setSearch}
          onTypeChange={setType}
          onContextChange={setContext}
          onCustomerChange={setCustomerId}
        />

        {hasFilters ? (
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2 sm:px-5">
            <p className="text-[8px] text-slate-400">Filtros aplicados</p>
            <button
              type="button"
              onClick={clearFilters}
              className="text-[8px] font-semibold text-blue-600 hover:text-blue-700"
            >
              Limpiar filtros
            </button>
          </div>
        ) : null}

        {fileError ? (
          <p className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700 sm:mx-5">
            {getErrorMessage(fileError)}
          </p>
        ) : null}

        <div className="hidden border-b border-slate-100 bg-white px-5 py-2.5 text-[7px] font-bold uppercase tracking-[0.08em] text-slate-400 lg:grid lg:grid-cols-[minmax(230px,1.45fr)_150px_minmax(170px,0.9fr)_70px_155px_130px]">
          <span>Documento</span>
          <span>Tipo</span>
          <span>Contexto</span>
          <span>Versión</span>
          <span>Actualizado</span>
          <span className="text-right">Acciones</span>
        </div>

        {visibleDocuments.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No hay documentos para mostrar"
              description="Prueba otra búsqueda o cambia los filtros."
            />
          </div>
        ) : (
          visibleDocuments.map((document) => (
            <DocumentCenterRow
              key={document.id}
              document={document}
              busy={busyVersionId === document.currentVersion.id}
              onOpen={() =>
                void openVersion(document, document.currentVersion.id)
              }
              onHistory={() => setHistoryDocument(document)}
            />
          ))
        )}

        <p className="border-t border-slate-100 bg-slate-50/55 px-4 py-2 text-[7px] leading-3 text-slate-400 sm:px-5">
          Una nueva versión no reemplaza el historial. Las referencias operativas
          conservan la versión exacta que utilizaron.
        </p>
      </section>

      <DocumentHistoryDialog
        document={historyDocument}
        busyVersionId={busyVersionId}
        onClose={() => setHistoryDocument(null)}
        onOpenVersion={(versionId) => {
          if (historyDocument) {
            void openVersion(historyDocument, versionId)
          }
        }}
        onDownloadVersion={(versionId, fileName) => {
          if (historyDocument) {
            void downloadVersion(historyDocument, versionId, fileName)
          }
        }}
      />
    </PageContainer>
  )
}

function Metric({
  label,
  value,
  separated = false,
}: {
  label: string
  value: number
  separated?: boolean
}) {
  return (
    <div
      className={
        separated
          ? 'border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1'
          : 'py-1 sm:pr-4'
      }
    >
      <p className="text-[8px] font-medium text-slate-400">{label}</p>
      <p className="mt-0.5 text-[16px] font-bold text-slate-950">{value}</p>
    </div>
  )
}
