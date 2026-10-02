import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import {
  formatDocumentDateTime,
  formatDocumentFileSize,
  getDocumentContextSummary,
  getDocumentSourceLabel,
} from '../model/documentCenterPresenter'
import type { DocumentCenterDto } from '../types/documentCenter.types'

interface DocumentCenterRowProps {
  document: DocumentCenterDto
  busy: boolean
  onOpen: () => void
  onHistory: () => void
}

export function DocumentCenterRow({
  document,
  busy,
  onOpen,
  onHistory,
}: DocumentCenterRowProps) {
  const contextHref =
    document.caseId && document.caseNumber
      ? `/job-cases/${document.caseId}?tab=documents#document-${document.id}`
      : '/resources?tab=materials'

  return (
    <article className="grid gap-3 border-b border-slate-100 px-4 py-3 transition last:border-b-0 hover:bg-blue-50/25 sm:px-5 lg:grid-cols-[minmax(230px,1.45fr)_150px_minmax(170px,0.9fr)_70px_155px_130px] lg:items-center">
      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold text-slate-950">
          {document.name}
        </p>
        <p className="mt-0.5 truncate text-[8px] text-slate-400">
          {document.currentVersion.fileName} ·{' '}
          {formatDocumentFileSize(document.currentVersion.fileSize)}
        </p>
        <p className="mt-0.5 truncate text-[7px] text-slate-400">
          {getDocumentSourceLabel(document)}
        </p>
      </div>

      <div>
        <Badge tone="neutral" className="px-2 py-0.5 text-[7px]">
          {document.documentType}
        </Badge>
      </div>

      <div className="min-w-0">
        <p className="truncate text-[9px] font-semibold text-slate-700">
          {getDocumentContextSummary(document)}
        </p>
        <Link
          to={contextHref}
          className="mt-0.5 inline-flex text-[7px] font-semibold text-blue-600 hover:underline"
        >
          {document.caseId && document.caseNumber
            ? document.caseNumber
            : 'Recursos · Materiales'}
        </Link>
      </div>

      <p className="text-[9px] font-semibold text-slate-700">
        v{document.currentVersion.version}
      </p>

      <div>
        <p className="text-[8px] text-slate-600">
          {formatDocumentDateTime(document.currentVersion.uploadedAt)}
        </p>
        <p className="mt-0.5 truncate text-[7px] text-slate-400">
          {document.currentVersion.uploadedByName}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 lg:justify-end">
        <Button
          size="sm"
          variant="secondary"
          className="!h-7 !px-2.5 !text-[8px]"
          disabled={busy}
          onClick={onOpen}
        >
          {busy ? 'Abriendo…' : 'Ver'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="!h-7 !px-2 !text-[8px]"
          onClick={onHistory}
        >
          Historial
        </Button>
      </div>
    </article>
  )
}
