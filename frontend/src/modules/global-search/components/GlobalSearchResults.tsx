import { Badge } from '@/shared/components/ui/Badge'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  formatGlobalSearchStatus,
  getGlobalSearchTypeLabel,
  getGlobalSearchTypeTone,
} from '../model/globalSearchPresenter'
import type { GlobalSearchResultDto } from '../types/globalSearch.types'

interface GlobalSearchResultsProps {
  query: string
  results: GlobalSearchResultDto[]
  pending: boolean
  error: unknown
  onSelect: (result: GlobalSearchResultDto) => void
}

export function GlobalSearchResults({
  query,
  results,
  pending,
  error,
  onSelect,
}: GlobalSearchResultsProps) {
  const normalized = query.trim()

  if (normalized.length < 2) {
    return (
      <div className="px-4 py-4 text-center">
        <p className="text-[10px] font-semibold text-slate-700">
          Busca en toda la operación
        </p>
        <p className="mt-1 text-[8px] leading-4 text-slate-400">
          Usa folios, empresa, material, lote o nombre de documento.
        </p>
      </div>
    )
  }

  if (pending) {
    return (
      <div className="px-4 py-4 text-center text-[9px] text-slate-500">
        Buscando…
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-3">
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
          {getErrorMessage(error)}
        </p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="px-4 py-4 text-center">
        <p className="text-[10px] font-semibold text-slate-700">
          Sin coincidencias
        </p>
        <p className="mt-1 text-[8px] text-slate-400">
          Prueba con otro folio, nombre o referencia.
        </p>
      </div>
    )
  }

  return (
    <div className="max-h-[min(62vh,480px)] overflow-y-auto py-1.5">
      {results.map((result) => {
        const status = formatGlobalSearchStatus(result.status)

        return (
          <button
            key={`${result.type}-${result.resourceId}`}
            type="button"
            onClick={() => onSelect(result)}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition hover:bg-blue-50/35 focus:bg-blue-50 focus:outline-none"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  tone={getGlobalSearchTypeTone(result.type)}
                  className="px-2 py-0.5 text-[7px]"
                >
                  {getGlobalSearchTypeLabel(result.type)}
                </Badge>
                {status ? (
                  <span className="text-[7px] font-medium text-slate-400">
                    {status}
                  </span>
                ) : null}
              </div>

              <p className="mt-1 truncate text-[10px] font-semibold text-slate-950">
                {result.title}
              </p>

              {result.subtitle ? (
                <p className="mt-0.5 truncate text-[8px] text-slate-600">
                  {result.subtitle}
                </p>
              ) : null}

              {result.context ? (
                <p className="mt-0.5 truncate text-[7px] text-slate-400">
                  {result.context}
                </p>
              ) : null}
            </div>

            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="h-3 w-3 shrink-0 text-slate-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 10h8" />
              <path d="m11 7 3 3-3 3" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
