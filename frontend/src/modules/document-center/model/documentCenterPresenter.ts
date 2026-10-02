import type {
  DocumentCenterDto,
  DocumentContextDto,
} from '../types/documentCenter.types'

const contextLabels: Record<DocumentContextDto, string> = {
  CASE: 'Expediente',
  WORK_ORDER: 'Orden de trabajo',
  MATERIAL: 'Material',
  DELIVERY: 'Entrega',
}

export function getDocumentContextLabel(context: DocumentContextDto): string {
  return contextLabels[context]
}

export function getDocumentContextSummary(document: DocumentCenterDto): string {
  if (document.deliveryIds.length > 0) {
    const first = document.deliveryIds[0]
    const suffix =
      document.deliveryIds.length > 1
        ? ` +${document.deliveryIds.length - 1}`
        : ''
    return `Entrega #${first}${suffix}`
  }

  if (document.materialLotNumbers.length > 0) {
    const first = document.materialLotNumbers[0]
    const suffix =
      document.materialLotNumbers.length > 1
        ? ` +${document.materialLotNumbers.length - 1}`
        : ''
    return `Lote ${first}${suffix}`
  }

  if (document.workOrderNumbers.length > 0) {
    const first = document.workOrderNumbers[0]
    const suffix =
      document.workOrderNumbers.length > 1
        ? ` +${document.workOrderNumbers.length - 1}`
        : ''
    return `${first}${suffix}`
  }

  return document.caseNumber ?? 'Documento operativo'
}

export function getDocumentSourceLabel(document: DocumentCenterDto): string {
  if (document.customerName && document.requestNumber) {
    return `${document.customerName} · ${document.requestNumber}`
  }

  if (document.materialLotNumbers.length > 0) {
    return `Recurso global · lote ${document.materialLotNumbers[0]}`
  }

  return 'Recurso operativo global'
}

export function formatDocumentDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatDocumentFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function documentMatchesSearch(
  document: DocumentCenterDto,
  search: string,
): boolean {
  const term = search.trim().toLocaleLowerCase()
  if (!term) return true

  return [
    document.name,
    document.documentType,
    document.description ?? '',
    document.customerName ?? '',
    document.requestNumber ?? '',
    document.caseNumber ?? '',
    document.currentVersion.fileName,
    document.currentVersion.uploadedByName,
    ...document.workOrderNumbers,
    ...document.materialLotNumbers,
    ...document.deliveryIds.map(String),
  ].some((value) => value.toLocaleLowerCase().includes(term))
}
