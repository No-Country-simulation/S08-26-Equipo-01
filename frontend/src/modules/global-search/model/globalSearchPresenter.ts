import type { BadgeProps } from '@/shared/components/ui/Badge'
import type { GlobalSearchResultType } from '../types/globalSearch.types'

const labels: Record<GlobalSearchResultType, string> = {
  CUSTOMER: 'Cliente',
  JOB_CASE: 'Expediente',
  QUOTATION: 'Cotización',
  WORK_ORDER: 'OT',
  MATERIAL: 'Material',
  MATERIAL_LOT: 'Lote',
  DOCUMENT: 'Documento',
}

const tones: Record<GlobalSearchResultType, BadgeProps['tone']> = {
  CUSTOMER: 'neutral',
  JOB_CASE: 'info',
  QUOTATION: 'info',
  WORK_ORDER: 'warning',
  MATERIAL: 'warning',
  MATERIAL_LOT: 'warning',
  DOCUMENT: 'neutral',
}

export function getGlobalSearchTypeLabel(
  type: GlobalSearchResultType,
): string {
  return labels[type]
}

export function getGlobalSearchTypeTone(
  type: GlobalSearchResultType,
): BadgeProps['tone'] {
  return tones[type]
}

export function formatGlobalSearchStatus(status: string | null): string | null {
  if (!status) return null

  return status
    .toLocaleLowerCase('es-MX')
    .replaceAll('_', ' ')
    .replace(/^./, (value) => value.toLocaleUpperCase('es-MX'))
}
