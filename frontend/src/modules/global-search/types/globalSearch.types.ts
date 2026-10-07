export type GlobalSearchResultType =
  | 'CUSTOMER'
  | 'JOB_CASE'
  | 'QUOTATION'
  | 'WORK_ORDER'
  | 'MATERIAL'
  | 'MATERIAL_LOT'
  | 'DOCUMENT'

export interface GlobalSearchResultDto {
  type: GlobalSearchResultType
  resourceId: number
  title: string
  subtitle: string | null
  context: string | null
  status: string | null
  href: string
}

export interface GlobalSearchResponseDto {
  query: string
  results: GlobalSearchResultDto[]
}
