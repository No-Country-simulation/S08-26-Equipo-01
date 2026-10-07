export interface MaterialDto {
  id: number
  code: string
  name: string
  specification: string | null
  unit: string
  technicalSheetDocumentId: number | null
  technicalSheetDocumentVersionId: number | null
  technicalSheetFileName: string | null
  createdAt: string
  updatedAt: string
}

export interface MaterialLotDto {
  id: number
  materialId: number
  materialCode: string
  materialName: string
  lotNumber: string
  supplier: string | null
  receivedAt: string
  quantityReceived: number
  certificateDocumentId: number | null
  certificateDocumentVersionId: number | null
  certificateFileName: string | null
  createdAt: string
}

export interface CreateMaterialPayload {
  code: string
  name: string
  specification?: string
  unit: string
}

export interface CreateMaterialLotPayload {
  lotNumber: string
  supplier?: string
  receivedAt?: string
  quantityReceived: number
}

export interface WorkOrderMaterialPlanDto {
  id: number
  workOrderId: number
  materialId: number
  materialCode: string
  materialName: string
  plannedQuantity: number
  unit: string
  plannedByUserId: number
  plannedByName: string | null
  plannedAt: string
  updatedAt: string
}

export interface UpsertWorkOrderMaterialPlanPayload {
  materialId: number
  plannedQuantity: number
}

export interface WorkOrderMaterialDto {
  id: number
  workOrderId: number
  materialLotId: number
  materialId: number
  materialCode: string
  materialName: string
  lotNumber: string
  quantityUsed: number
  unit: string
  recordedByUserId: number
  recordedByName: string | null
  recordedAt: string
}

export interface RecordMaterialConsumptionPayload {
  materialLotId: number
  quantityUsed: number
}
