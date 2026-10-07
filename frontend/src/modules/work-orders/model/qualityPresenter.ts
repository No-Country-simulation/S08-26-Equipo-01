import type { BadgeProps } from '@/shared/components/ui/Badge'
import type {
  NonConformityDisposition,
  QualityInspectionStatus,
  QualityCheckDto,
} from '../types/quality.types'

interface Presentation {
  label: string
  tone: BadgeProps['tone']
}

const inspectionStatusPresentation: Record<
  QualityInspectionStatus,
  Presentation
> = {
  PENDING: { label: 'Pendiente', tone: 'neutral' },
  IN_PROGRESS: { label: 'En inspección', tone: 'info' },
  APPROVED: { label: 'Aprobada', tone: 'success' },
  REJECTED: { label: 'Rechazada', tone: 'danger' },
}

const dispositionLabels: Record<NonConformityDisposition, string> = {
  REWORK: 'Retrabajo',
  SCRAP: 'Scrap',
  USE_AS_IS: 'Uso bajo concesión',
}

export function getQualityInspectionStatusPresentation(
  status: QualityInspectionStatus,
): Presentation {
  return inspectionStatusPresentation[status]
}

export function getNonConformityDispositionLabel(
  disposition: NonConformityDisposition | null,
): string {
  return disposition ? dispositionLabels[disposition] : 'Pendiente de resolver'
}

export function formatQualityDateTime(value: string | null): string {
  if (!value) return 'Sin registrar'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatQualityNumber(value: number | null): string {
  if (value === null) return '—'

  return new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 6,
  }).format(value)
}

export function countQualityCheckResults(
  checks: QualityCheckDto[],
): { pass: number; fail: number } {
  return checks.reduce(
    (totals, qualityCheck) => {
      totals[qualityCheck.result === 'PASS' ? 'pass' : 'fail'] += 1
      return totals
    },
    { pass: 0, fail: 0 },
  )
}

export function getQualityCheckTypeLabel(
  type: QualityCheckDto['type'],
): string {
  return type === 'NUMERIC_RANGE' ? 'Medición' : 'Conformidad'
}
