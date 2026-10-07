import {
  rangeProgress,
  usePinnedSectionProgress,
} from '../hooks/usePinnedSectionProgress'
import type { LandingStoryStage } from '../model/landingStory'
import { WorkOrderIntro } from './WorkOrderIntro'
import { WorkOrderTrace } from './WorkOrderTrace'
import '../workOrderSection.css'

interface WorkOrderSectionProps {
  stage: LandingStoryStage
  reducedMotion: boolean
}

const operations = [
  ['01', 'Corte'],
  ['02', 'Torneado CNC'],
  ['03', 'Rectificado'],
  ['04', 'Inspección'],
] as const

export function WorkOrderSection({
  stage,
  reducedMotion,
}: WorkOrderSectionProps) {
  const { sectionRef, scrollProgress, reveal } = usePinnedSectionProgress({
    reducedMotion,
    accelerateReverse: true,
  })

  const entryProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.025, 0.13)
  const transformProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.12, 0.3)
  const moduleProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.3, 0.5)
  const routeProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.49, 0.72)
  const releaseProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.73, 0.88)
  const exitProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.88, 0.98)

  const phase =
    exitProgress > 0
      ? 'Hacia producción'
      : releaseProgress > 0
        ? 'Ruta liberada'
        : routeProgress > 0
          ? 'Definiendo operaciones'
          : moduleProgress > 0
            ? 'Vinculando recursos'
            : transformProgress > 0
              ? 'Creando OT'
              : 'Recibiendo aprobación'

  const coreScale = 0.84 + transformProgress * 0.16
  const coreGlow = 0.08 + releaseProgress * 0.18
  const tokenOpacity = entryProgress * (1 - transformProgress)
  const routeGlow = 0.12 + releaseProgress * 0.88

  return (
    <section
      ref={sectionRef}
      id={stage.id}
      className="qt-work-order-section relative isolate bg-[#040712]"
    >
      <div className="sticky qt-work-order-pinned overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_67%_44%,rgba(124,58,237,0.13),transparent_29%),radial-gradient(circle_at_73%_68%,rgba(59,130,246,0.06),transparent_26%),linear-gradient(180deg,#030712_0%,#070b18_48%,#030712_100%)]" />
        <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(148,163,184,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] [background-size:74px_74px] [mask-image:radial-gradient(circle_at_68%_51%,black,transparent_68%)]" />

        <WorkOrderTrace
          entryProgress={entryProgress}
          exitProgress={exitProgress}
        />

        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1440px] grid-rows-[auto_1fr] gap-3 px-5 pb-4 pt-4 sm:px-8 sm:pt-5 lg:grid-cols-[0.78fr_1.22fr] lg:grid-rows-1 lg:items-center lg:gap-10 lg:px-12 lg:pb-8 lg:pt-8 xl:px-16">
          <WorkOrderIntro
            stage={stage}
            reducedMotion={reducedMotion}
            scrollProgress={scrollProgress}
            phase={phase}
          />

          <div className="order-2 min-h-0">
            <div className="relative h-full min-h-[400px] lg:min-h-[620px]">
              <div className="pointer-events-none absolute left-[18%] top-[12%] h-[70%] w-[68%] rounded-full bg-violet-500/[0.075] blur-[100px]" />

              <div className="absolute inset-0 hidden lg:block">
                <div
                  className="absolute left-[18%] top-[5%] rounded-full border border-violet-300/12 bg-violet-300/[0.035] px-3 py-1.5 font-mono text-[7px] text-violet-100/70"
                  style={{
                    opacity: tokenOpacity,
                    transform: `translate3d(${transformProgress * 165}px, ${transformProgress * 95}px, 0)`,
                  }}
                >
                  120 PIEZAS
                </div>
                <div
                  className="absolute left-[48%] top-[3%] rounded-full border border-violet-300/12 bg-violet-300/[0.035] px-3 py-1.5 font-mono text-[7px] text-violet-100/70"
                  style={{
                    opacity: tokenOpacity,
                    transform: `translate3d(${transformProgress * 22}px, ${transformProgress * 112}px, 0)`,
                  }}
                >
                  AISI 4140
                </div>
                <div
                  className="absolute right-[6%] top-[10%] rounded-full border border-violet-300/12 bg-violet-300/[0.035] px-3 py-1.5 font-mono text-[7px] text-violet-100/70"
                  style={{
                    opacity: tokenOpacity,
                    transform: `translate3d(${-transformProgress * 152}px, ${transformProgress * 82}px, 0)`,
                  }}
                >
                  08 OCT 2026
                </div>

                <div
                  className="qt-work-order-core absolute left-[53%] top-[31%] z-[8] grid h-[142px] w-[142px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-violet-200/20 bg-[#0a0d1a]/90 text-center backdrop-blur-xl"
                  style={{
                    opacity: transformProgress,
                    transform: `translate(-50%, -50%) scale(${coreScale})`,
                    boxShadow: `0 0 80px rgba(139,92,246,${coreGlow})`,
                  }}
                >
                  <div>
                    <p className="text-[6px] font-bold uppercase tracking-[0.15em] text-violet-300/70">
                      Orden de trabajo
                    </p>
                    <p className="mt-2 font-mono text-[12px] font-semibold text-white">
                      OT-2026-014
                    </p>
                    <p className="mt-1 text-[7px] text-slate-500">
                      desde COT-2026-014 · V2
                    </p>
                  </div>
                </div>

                <svg
                  viewBox="0 0 1000 650"
                  className="absolute inset-0 h-full w-full"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="qtWorkLinks"
                      x1="0.5"
                      y1="0.25"
                      x2="0.5"
                      y2="0.8"
                    >
                      <stop
                        offset="0%"
                        stopColor="#c4b5fd"
                        stopOpacity="0.48"
                      />
                      <stop
                        offset="100%"
                        stopColor="#60a5fa"
                        stopOpacity="0.28"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 530 205 C 415 230, 312 220, 225 268"
                    fill="none"
                    stroke="url(#qtWorkLinks)"
                    strokeWidth="1.4"
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset={1 - moduleProgress}
                  />
                  <path
                    d="M 540 205 C 655 220, 715 245, 785 285"
                    fill="none"
                    stroke="url(#qtWorkLinks)"
                    strokeWidth="1.4"
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset={1 - moduleProgress}
                  />
                  <path
                    d="M 545 196 C 655 155, 732 138, 805 145"
                    fill="none"
                    stroke="url(#qtWorkLinks)"
                    strokeWidth="1.2"
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset={1 - moduleProgress}
                    opacity="0.7"
                  />
                  <path
                    d="M 530 232 C 520 320, 518 370, 518 438"
                    fill="none"
                    stroke="url(#qtWorkLinks)"
                    strokeWidth="1.5"
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset={1 - routeProgress}
                  />
                </svg>

                <div
                  className="qt-work-order-module absolute left-[5%] top-[35%] w-[205px] rounded-2xl border border-violet-300/12 bg-[#080d19]/88 p-3.5 backdrop-blur-xl"
                  style={reveal(0.31, 0.41, 10)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[6px] font-bold uppercase tracking-[0.13em] text-slate-600">
                      Material
                    </span>
                    <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_12px_rgba(196,181,253,0.55)]" />
                  </div>
                  <p className="mt-2 text-[9px] font-semibold text-slate-200">
                    Acero AISI 4140
                  </p>
                  <p className="mt-1 font-mono text-[7px] text-violet-200/70">
                    LOT-4140-202
                  </p>
                  <p className="mt-2 text-[6px] text-slate-600">
                    120 piezas · lote vinculado
                  </p>
                </div>

                <div
                  className="qt-work-order-module absolute right-[2%] top-[39%] w-[202px] rounded-2xl border border-violet-300/12 bg-[#080d19]/88 p-3.5 backdrop-blur-xl"
                  style={reveal(0.36, 0.46, 10)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[6px] font-bold uppercase tracking-[0.13em] text-slate-600">
                      Máquina
                    </span>
                    <span className="font-mono text-[6px] text-violet-300/70">
                      DISPONIBLE
                    </span>
                  </div>
                  <p className="mt-2 text-[9px] font-semibold text-slate-200">
                    Torno CNC-02
                  </p>
                  <p className="mt-1 text-[7px] text-slate-500">
                    Mecanizado principal
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                    <div className="h-full w-[72%] bg-gradient-to-r from-violet-400/40 to-violet-200/70" />
                  </div>
                </div>

                <div
                  className="qt-work-order-module absolute right-[5%] top-[16%] w-[170px] rounded-2xl border border-blue-300/10 bg-[#080d19]/82 p-3 backdrop-blur-xl"
                  style={reveal(0.4, 0.49, 8)}
                >
                  <p className="text-[6px] font-bold uppercase tracking-[0.13em] text-slate-600">
                    Documento
                  </p>
                  <p className="mt-2 truncate text-[8px] font-semibold text-slate-300">
                    Plano_eje_REV-C.pdf
                  </p>
                  <p className="mt-1 font-mono text-[6px] text-blue-200/60">
                    REV C · VINCULADO
                  </p>
                </div>

                <div
                  className="absolute left-[12%] right-[4%] top-[68%]"
                  style={{ opacity: routeProgress }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[6px] font-bold uppercase tracking-[0.14em] text-violet-200/70">
                        Hoja de ruta
                      </p>
                      <p className="mt-1 font-mono text-[8px] text-slate-500">
                        4 operaciones encadenadas
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-1 font-mono text-[6px] ${releaseProgress > 0.55 ? 'border-emerald-300/15 bg-emerald-400/[0.055] text-emerald-300' : 'border-violet-300/12 bg-violet-300/[0.035] text-violet-200/70'}`}
                    >
                      {releaseProgress > 0.55 ? 'RUTA LIBERADA' : 'PENDIENTE'}
                    </span>
                  </div>

                  <div className="qt-work-order-route relative grid grid-cols-4 gap-4 pt-5">
                    <div className="absolute left-[8%] right-[8%] top-[34px] h-px bg-white/[0.065]" />
                    <div
                      className="absolute left-[8%] top-[34px] h-px origin-left bg-gradient-to-r from-violet-300/80 via-violet-300/70 to-sky-300/70 shadow-[0_0_12px_rgba(139,92,246,0.36)]"
                      style={{
                        width: `${84 * routeProgress}%`,
                        opacity: routeGlow,
                      }}
                    />

                    {operations.map(([number, name], index) => {
                      const start = 0.5 + index * 0.045
                      const operationProgress = reducedMotion
                        ? 1
                        : rangeProgress(scrollProgress, start, start + 0.055)

                      return (
                        <div
                          key={number}
                          className="relative text-center"
                          style={{
                            opacity: operationProgress,
                            transform: `translateY(${(1 - operationProgress) * 8}px)`,
                          }}
                        >
                          <div className="relative z-[2] mx-auto grid h-7 w-7 place-items-center rounded-full border border-violet-300/20 bg-[#0a0d1a] font-mono text-[6px] text-violet-100">
                            {number}
                          </div>
                          <p className="mt-2 text-[7px] font-semibold text-slate-300">
                            {name}
                          </p>
                          <p className="mt-1 font-mono text-[5px] uppercase tracking-[0.08em] text-slate-700">
                            pendiente
                          </p>
                        </div>
                      )
                    })}

                    {!reducedMotion && releaseProgress > 0.45 ? (
                      <span className="qt-work-order-pulse absolute left-[8%] top-[31px] z-[4] h-[7px] w-[7px] rounded-full bg-sky-200 shadow-[0_0_15px_rgba(125,211,252,0.95)]" />
                    ) : null}
                  </div>
                </div>

                <div
                  className="absolute left-[53%] top-[57%] -translate-x-1/2 text-center"
                  style={{
                    opacity: releaseProgress,
                    transform: `translate(-50%, ${(1 - releaseProgress) * 8}px)`,
                  }}
                >
                  <p className="text-[7px] font-bold uppercase tracking-[0.15em] text-emerald-300/80">
                    Orden lista para ejecutar
                  </p>
                  <p className="mt-1 text-[7px] text-slate-500">
                    material · máquina · documento · ruta
                  </p>
                </div>
              </div>

              <div className="relative mx-auto mt-3 h-[390px] w-full max-w-[520px] lg:hidden">
                <div
                  className="mx-auto w-[210px] rounded-2xl border border-violet-300/15 bg-[#0a0d1a]/88 p-4 text-center"
                  style={{ opacity: transformProgress }}
                >
                  <p className="text-[6px] font-bold uppercase tracking-[0.14em] text-violet-300/70">
                    Orden de trabajo
                  </p>
                  <p className="mt-2 font-mono text-[11px] font-semibold text-white">
                    OT-2026-014
                  </p>
                  <p className="mt-1 text-[6px] text-slate-600">
                    desde COT-2026-014 · V2
                  </p>
                </div>

                <div
                  className="mt-3 grid grid-cols-2 gap-2"
                  style={{ opacity: moduleProgress }}
                >
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                    <p className="text-[6px] uppercase tracking-[0.1em] text-slate-600">
                      Material
                    </p>
                    <p className="mt-1 text-[8px] font-semibold text-slate-200">
                      AISI 4140
                    </p>
                    <p className="mt-1 font-mono text-[6px] text-violet-200/70">
                      LOT-4140-202
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                    <p className="text-[6px] uppercase tracking-[0.1em] text-slate-600">
                      Máquina
                    </p>
                    <p className="mt-1 text-[8px] font-semibold text-slate-200">
                      Torno CNC-02
                    </p>
                    <p className="mt-1 font-mono text-[6px] text-violet-200/70">
                      DISPONIBLE
                    </p>
                  </div>
                </div>

                <div className="mt-4" style={{ opacity: routeProgress }}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[6px] font-bold uppercase tracking-[0.12em] text-violet-200/70">
                      Hoja de ruta
                    </span>
                    <span className="font-mono text-[6px] text-slate-600">
                      4 operaciones
                    </span>
                  </div>
                  <div className="space-y-2">
                    {operations.map(([number, name], index) => (
                      <div
                        key={number}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.055] bg-white/[0.02] px-3 py-2.5"
                        style={reveal(
                          0.5 + index * 0.045,
                          0.56 + index * 0.045,
                          6,
                        )}
                      >
                        <span className="grid h-7 w-7 place-items-center rounded-full border border-violet-300/15 bg-violet-300/[0.04] font-mono text-[6px] text-violet-100">
                          {number}
                        </span>
                        <div className="flex-1">
                          <p className="text-[8px] font-semibold text-slate-300">
                            {name}
                          </p>
                          <p className="mt-0.5 font-mono text-[5px] uppercase tracking-[0.08em] text-slate-700">
                            pendiente
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="mt-3 text-center"
                  style={{ opacity: releaseProgress }}
                >
                  <p className="text-[7px] font-bold uppercase tracking-[0.14em] text-emerald-300">
                    Ruta liberada
                  </p>
                  <p className="mt-1 text-[6px] text-slate-600">
                    lista para producción
                  </p>
                </div>
              </div>

              <div
                className="pointer-events-none absolute left-1/2 top-0 h-10 w-px -translate-x-1/2 bg-gradient-to-b from-violet-300/50 to-transparent lg:hidden"
                style={{ opacity: entryProgress }}
              />
              <div
                className="pointer-events-none absolute bottom-0 left-1/2 h-10 w-px -translate-x-1/2 origin-top bg-gradient-to-b from-violet-300/50 to-sky-300/30 lg:hidden"
                style={{
                  opacity: exitProgress,
                  transform: `translateX(-50%) scaleY(${exitProgress})`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
