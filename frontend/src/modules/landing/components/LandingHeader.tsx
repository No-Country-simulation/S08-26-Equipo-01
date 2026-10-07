import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../landingNavigation.css'

const landingSections = [
  ['Solicitud', 'solicitud'],
  ['Expediente', 'expediente'],
  ['Cotización', 'cotizacion'],
  ['OT', 'orden-trabajo'],
  ['Producción', 'produccion'],
  ['Calidad', 'calidad'],
  ['Entrega', 'entrega'],
] as const

export function LandingHeader() {
  const [activeSection, setActiveSection] = useState('inicio')
  const [sectionsOpen, setSectionsOpen] = useState(false)

  const sectionIds = useMemo(
    () => ['inicio', ...landingSections.map(([, id]) => id)],
    [],
  )

  useEffect(() => {
    let frame = 0

    const syncActiveSection = () => {
      frame = 0
      const probe = 132
      let current = 'inicio'

      sectionIds.forEach((id) => {
        const section = document.getElementById(id)
        if (!section) return

        const rect = section.getBoundingClientRect()
        if (rect.top <= probe && rect.bottom > probe) current = id
      })

      setActiveSection((previous) =>
        previous === current ? previous : current,
      )
    }

    const requestSync = () => {
      if (frame) return
      frame = window.requestAnimationFrame(syncActiveSection)
    }

    syncActiveSection()
    window.addEventListener('scroll', requestSync, { passive: true })
    window.addEventListener('resize', requestSync)

    return () => {
      window.removeEventListener('scroll', requestSync)
      window.removeEventListener('resize', requestSync)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [sectionIds])

  useEffect(() => {
    if (!sectionsOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSectionsOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [sectionsOpen])

  const jumpTo = (id: string) => {
    setSectionsOpen(false)
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'start',
      })
    })
  }

  return (
    <>
      <header className="qt-landing-header fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="qt-landing-header-shell mx-auto flex h-14 max-w-7xl items-center gap-4 rounded-2xl border border-white/[0.08] bg-slate-950/68 px-3.5 shadow-[0_18px_60px_-30px_rgba(2,6,23,0.95)] backdrop-blur-xl sm:px-4">
          <a
            href="#inicio"
            className="flex shrink-0 items-center gap-2.5 rounded-xl px-1 py-1"
            aria-label="Ir al inicio"
          >
            <img
              src="/brand/qualitytrack-mark-inverse.svg"
              alt=""
              className="h-8 w-8"
            />
            <div className="leading-none">
              <p className="text-[14px] font-semibold tracking-[-0.02em] text-white">
                Quality<span className="text-blue-400">Track</span>
              </p>
              <p className="mt-1 hidden text-[8px] font-medium uppercase tracking-[0.16em] text-slate-500 xl:block">
                Industrial workflow
              </p>
            </div>
          </a>

          <nav
            className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex"
            aria-label="Secciones de QualityTrack"
          >
            {landingSections.map(([label, id]) => {
              const active = activeSection === id

              return (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`qt-landing-nav-link relative rounded-lg px-2 py-2 text-[8px] font-bold uppercase tracking-[0.08em] transition xl:px-2.5 ${active ? 'text-cyan-100' : 'text-slate-500 hover:text-slate-200'}`}
                  aria-current={active ? 'location' : undefined}
                >
                  {label}
                  <span
                    className={`absolute inset-x-2 -bottom-[1px] h-px origin-center bg-gradient-to-r from-transparent via-cyan-300 to-transparent transition ${active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`}
                    aria-hidden="true"
                  />
                </a>
              )
            })}
          </nav>

          <Link
            to="/login"
            className="qt-landing-login ml-auto hidden h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-cyan-200/15 bg-white/[0.025] px-3 text-[8px] font-bold uppercase tracking-[0.09em] text-slate-200 shadow-[0_8px_28px_-18px_rgba(34,211,238,0.4)] transition hover:border-cyan-200/30 hover:bg-cyan-300/[0.06] hover:text-white sm:inline-flex"
          >
            Iniciar sesión
            <span className="text-cyan-300/65" aria-hidden="true">
              →
            </span>
          </Link>

          <div className="qt-landing-progress absolute bottom-0 left-1/2 hidden h-px w-[min(78vw,980px)] -translate-x-1/2 overflow-hidden lg:block">
            <span
              className="block h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300 transition-[width] duration-300"
              style={{
                width: `${Math.max(
                  4,
                  ((Math.max(0, sectionIds.indexOf(activeSection)) + 1) /
                    sectionIds.length) *
                    100,
                )}%`,
              }}
            />
          </div>
        </div>
      </header>

      <div className="qt-mobile-nav lg:hidden">
        {sectionsOpen ? (
          <>
            <button
              type="button"
              className="qt-mobile-nav-backdrop"
              aria-label="Cerrar secciones"
              onClick={() => setSectionsOpen(false)}
            />
            <div
              id="landing-section-dialog"
              className="qt-mobile-nav-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Secciones de QualityTrack"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[7px] font-bold uppercase tracking-[0.16em] text-cyan-200/70">
                    Recorrido
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-white">
                    Ir a una etapa
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSectionsOpen(false)}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/[0.08] bg-white/[0.025] text-sm text-slate-400"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {landingSections.map(([label, id], index) => {
                  const active = activeSection === id

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => jumpTo(id)}
                      className={`flex min-h-11 items-center justify-between rounded-xl border px-3 py-3 text-left transition ${active ? 'border-cyan-300/25 bg-cyan-300/[0.07]' : 'border-white/[0.06] bg-white/[0.02]'}`}
                    >
                      <span>
                        <span className="font-mono text-[6px] text-slate-600">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={`mt-1 block text-[9px] font-semibold ${active ? 'text-cyan-100' : 'text-slate-300'}`}
                        >
                          {label}
                        </span>
                      </span>
                      <span
                        className={active ? 'text-cyan-300' : 'text-slate-700'}
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        ) : null}

        <div className="qt-mobile-nav-dock">
          <button
            type="button"
            onClick={() => jumpTo('inicio')}
            className={`qt-mobile-nav-action ${activeSection === 'inicio' ? 'is-active' : ''}`}
          >
            <span className="text-[13px]" aria-hidden="true">
              ↑
            </span>
            <span>Inicio</span>
          </button>

          <button
            type="button"
            onClick={() => setSectionsOpen(true)}
            className={`qt-mobile-nav-action ${activeSection !== 'inicio' ? 'is-active' : ''}`}
            aria-expanded={sectionsOpen}
            aria-controls="landing-section-dialog"
          >
            <span className="qt-mobile-nav-grid" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span>Secciones</span>
          </button>

          <Link to="/login" className="qt-mobile-nav-action">
            <span className="text-[13px] text-cyan-300" aria-hidden="true">
              →
            </span>
            <span>Iniciar sesión</span>
          </Link>
        </div>
      </div>
    </>
  )
}
