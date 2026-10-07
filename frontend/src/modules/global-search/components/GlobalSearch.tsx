import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopbarActionIcon } from '@/shared/components/navigation/TopbarActionIcon'
import { useGlobalSearch } from '../hooks/useGlobalSearch'
import type { GlobalSearchResultDto } from '../types/globalSearch.types'
import { GlobalSearchResults } from './GlobalSearchResults'

const desktopListboxId = 'global-search-desktop-results'
const mobileListboxId = 'global-search-mobile-results'

export function GlobalSearch() {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const desktopInputRef = useRef<HTMLInputElement | null>(null)
  const mobileInputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState('')
  const [desktopOpen, setDesktopOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const search = useGlobalSearch(query)

  const results = search.data?.results ?? []

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDesktopOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'

      if (shortcut) {
        event.preventDefault()

        if (window.matchMedia('(min-width: 768px)').matches) {
          setDesktopOpen(true)
          window.setTimeout(() => desktopInputRef.current?.focus(), 0)
        } else {
          setMobileOpen(true)
          window.setTimeout(() => mobileInputRef.current?.focus(), 0)
        }
      }

      if (event.key === 'Escape') {
        setDesktopOpen(false)
        setMobileOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      window.setTimeout(() => mobileInputRef.current?.focus(), 0)
    }
  }, [mobileOpen])

  useEffect(() => {
    if (results.length === 0) {
      setActiveIndex(-1)
      return
    }

    setActiveIndex((current) =>
      current < 0 || current >= results.length ? 0 : current,
    )
  }, [results.length, query])

  const select = (result: GlobalSearchResultDto) => {
    setQuery('')
    setActiveIndex(-1)
    setDesktopOpen(false)
    setMobileOpen(false)
    navigate(result.href)
  }

  const handleSearchKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>,
  ) => {
    if (results.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => (current + 1 + results.length) % results.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) =>
        (current - 1 + results.length) % results.length,
      )
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(results.length - 1)
      return
    }

    if (
      event.key === 'Enter' &&
      !search.isDebouncing &&
      !search.isFetching
    ) {
      const selectedResult = results[activeIndex] ?? results[0]
      if (selectedResult) {
        event.preventDefault()
        select(selectedResult)
      }
    }
  }

  const desktopActiveDescendant =
    desktopOpen && activeIndex >= 0
      ? `global-search-desktop-option-${activeIndex}`
      : undefined
  const mobileActiveDescendant =
    mobileOpen && activeIndex >= 0
      ? `global-search-mobile-option-${activeIndex}`
      : undefined

  return (
    <>
      <div
        ref={containerRef}
        className="relative hidden w-full max-w-[420px] md:block"
      >
        <div className="relative">
          <TopbarActionIcon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
          />
          <input
            ref={desktopInputRef}
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={desktopOpen}
            aria-controls={desktopListboxId}
            aria-activedescendant={desktopActiveDescendant}
            autoComplete="off"
            value={query}
            onFocus={() => setDesktopOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value)
              setDesktopOpen(true)
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Buscar folio, cliente, material…"
            aria-label="Búsqueda global"
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-14 text-[10px] font-medium text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-500 hover:border-slate-300 hover:bg-slate-50 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[8px] font-semibold tracking-wide text-slate-500">
            Ctrl K
          </span>
        </div>

        {desktopOpen ? (
          <div className="absolute left-0 right-0 top-[40px] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_22px_60px_-24px_rgba(15,23,42,0.34)]">
            <GlobalSearchResults
              query={query}
              results={results}
              pending={search.isFetching || search.isDebouncing}
              error={search.error}
              activeIndex={activeIndex}
              listboxId={desktopListboxId}
              optionIdPrefix="global-search-desktop-option"
              onActiveIndexChange={setActiveIndex}
              onSelect={select}
            />
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir búsqueda global"
      >
        <TopbarActionIcon name="search" className="h-4 w-4" />
      </button>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[70] bg-slate-950/55 p-4 md:hidden">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Búsqueda global"
            className="mx-auto mt-12 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 p-3">
              <div className="relative min-w-0 flex-1">
                <TopbarActionIcon
                  name="search"
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
                />
                <input
                  ref={mobileInputRef}
                  type="search"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={mobileOpen}
                  aria-controls={mobileListboxId}
                  aria-activedescendant={mobileActiveDescendant}
                  autoComplete="off"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Buscar en QualityTrack…"
                  aria-label="Búsqueda global"
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-[11px] text-slate-950 outline-none placeholder:text-slate-500 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="h-11 rounded-lg px-3 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cerrar
              </button>
            </div>

            <GlobalSearchResults
              query={query}
              results={results}
              pending={search.isFetching || search.isDebouncing}
              error={search.error}
              activeIndex={activeIndex}
              listboxId={mobileListboxId}
              optionIdPrefix="global-search-mobile-option"
              onActiveIndexChange={setActiveIndex}
              onSelect={select}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
