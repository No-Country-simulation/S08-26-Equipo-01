import { useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { QualityInspectionDto } from '../types/quality.types'

export type QualityDetail = 'nonConformity' | 'materials' | 'history' | null

interface UseQualityHashNavigationArgs {
  hash: string
  inspections: QualityInspectionDto[]
  detail: QualityDetail
  selectedInspectionId: number | null
  setDetail: Dispatch<SetStateAction<QualityDetail>>
  setSelectedInspectionId: Dispatch<SetStateAction<number | null>>
}

export function useQualityHashNavigation({
  hash,
  inspections,
  detail,
  selectedInspectionId,
  setDetail,
  setSelectedInspectionId,
}: UseQualityHashNavigationArgs) {
  useEffect(() => {
    if (!hash) return

    const frame = window.requestAnimationFrame(() => {
      const inspectionMatch = hash.match(/^#quality-inspection-(\d+)$/)

      if (inspectionMatch) {
        setSelectedInspectionId(Number(inspectionMatch[1]))
        return
      }

      const checkMatch = hash.match(/^#quality-(?:check|measurement)-(\d+)$/)

      if (checkMatch) {
        const checkId = Number(checkMatch[1])
        const owner = inspections.find((inspection) =>
          inspection.checks.some((qualityCheck) => qualityCheck.id === checkId),
        )

        if (owner) setSelectedInspectionId(owner.id)
        return
      }

      if (hash.startsWith('#non-conformity-')) {
        setDetail('nonConformity')
        return
      }

      if (hash.startsWith('#material-lot-')) {
        setDetail('materials')
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [hash, inspections, setDetail, setSelectedInspectionId])

  useEffect(() => {
    if (!hash) return

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [detail, hash, selectedInspectionId])
}
