import type { WorkOrder360Dto } from '../types/workOrder360.types'

function getMaterialLabel(data: WorkOrder360Dto): string {
  const specification = data.workOrder.source.materialSpecification

  if (specification && typeof specification === 'object') {
    const value = specification as Record<string, unknown>
    const materialName =
      typeof value.materialName === 'string' ? value.materialName : null
    const standardOrGrade =
      typeof value.standardOrGrade === 'string' ? value.standardOrGrade : null
    const parts = [materialName, standardOrGrade].filter(Boolean)

    if (parts.length > 0) return parts.join(' / ')
  }

  return (
    data.workOrder.source.materialRequirement?.trim() ||
    'Material pendiente de especificación'
  )
}

export function getWorkOrderPreparationPresentation(data: WorkOrder360Dto) {
  const productionRouting = data.routingSheets.find(
    (routing) => routing.purpose === 'PRODUCTION',
  )
  const planningReady =
    Boolean(data.workOrder.plannedQuantity) &&
    Boolean(data.workOrder.plannedStartDate) &&
    Boolean(data.workOrder.plannedEndDate)
  const documentsReady = data.workOrder.pinnedDocuments.length > 0
  const routingReady = productionRouting?.status === 'RELEASED'
  const readyForProduction = planningReady && documentsReady && routingReady

  const caseDocuments = data.documents.filter(
    ({ document }) => document.caseId !== null,
  )
  const pinnedDocument =
    data.workOrder.pinnedDocuments.find((document) =>
      /PLAN|DRAW|TECH/i.test(document.documentType),
    ) ?? data.workOrder.pinnedDocuments.at(0)
  const availableDocument = caseDocuments.at(0)?.document

  const documentSummary = pinnedDocument
    ? `${pinnedDocument.documentName} · v${pinnedDocument.version} fijada`
    : availableDocument
      ? `${availableDocument.name} · v${availableDocument.currentVersion.version} disponible`
      : 'Sin documento disponible'

  const routingSummary = !productionRouting
    ? 'Pendiente'
    : productionRouting.status === 'DRAFT'
      ? `Borrador · ${productionRouting.operations.length} operaciones`
      : productionRouting.status === 'APPROVED'
        ? 'Aprobada · pendiente liberar'
        : `Liberada · ${productionRouting.operations.length} operaciones`

  return {
    productionRouting,
    planningReady,
    documentsReady,
    routingReady,
    readyForProduction,
    caseDocuments,
    materialLabel: getMaterialLabel(data),
    documentSummary,
    routingSummary,
  }
}
