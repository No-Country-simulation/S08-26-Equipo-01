import { useEffect, useRef, useState } from 'react'
import { landingStory } from '../model/landingStory'
import { QualityTrackScene } from '../scene/QualityTrackScene'
import { RequestSection } from './RequestSection'
import { StoryStage } from './StoryStage'

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)

    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return reducedMotion
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function ScrollStory() {
  const introProgressRef = useRef(0.02)
  const introScrollingRef = useRef(false)
  const introSectionRef = useRef<HTMLElement | null>(null)
  const [introExitProgress, setIntroExitProgress] = useState(0)
  const reducedMotion = useReducedMotion()
  const intro = landingStory[0]
  const request = landingStory[1]

  useEffect(() => {
    let frame = 0

    const sync = () => {
      frame = 0
      const section = introSectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1)
      const raw = clamp(-rect.top / travel)
      const exit = clamp((raw - 0.12) / 0.88)

      setIntroExitProgress((previous) =>
        Math.abs(previous - exit) > 0.006 ? exit : previous,
      )
      introProgressRef.current = 0.02 + exit * 0.035
      introScrollingRef.current = raw > 0.02 && raw < 0.98
    }

    const requestSync = () => {
      if (frame) return
      frame = window.requestAnimationFrame(sync)
    }

    sync()
    window.addEventListener('scroll', requestSync, { passive: true })
    window.addEventListener('resize', requestSync)
    return () => {
      window.removeEventListener('scroll', requestSync)
      window.removeEventListener('resize', requestSync)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    if (reducedMotion) return

    const accelerateReverse = (event: WheelEvent) => {
      if (
        event.deltaY >= 0 ||
        event.ctrlKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ) {
        return
      }

      const section = document.getElementById('solicitud')
      if (!section) return

      const rect = section.getBoundingClientRect()
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1)
      const progress = clamp(-rect.top / travel)

      // Keep the entry/exit breathing room native. Only accelerate while the
      // request story itself is actively being scrubbed in reverse.
      if (
        progress <= 0.015 ||
        progress >= 0.995 ||
        rect.top > 0 ||
        rect.bottom <= window.innerHeight
      ) {
        return
      }

      event.preventDefault()

      const deltaPixels =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? event.deltaY * 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? event.deltaY * window.innerHeight
            : event.deltaY

      window.scrollBy({ top: deltaPixels * 2, behavior: 'auto' })
    }

    window.addEventListener('wheel', accelerateReverse, { passive: false })
    return () => window.removeEventListener('wheel', accelerateReverse)
  }, [reducedMotion])

  if (!intro || !request) return null

  const sceneOpacity = reducedMotion ? 1 : 1 - introExitProgress * 0.92
  const copyOpacity = reducedMotion ? 1 : 1 - introExitProgress * 0.62
  const traceOpacity = reducedMotion ? 1 : 0.72 + introExitProgress * 0.28
  const bridgeOpacity = reducedMotion ? 1 : 0.12 + introExitProgress * 0.88
  const heroTracePath = 'M 22 252 C 178 252, 205 94, 392 110 S 565 182, 698 118'
  const heroTravelPath =
    'M 698 118 C 565 182, 499 94, 392 110 S 178 252, 22 252'
  const heroContinuationPath =
    'M 22 252 C -40 252, -54 300, 8 330 C 72 361, 70 405, 17 434 C -29 459, -18 507, 29 536 C 55 553, 39 579, 22 590'

  return (
    <>
      <section
        ref={introSectionRef}
        id={intro.id}
        className="relative h-[108svh] bg-[#020617] sm:h-[110svh]"
      >
        <div className="sticky top-0 isolate min-h-screen overflow-hidden bg-[#020617]">
          <div className="absolute inset-0 qt-story-backdrop" />

          <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
            <div className="absolute left-[28%] top-[20%] hidden h-[58%] w-[44%] rounded-full bg-blue-500/[0.08] blur-[95px] lg:block" />
            <div className="absolute left-[38%] top-[34%] hidden h-[34%] w-[28%] rounded-full bg-cyan-400/[0.06] blur-[75px] lg:block" />

            <div
              className="absolute -right-[26%] top-[10%] h-[48vh] w-[120%] opacity-85 sm:-right-[14%] sm:w-[96%] lg:inset-y-0 lg:right-[-11%] lg:top-0 lg:h-auto lg:w-[78%] lg:opacity-100"
              style={{
                opacity: sceneOpacity,
                transform: reducedMotion
                  ? undefined
                  : `translate3d(${introExitProgress * 5}%, ${-introExitProgress * 2.5}%, 0) scale(${1 - introExitProgress * 0.035})`,
                filter: reducedMotion
                  ? undefined
                  : `blur(${introExitProgress * 1.4}px) saturate(${1 - introExitProgress * 0.25}) brightness(${1 - introExitProgress * 0.22})`,
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_43%_49%,rgba(56,189,248,0.19),transparent_30%),radial-gradient(circle_at_66%_50%,rgba(37,99,235,0.17),transparent_48%)]" />
              <QualityTrackScene
                progressRef={introProgressRef}
                scrollingRef={introScrollingRef}
                reducedMotion={reducedMotion}
              />
            </div>

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.04)_0%,rgba(2,6,23,0.18)_48%,#020617_76%)] lg:bg-[linear-gradient(90deg,#020617_0%,rgba(2,6,23,0.97)_24%,rgba(2,6,23,0.8)_36%,rgba(2,6,23,0.42)_47%,rgba(2,6,23,0.1)_60%,rgba(2,6,23,0)_78%)]" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#020617] via-[#020617]/75 to-transparent" />
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-[4] hidden lg:block"
            aria-hidden="true"
            style={{ opacity: traceOpacity }}
          >
            <svg
              viewBox="0 0 720 340"
              className="absolute left-[33%] top-[34%] h-[38%] w-[42%] overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="qtHeroTrace" x1="0" y1="0" x2="1" y2="0">
                  <stop
                    offset="0%"
                    stopColor="#60a5fa"
                    stopOpacity={0.05 + introExitProgress * 0.32}
                  />
                  <stop offset="28%" stopColor="#60a5fa" stopOpacity="0.28" />
                  <stop offset="68%" stopColor="#22d3ee" stopOpacity="0.74" />
                  <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient
                  id="qtHeroContinuation"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.42" />
                  <stop offset="36%" stopColor="#22d3ee" stopOpacity="0.72" />
                  <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.2" />
                </linearGradient>
                <filter
                  id="qtHeroTraceGlow"
                  x="-40%"
                  y="-40%"
                  width="180%"
                  height="180%"
                >
                  <feGaussianBlur stdDeviation="7" />
                </filter>
                <filter
                  id="qtHeroTravelerGlow"
                  x="-200%"
                  y="-200%"
                  width="500%"
                  height="500%"
                >
                  <feGaussianBlur stdDeviation="5" />
                </filter>
              </defs>

              <path
                d={heroTracePath}
                fill="none"
                stroke="url(#qtHeroTrace)"
                strokeWidth="12"
                opacity="0.16"
                filter="url(#qtHeroTraceGlow)"
              />
              <path
                d={heroTracePath}
                fill="none"
                stroke="url(#qtHeroTrace)"
                strokeWidth="1.5"
                strokeDasharray="8 10"
              >
                {!reducedMotion ? (
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="180"
                    dur="7s"
                    repeatCount="indefinite"
                  />
                ) : null}
              </path>

              <g opacity={bridgeOpacity}>
                <path
                  d={heroContinuationPath}
                  fill="none"
                  stroke="url(#qtHeroContinuation)"
                  strokeWidth="12"
                  opacity="0.14"
                  filter="url(#qtHeroTraceGlow)"
                />
                <path
                  d={heroContinuationPath}
                  fill="none"
                  stroke="url(#qtHeroContinuation)"
                  strokeWidth="1.5"
                  strokeDasharray="8 10"
                >
                  {!reducedMotion ? (
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="180"
                      dur="7s"
                      repeatCount="indefinite"
                    />
                  ) : null}
                </path>
              </g>

              {!reducedMotion ? (
                <>
                  <circle
                    r="10"
                    fill="#67e8f9"
                    opacity="0.16"
                    filter="url(#qtHeroTravelerGlow)"
                  >
                    <animateMotion
                      dur="5.2s"
                      repeatCount="indefinite"
                      path={heroTravelPath}
                    />
                  </circle>
                  <circle r="3.5" fill="#a5f3fc" opacity="0.95">
                    <animateMotion
                      dur="5.2s"
                      repeatCount="indefinite"
                      path={heroTravelPath}
                    />
                  </circle>

                  {introExitProgress > 0.04 ? (
                    <>
                      <circle
                        r="10"
                        fill="#67e8f9"
                        opacity={0.15 * bridgeOpacity}
                        filter="url(#qtHeroTravelerGlow)"
                      >
                        <animateMotion
                          dur="5.2s"
                          repeatCount="indefinite"
                          path={heroContinuationPath}
                        />
                      </circle>
                      <circle
                        r="3.5"
                        fill="#a5f3fc"
                        opacity={0.95 * bridgeOpacity}
                      >
                        <animateMotion
                          dur="5.2s"
                          repeatCount="indefinite"
                          path={heroContinuationPath}
                        />
                      </circle>
                    </>
                  ) : null}
                </>
              ) : null}

              <circle
                cx="22"
                cy="252"
                r="2.8"
                fill="#67e8f9"
                opacity={bridgeOpacity}
              />
              <circle
                cx="395"
                cy="110"
                r="4"
                fill="#67e8f9"
                className="animate-pulse"
              />
              <circle
                cx="698"
                cy="118"
                r="3"
                fill="#93c5fd"
                className="animate-pulse"
              />
            </svg>
          </div>

          <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] items-end px-5 pb-12 pt-[46vh] sm:px-8 sm:pb-16 lg:items-center lg:px-12 lg:pb-12 lg:pt-24 xl:px-16">
            <div
              className="relative w-full lg:max-w-[52%] xl:max-w-[49%]"
              style={{
                opacity: copyOpacity,
                transform: reducedMotion
                  ? undefined
                  : `translate3d(${-introExitProgress * 10}px, ${-introExitProgress * 5}px, 0)`,
              }}
            >
              <div className="pointer-events-none absolute -right-20 top-[30%] hidden h-48 w-48 rounded-full bg-blue-400/[0.08] blur-[70px] lg:block" />
              <StoryStage stage={intro} active />
            </div>
          </div>

          <div
            className="pointer-events-none absolute left-[54%] top-[70%] z-[12] hidden w-[252px] lg:block xl:left-[56%] xl:top-[69%]"
            style={{ opacity: sceneOpacity }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-cyan-300/15 bg-slate-950/55 px-4 py-3.5 shadow-[0_24px_80px_-32px_rgba(14,165,233,0.8)] backdrop-blur-xl">
              <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-cyan-300/70 to-transparent" />
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-40" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-cyan-100/85">
                    Trazabilidad en vivo
                  </span>
                </div>
                <span className="font-mono text-[8px] text-slate-500">
                  QT-014
                </span>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[8px] font-semibold text-slate-400">
                <span className="text-blue-200">Solicitud</span>
                <span className="text-slate-600">→</span>
                <span>Expediente</span>
                <span className="text-slate-600">→</span>
                <span>OT</span>
                <span className="text-slate-600">→</span>
                <span className="text-cyan-200">Pieza</span>
              </div>

              <div className="mt-3 h-px overflow-hidden bg-white/[0.06]">
                <div className="h-full w-[76%] bg-gradient-to-r from-blue-500/30 via-cyan-300/80 to-cyan-100/20 shadow-[0_0_14px_rgba(34,211,238,0.55)]" />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[8px]">
                <span className="font-mono text-slate-500">
                  AISI 4140 · SHAFT-014
                </span>
                <span className="font-bold uppercase tracking-[0.1em] text-emerald-300/90">
                  Conectado
                </span>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-6 right-7 z-[5] hidden items-center gap-2 rounded-full border border-white/8 bg-slate-950/35 px-3 py-1.5 backdrop-blur-md sm:flex lg:right-10">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.75)]" />
            <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Operación industrial conectada
            </span>
          </div>
        </div>
      </section>

      <RequestSection stage={request} reducedMotion={reducedMotion} />
    </>
  )
}
