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
  activeIndex: number
  listboxId: string
  optionIdPrefix: string
  onActiveIndexChange: (index: number) => void
  onSelect: (result: GlobalSearchResultDto) => void
}

export function GlobalSearchResults({
  query,
  results,
  pending,
  error,
  activeIndex,
  listboxId,
  optionIdPrefix,
  onActiveIndexChange,
  onSelect,
}: GlobalSearchResultsProps) {
  const normalized = query.trim()

  if (normalized.length < 2) {
    return (
      <div id={listboxId} className="px-4 py-4 text-center" role="status">
        <p className="text-[11px] font-semibold text-slate-700">
          Busca en toda la operación
        </p>
        <p className="mt-1 text-[9px] leading-4 text-slate-500">
          Usa folios, empresa, material, lote o nombre de documento.
        </p>
      </div>
    )
  }

  if (pending) {
    return (
      <div
        id={listboxId}
        className="px-4 py-4 text-center text-[10px] text-slate-600"
        role="status"
        aria-live="polite"
      >
        Buscando…
      </div>
    )
  }

  if (error) {
    return (
      <div id={listboxId} className="px-4 py-3" role="status">
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] leading-4 text-red-700">
          {getErrorMessage(error)}
        </p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div id={listboxId} className="px-4 py-4 text-center" role="status">
        <p className="text-[11px] font-semibold text-slate-700">
          Sin coincidencias
        </p>
        <p className="mt-1 text-[9px] text-slate-500">
          Prueba con otro folio, nombre o referencia.
        </p>
      </div>
    )
  }

  return (
    <div
      id={listboxId}
      role="listbox"
      aria-label="Resultados de búsqueda"
      className="max-h-[min(62vh,480px)] overflow-y-auto py-1.5"
    >
      {results.map((result, index) => {
        const status = formatGlobalSearchStatus(result.status)
        const active = index === activeIndex

        return (
          <button
            key={`${result.type}-${result.resourceId}`}
            id={`${optionIdPrefix}-${index}`}
            type="button"
            role="option"
            aria-selected={active}
            tabIndex={-1}
            onMouseEnter={() => onActiveIndexChange(index)}
            onClick={() => onSelect(result)}
            className={`flex min-h-11 w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition focus:outline-none ${active ? 'bg-blue-50 text-blue-950' : 'hover:bg-blue-50/35'}`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  tone={getGlobalSearchTypeTone(result.type)}
                  className="px-2 py-0.5 text-[8px]"
                >
                  {getGlobalSearchTypeLabel(result.type)}
                </Badge>
                {status ? (
                  <span className="text-[8px] font-medium text-slate-500">
                    {status}
                  </span>
                ) : null}
              </div>

              <p className="mt-1 truncate text-[11px] font-semibold text-slate-950">
                {result.title}
              </p>

              {result.subtitle ? (
                <p className="mt-0.5 truncate text-[9px] text-slate-600">
                  {result.subtitle}
                </p>
              ) : null}

              {result.context ? (
                <p className="mt-0.5 truncate text-[8px] text-slate-500">
                  {result.context}
                </p>
              ) : null}
            </div>

            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 text-slate-400"
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
