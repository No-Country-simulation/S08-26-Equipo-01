import {
  rangeProgress,
  usePinnedSectionProgress,
} from '../hooks/usePinnedSectionProgress'
import type { LandingStoryStage } from '../model/landingStory'
import { CaseIntro } from './CaseIntro'
import { CaseTrace } from './CaseTrace'
import '../caseSection.css'

interface CaseSectionProps {
  stage: LandingStoryStage
  reducedMotion: boolean
}

const caseEvents = [
  {
    title: 'Solicitud recibida',
    detail: 'SOL-2026-014 entra al flujo',
    time: '09:12',
    left: '42%',
    top: '25%',
    labelSide: 'left',
  },
  {
    title: 'Revisión interna',
    detail: 'Contexto técnico validado',
    time: '09:28',
    left: '33%',
    top: '43%',
    labelSide: 'right',
  },
  {
    title: 'Documento vinculado',
    detail: 'Plano_eje_REV-C.pdf',
    time: '09:41',
    left: '76%',
    top: '55%',
    labelSide: 'left',
  },
  {
    title: 'Aclaración solicitada',
    detail: 'Confirmar tolerancia Ø48',
    time: '10:05',
    left: '51%',
    top: '73%',
    labelSide: 'left',
  },
  {
    title: 'Cliente responde',
    detail: 'Tolerancia confirmada ±0.02 mm',
    time: '10:32',
    left: '79%',
    top: '91%',
    labelSide: 'left',
  },
] as const

export function CaseSection({ stage, reducedMotion }: CaseSectionProps) {
  const { sectionRef, scrollProgress, reveal } = usePinnedSectionProgress({
    reducedMotion,
    accelerateReverse: true,
  })

  const entryProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.03, 0.14)
  const eventsProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.16, 0.48)
  const documentProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.49, 0.63)
  const overviewProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.66, 0.84)
  const exitProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.88, 0.97)

  const phase =
    exitProgress > 0
      ? 'Hacia cotización'
      : overviewProgress > 0
        ? 'Vista 360'
        : documentProgress > 0
          ? 'Evidencia conectada'
          : eventsProgress > 0
            ? 'Trazando historia'
            : 'Abriendo expediente'

  const mapOpacity = 1 - overviewProgress * 0.66
  const mapScale = 1 - overviewProgress * 0.055
  const tracePath =
    'M 250 0 C 250 54, 382 48, 500 86 C 575 111, 520 150, 420 165 C 280 188, 250 250, 330 285 C 455 326, 720 250, 755 365 C 785 455, 565 470, 505 500 C 420 545, 660 575, 790 625'
  return (
    <section
      ref={sectionRef}
      id={stage.id}
      className="qt-case-section relative isolate bg-[#020817]"
    >
      <div className="sticky qt-case-pinned overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(37,99,235,0.12),transparent_29%),radial-gradient(circle_at_58%_65%,rgba(34,211,238,0.065),transparent_25%),linear-gradient(180deg,#020817_0%,#050f1d_48%,#020817_100%)]" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(circle_at_67%_52%,black,transparent_67%)]" />

        <CaseTrace exitProgress={exitProgress} />

        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1440px] grid-rows-[auto_1fr] gap-3 px-5 pb-4 pt-4 sm:px-8 sm:pt-5 lg:grid-cols-[0.78fr_1.22fr] lg:grid-rows-1 lg:items-center lg:gap-12 lg:px-12 lg:pb-8 lg:pt-8 xl:px-16">
          <CaseIntro
            stage={stage}
            reducedMotion={reducedMotion}
            scrollProgress={scrollProgress}
            phase={phase}
          />

          <div className="order-2 min-h-0 lg:order-2">
            <div className="relative h-full min-h-[390px] lg:min-h-[620px]">
              <div className="pointer-events-none absolute left-[12%] top-[8%] h-[72%] w-[74%] rounded-full bg-blue-500/[0.07] blur-[100px]" />

              <div
                className="absolute inset-0 hidden lg:block"
                style={{
                  opacity: mapOpacity,
                  transform: `scale(${mapScale})`,
                  transformOrigin: '56% 48%',
                }}
              >
                <svg
                  viewBox="0 0 1000 650"
                  className="absolute inset-0 h-full w-full overflow-visible"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="qtCaseOpenTrace"
                      x1="0.25"
                      y1="0"
                      x2="0.79"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#67e8f9"
                        stopOpacity="0.36"
                      />
                      <stop
                        offset="48%"
                        stopColor="#60a5fa"
                        stopOpacity="0.72"
                      />
                      <stop
                        offset="100%"
                        stopColor="#22d3ee"
                        stopOpacity="0.36"
                      />
                    </linearGradient>
                    <filter
                      id="qtCaseOpenGlow"
                      x="-70%"
                      y="-70%"
                      width="240%"
                      height="240%"
                    >
                      <feGaussianBlur stdDeviation="7" />
                    </filter>
                  </defs>

                  <path
                    d={tracePath}
                    fill="none"
                    stroke="url(#qtCaseOpenTrace)"
                    strokeWidth="13"
                    opacity={0.04 + eventsProgress * 0.1}
                    filter="url(#qtCaseOpenGlow)"
                  />
                  <path
                    d={tracePath}
                    fill="none"
                    stroke="url(#qtCaseOpenTrace)"
                    strokeWidth="1.65"
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset={
                      1 - Math.max(entryProgress * 0.16, eventsProgress)
                    }
                  />
                </svg>

                <div
                  className="absolute left-[50%] top-[13.2%] z-[6] -translate-x-1/2 -translate-y-1/2 text-center"
                  style={{
                    opacity: entryProgress,
                    transform: `translate(-50%, -50%) scale(${0.88 + entryProgress * 0.12})`,
                  }}
                >
                  <div className="relative mx-auto grid h-[74px] w-[74px] place-items-center rounded-full border border-blue-300/20 bg-[#06111d]/90 shadow-[0_0_60px_rgba(37,99,235,0.16)] backdrop-blur-xl">
                    <div className="absolute inset-[8px] rounded-full border border-dashed border-cyan-300/15" />
                    <span className="font-mono text-[11px] font-bold text-white">
                      EXP
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-[9px] font-semibold tracking-[0.08em] text-blue-100">
                    EXP-2026-014
                  </p>
                  <p className="mt-0.5 font-mono text-[7px] text-slate-600">
                    desde SOL-2026-014
                  </p>
                </div>

                {caseEvents.map((event, index) => {
                  const start = 0.16 + index * 0.057
                  const end = start + 0.055
                  const eventProgress = reducedMotion
                    ? 1
                    : rangeProgress(scrollProgress, start, end)
                  const labelOnLeft = event.labelSide === 'left'

                  return (
                    <div
                      key={event.title}
                      className="absolute z-[7] h-0 w-0"
                      style={{
                        left: event.left,
                        top: event.top,
                        opacity: eventProgress,
                      }}
                    >
                      <span
                        className="absolute left-[-5px] top-[-5px] h-[10px] w-[10px] rounded-full border border-blue-200/50 bg-[#07111f] shadow-[0_0_14px_rgba(96,165,250,0.72)]"
                        style={{
                          transform: `scale(${0.72 + eventProgress * 0.28})`,
                        }}
                      >
                        <span className="absolute inset-[2px] rounded-full bg-blue-300" />
                      </span>

                      <div
                        className={`absolute top-[-18px] w-[176px] ${labelOnLeft ? 'right-[16px] text-right' : 'left-[16px] text-left'}`}
                        style={{
                          transform: `translate3d(${(1 - eventProgress) * (labelOnLeft ? 10 : -10)}px,0,0)`,
                        }}
                      >
                        <div
                          className={`mb-1 flex items-center gap-2 ${labelOnLeft ? 'justify-end' : ''}`}
                        >
                          <span className="font-mono text-[6px] text-slate-700">
                            {event.time}
                          </span>
                          <span className="text-[8px] font-bold text-slate-200">
                            {event.title}
                          </span>
                        </div>
                        <p className="text-[7px] leading-3 text-slate-500">
                          {event.detail}
                        </p>
                      </div>
                    </div>
                  )
                })}

                <div
                  className="qt-case-sheet absolute right-[4%] top-[45%] z-[8] w-[190px] rounded-[14px] border border-cyan-300/12 bg-[#06111d]/92 p-3 shadow-[0_24px_70px_-34px_rgba(34,211,238,0.75)] backdrop-blur-xl"
                  style={{
                    opacity: documentProgress,
                    transform: `rotate(${3 - documentProgress * 6}deg) translate3d(${(1 - documentProgress) * 24}px, ${(1 - documentProgress) * 12}px, 0)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] font-bold uppercase tracking-[0.12em] text-cyan-200/70">
                      Documento
                    </span>
                    <span className="font-mono text-[6px] text-cyan-300/55">
                      REV C
                    </span>
                  </div>
                  <div className="relative mt-2 h-[88px] overflow-hidden rounded-lg border border-white/[0.055] bg-[#071827]">
                    <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.08)_1px,transparent_1px)] [background-size:11px_11px]" />
                    <div className="absolute left-6 top-8 h-7 w-24 rounded-[50%] border border-cyan-200/45" />
                    <div className="absolute left-[72px] top-4 h-14 w-px bg-cyan-300/16" />
                    <div className="absolute left-4 top-[43px] h-px w-[130px] bg-cyan-300/16" />
                  </div>
                  <p className="mt-2 truncate text-[8px] font-semibold text-slate-200">
                    Plano_eje_REV-C.pdf
                  </p>
                  <p className="mt-0.5 text-[6px] text-slate-600">
                    Vinculado al evento 09:41
                  </p>
                </div>
              </div>

              <div
                className="absolute inset-0 hidden lg:block"
                style={{ opacity: overviewProgress }}
              >
                <div
                  className="qt-case-overview absolute left-[57%] top-[51%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    transform: `translate(-50%, -50%) scale(${0.82 + overviewProgress * 0.18})`,
                  }}
                >
                  <div className="absolute inset-[18px] rounded-full border border-blue-300/12" />
                  <div className="absolute inset-[52px] rounded-full border border-dashed border-cyan-300/12" />
                  <div className="absolute inset-[92px] grid place-items-center rounded-full border border-blue-300/18 bg-[#06111d]/88 text-center shadow-[0_0_70px_rgba(37,99,235,0.13)] backdrop-blur-xl">
                    <div>
                      <p className="text-[7px] font-bold uppercase tracking-[0.15em] text-blue-200/70">
                        Historia 360
                      </p>
                      <p className="mt-2 font-mono text-[13px] font-semibold text-white">
                        EXP-2026-014
                      </p>
                      <p className="mt-1 text-[7px] text-slate-500">
                        caso conectado
                      </p>
                    </div>
                  </div>

                  <div className="absolute left-1/2 top-[13px] -translate-x-1/2 text-center">
                    <p className="font-mono text-[13px] font-semibold text-blue-100">
                      5
                    </p>
                    <p className="text-[6px] uppercase tracking-[0.11em] text-slate-600">
                      eventos
                    </p>
                  </div>
                  <div className="absolute right-[4px] top-1/2 -translate-y-1/2 text-center">
                    <p className="font-mono text-[13px] font-semibold text-cyan-100">
                      3
                    </p>
                    <p className="text-[6px] uppercase tracking-[0.11em] text-slate-600">
                      documentos
                    </p>
                  </div>
                  <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 text-center">
                    <p className="text-[8px] font-semibold text-emerald-300">
                      ACTIVA
                    </p>
                    <p className="text-[6px] uppercase tracking-[0.11em] text-slate-600">
                      trazabilidad
                    </p>
                  </div>
                  <div className="absolute left-[0px] top-1/2 -translate-y-1/2 text-center">
                    <p className="font-mono text-[8px] font-semibold text-slate-300">
                      SOL-014
                    </p>
                    <p className="text-[6px] uppercase tracking-[0.11em] text-slate-600">
                      origen
                    </p>
                  </div>
                </div>

                <div
                  className="absolute bottom-[7%] right-[4%] flex items-center gap-3"
                  style={reveal(0.82, 0.9, 8)}
                >
                  <div className="text-right">
                    <p className="text-[6px] font-bold uppercase tracking-[0.12em] text-amber-200/65">
                      Siguiente movimiento
                    </p>
                    <p className="mt-0.5 text-[9px] font-semibold text-slate-200">
                      Preparar cotización
                    </p>
                  </div>
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-amber-300/18 bg-amber-400/[0.055] text-amber-200/75">
                    →
                  </span>
                </div>
              </div>

              <div className="relative mx-auto mt-2 h-[360px] w-full max-w-[520px] lg:hidden">
                <div className="absolute left-[24px] top-0 bottom-6 w-px bg-white/[0.055]" />
                <div
                  className="absolute left-[24px] top-0 bottom-6 w-px origin-top bg-gradient-to-b from-cyan-300/70 via-blue-400/70 to-blue-300/20"
                  style={{
                    transform: `scaleY(${Math.max(entryProgress * 0.18, eventsProgress)})`,
                  }}
                />

                <div
                  className="relative ml-6 pt-1"
                  style={{ opacity: mapOpacity }}
                >
                  <div className="mb-3 ml-3" style={{ opacity: entryProgress }}>
                    <p className="font-mono text-[10px] font-semibold text-white">
                      EXP-2026-014
                    </p>
                    <p className="mt-0.5 font-mono text-[6px] text-slate-600">
                      desde SOL-2026-014
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {caseEvents.map((event, index) => {
                      const start = 0.16 + index * 0.057
                      const end = start + 0.055
                      const eventProgress = reducedMotion
                        ? 1
                        : rangeProgress(scrollProgress, start, end)

                      return (
                        <div
                          key={event.title}
                          className="relative pl-5"
                          style={{
                            opacity: eventProgress,
                            transform: `translateY(${(1 - eventProgress) * 7}px)`,
                          }}
                        >
                          <span className="absolute left-[-4px] top-[6px] h-[9px] w-[9px] rounded-full border border-blue-200/40 bg-[#07111f] shadow-[0_0_10px_rgba(96,165,250,0.55)]" />
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="text-[8px] font-bold text-slate-200">
                              {event.title}
                            </p>
                            <span className="font-mono text-[6px] text-slate-700">
                              {event.time}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[7px] text-slate-500">
                            {event.detail}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  <div
                    className="ml-5 mt-3 flex items-center gap-3 border-l border-cyan-300/15 pl-3"
                    style={{ opacity: documentProgress }}
                  >
                    <div className="grid h-9 w-11 shrink-0 place-items-center rounded-lg border border-cyan-300/10 bg-cyan-300/[0.035] font-mono text-[6px] text-cyan-200">
                      REV C
                    </div>
                    <div>
                      <p className="text-[8px] font-semibold text-slate-200">
                        Plano_eje_REV-C.pdf
                      </p>
                      <p className="mt-0.5 text-[6px] text-slate-600">
                        evidencia vinculada
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute inset-0 grid place-items-center"
                  style={{
                    opacity: overviewProgress,
                    transform: `scale(${0.9 + overviewProgress * 0.1})`,
                  }}
                >
                  <div className="relative grid h-[210px] w-[210px] place-items-center rounded-full border border-blue-300/12">
                    <div className="absolute inset-[24px] rounded-full border border-dashed border-cyan-300/12" />
                    <div className="text-center">
                      <p className="text-[6px] font-bold uppercase tracking-[0.14em] text-blue-200/70">
                        Historia 360
                      </p>
                      <p className="mt-2 font-mono text-[11px] font-semibold text-white">
                        EXP-2026-014
                      </p>
                      <p className="mt-2 text-[7px] text-slate-500">
                        5 eventos · 3 documentos
                      </p>
                      <p className="mt-1 text-[7px] font-semibold text-emerald-300">
                        Trazabilidad activa
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="pointer-events-none absolute bottom-0 left-1/2 h-10 w-px origin-top bg-gradient-to-b from-blue-300/50 to-transparent lg:hidden"
                style={{
                  opacity: exitProgress,
                  transform: `scaleY(${exitProgress})`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
