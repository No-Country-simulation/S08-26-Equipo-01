import {
  rangeProgress,
  usePinnedSectionProgress,
} from '../hooks/usePinnedSectionProgress'
import type { LandingStoryStage } from '../model/landingStory'
import '../productionSection.css'
import { ProductionIntro } from './ProductionIntro'
import { ProductionTrace } from './ProductionTrace'

interface ProductionSectionProps {
  stage: LandingStoryStage
  reducedMotion: boolean
}

function operationStatus(progress: number, start: number, end: number) {
  if (progress >= end) return 'COMPLETADO'
  if (progress >= start) return 'EN PROCESO'
  return 'PENDIENTE'
}

export function ProductionSection({
  stage,
  reducedMotion,
}: ProductionSectionProps) {
  const { sectionRef, scrollProgress, reveal } = usePinnedSectionProgress({
    reducedMotion,
    accelerateReverse: true,
  })

  const entryProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.025, 0.12)
  const cutProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.12, 0.28)
  const turnProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.28, 0.52)
  const grindProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.52, 0.72)
  const readyProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.72, 0.86)
  const qualityProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.86, 0.98)

  const executionProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.1, 0.72)
  const routeProgress = Math.min(1, executionProgress * 1.04)
  const carrierLeft = 14.5 + executionProgress * 53.5
  const carrierLift = Math.sin(executionProgress * Math.PI * 3) * 1.4
  const stationFade = 1 - readyProgress * 0.68

  const cutStatus = operationStatus(scrollProgress, 0.12, 0.28)
  const turnStatus = operationStatus(scrollProgress, 0.28, 0.52)
  const grindStatus = operationStatus(scrollProgress, 0.52, 0.72)

  const phase =
    qualityProgress > 0
      ? 'Hacia calidad'
      : readyProgress > 0
        ? 'Pieza lista'
        : grindProgress > 0
          ? 'Rectificando'
          : turnProgress > 0
            ? 'Mecanizando CNC'
            : cutProgress > 0
              ? 'Cortando material'
              : 'Recibiendo ruta'

  const turnActive = scrollProgress >= 0.28 && scrollProgress < 0.52
  const grindActive = scrollProgress >= 0.52 && scrollProgress < 0.72

  return (
    <section
      ref={sectionRef}
      id={stage.id}
      className="qt-production-section relative isolate bg-[#020817]"
    >
      <div className="sticky qt-production-pinned overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_69%_48%,rgba(14,165,233,0.14),transparent_27%),radial-gradient(circle_at_51%_54%,rgba(59,130,246,0.09),transparent_33%),linear-gradient(180deg,#030712_0%,#031020_48%,#020817_100%)]" />
        <div className="absolute inset-0 opacity-[0.2] [background-image:linear-gradient(rgba(125,211,252,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.045)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(circle_at_68%_53%,black,transparent_70%)]" />
        <div className="pointer-events-none absolute right-[6%] top-[21%] h-[52%] w-[52%] rounded-full bg-sky-400/[0.045] blur-[115px]" />

        <ProductionTrace
          entryProgress={entryProgress}
          qualityProgress={qualityProgress}
        />

        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1440px] grid-rows-[auto_1fr] gap-3 px-5 pb-4 pt-4 sm:px-8 sm:pt-5 lg:grid-cols-[0.68fr_1.32fr] lg:grid-rows-1 lg:items-center lg:gap-8 lg:px-12 lg:pb-8 lg:pt-8 xl:px-16">
          <ProductionIntro
            stage={stage}
            reducedMotion={reducedMotion}
            scrollProgress={scrollProgress}
            phase={phase}
            reveal={reveal}
          />

          <div className="order-2 min-h-0">
            <div className="relative h-full min-h-[410px] lg:min-h-[630px]">
              <div className="pointer-events-none absolute left-[4%] top-[14%] h-[72%] w-[92%] rounded-[50%] bg-sky-400/[0.045] blur-[90px]" />

              <div className="absolute inset-0 hidden lg:block">
                <div
                  className="absolute inset-x-[3%] top-[22%] bottom-[14%] opacity-100"
                  style={{ opacity: stationFade }}
                >
                  <div className="absolute left-[4%] right-[6%] top-[51%] h-px bg-white/[0.065]" />
                  <div
                    className="absolute left-[4%] top-[51%] h-px bg-gradient-to-r from-sky-400/60 via-cyan-300/80 to-sky-200/55 shadow-[0_0_18px_rgba(56,189,248,0.35)]"
                    style={{ width: `${Math.max(0, routeProgress * 86)}%` }}
                  />

                  {[14.5, 41.5, 68, 89].map((left, index) => {
                    const labels = [
                      'CORTE',
                      'TORNEADO CNC',
                      'RECTIFICADO',
                      'CALIDAD',
                    ]
                    const subtitles = [
                      'OP-01',
                      'OP-02 · CNC-02',
                      'OP-03',
                      'SALIDA',
                    ]
                    const progressValues = [
                      cutProgress,
                      turnProgress,
                      grindProgress,
                      qualityProgress,
                    ]
                    const completed = [
                      scrollProgress >= 0.28,
                      scrollProgress >= 0.52,
                      scrollProgress >= 0.72,
                      false,
                    ][index]
                    const active =
                      (progressValues[index] ?? 0) > 0 && !completed

                    return (
                      <div
                        key={labels[index]}
                        className="absolute top-[51%] z-[8] h-0 w-0"
                        style={{ left: `${left}%` }}
                      >
                        <span
                          className={`absolute left-[-8px] top-[-8px] grid h-4 w-4 place-items-center rounded-full border ${completed ? 'border-sky-200/45 bg-sky-300 text-[#03101c]' : active ? 'border-cyan-200/55 bg-[#061524] shadow-[0_0_24px_rgba(34,211,238,0.55)]' : 'border-white/10 bg-[#07101d]'}`}
                        >
                          {completed ? (
                            <span className="text-[8px] font-black">✓</span>
                          ) : (
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-cyan-200' : 'bg-slate-700'}`}
                            />
                          )}
                        </span>
                        <div className="absolute left-1/2 top-[18px] w-[132px] -translate-x-1/2 text-center">
                          <p
                            className={`text-[7px] font-extrabold tracking-[0.11em] ${active ? 'text-cyan-100' : completed ? 'text-sky-200/75' : 'text-slate-600'}`}
                          >
                            {labels[index]}
                          </p>
                          <p className="mt-1 font-mono text-[6px] text-slate-700">
                            {subtitles[index]}
                          </p>
                        </div>
                      </div>
                    )
                  })}

                  <div
                    className="qt-production-carrier absolute top-[51%] z-[12] -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${carrierLeft}%`,
                      transform: `translate(-50%, calc(-50% + ${carrierLift}px))`,
                    }}
                  >
                    <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300/[0.08] blur-xl" />
                    <div className="relative flex h-[30px] w-[74px] items-center justify-center">
                      <div className="qt-production-piece absolute h-[18px] w-[64px] rounded-[9px] border border-sky-200/30 bg-[linear-gradient(180deg,#b6c9d8_0%,#456276_38%,#182d3f_58%,#7c9aac_100%)] shadow-[0_0_24px_rgba(56,189,248,0.24)]">
                        <span className="absolute inset-y-[3px] left-[9px] w-px bg-white/20" />
                        <span className="absolute inset-y-[3px] right-[10px] w-px bg-slate-950/35" />
                        <span className="absolute left-1/2 top-1/2 h-[4px] w-[34px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.12] blur-[1px]" />
                      </div>
                    </div>
                    <div className="absolute left-1/2 top-[28px] -translate-x-1/2 whitespace-nowrap rounded-full border border-sky-300/10 bg-[#04101d]/80 px-2 py-1 font-mono text-[6px] text-sky-100/70 backdrop-blur-md">
                      LOT-4140-202
                    </div>
                  </div>

                  <div
                    className="absolute left-[7%] top-[8%] w-[180px]"
                    style={{ opacity: Math.min(1, cutProgress * 1.3) }}
                  >
                    <div className="relative h-[128px] overflow-hidden rounded-[20px] border border-sky-300/10 bg-[#06111d]/68 shadow-[0_26px_70px_-46px_rgba(56,189,248,0.7)] backdrop-blur-xl">
                      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(56,189,248,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.055)_1px,transparent_1px)] [background-size:14px_14px]" />
                      <div className="absolute left-5 right-5 top-[58px] h-4 rounded-full border border-slate-400/20 bg-gradient-to-b from-slate-400/40 to-slate-700/30" />
                      <div
                        className="absolute top-6 h-[80px] w-[3px] bg-gradient-to-b from-transparent via-cyan-200 to-transparent shadow-[0_0_14px_rgba(103,232,249,0.7)]"
                        style={{ left: `${30 + cutProgress * 42}%` }}
                      />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                        <span className="font-mono text-[6px] text-slate-600">
                          AISI 4140
                        </span>
                        <span className="font-mono text-[6px] text-cyan-200/70">
                          82.4 KG
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute left-[31%] top-[1%] w-[278px]"
                    style={{ opacity: Math.min(1, turnProgress * 1.25) }}
                  >
                    <div
                      className={`qt-production-lathe relative h-[176px] overflow-hidden rounded-[24px] border border-sky-300/12 bg-[#050f1a]/82 shadow-[0_34px_90px_-48px_rgba(14,165,233,0.82)] backdrop-blur-xl ${turnActive && !reducedMotion ? 'qt-production-lathe--active' : ''}`}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_47%,rgba(56,189,248,0.09),transparent_34%)]" />
                      <div className="absolute left-4 top-3 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          {turnActive && !reducedMotion ? (
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-30" />
                          ) : null}
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
                        </span>
                        <span className="font-mono text-[7px] font-semibold text-cyan-100/80">
                          TORNO CNC-02
                        </span>
                      </div>
                      <div className="absolute left-[28px] top-[65px] h-[58px] w-[28px] rounded-l-[12px] border border-slate-400/20 bg-gradient-to-r from-slate-800 to-slate-500/45 shadow-[0_0_20px_rgba(148,163,184,0.08)]" />
                      <div className="absolute left-[48px] top-[81px] h-[26px] w-[152px]">
                        <div
                          className={`qt-production-workpiece absolute inset-y-[4px] left-0 right-0 rounded-full border border-sky-100/25 bg-[linear-gradient(180deg,#b8ccd9,#3f6176_38%,#102536_58%,#809fb2)] ${turnActive && !reducedMotion ? 'qt-production-workpiece--spinning' : ''}`}
                        >
                          <span className="absolute left-[21%] top-[-2px] h-[20px] w-px bg-white/15" />
                          <span className="absolute left-[57%] top-[-2px] h-[20px] w-px bg-white/15" />
                        </div>
                      </div>
                      <div
                        className="absolute top-[67px] h-[54px] w-[54px] rotate-45 border-l border-t border-cyan-200/35 bg-[#08111a]/90 shadow-[-8px_-8px_25px_rgba(34,211,238,0.08)]"
                        style={{ right: `${18 + (1 - turnProgress) * 14}%` }}
                      />
                      {turnActive && !reducedMotion ? (
                        <>
                          <span className="qt-production-spark absolute left-[69%] top-[76px] h-px w-8 origin-left bg-gradient-to-r from-cyan-100 to-transparent" />
                          <span className="qt-production-spark qt-production-spark--two absolute left-[70%] top-[84px] h-px w-7 origin-left bg-gradient-to-r from-sky-100 to-transparent" />
                          <span className="qt-production-spark qt-production-spark--three absolute left-[68%] top-[92px] h-px w-6 origin-left bg-gradient-to-r from-cyan-200 to-transparent" />
                        </>
                      ) : null}
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                        <span className="font-mono text-[6px] text-slate-600">
                          Ø48.00
                        </span>
                        <span className="font-mono text-[6px] text-sky-200/70">
                          1,240 RPM
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute right-[7%] top-[7%] w-[190px]"
                    style={{ opacity: Math.min(1, grindProgress * 1.3) }}
                  >
                    <div
                      className={`relative h-[136px] overflow-hidden rounded-[20px] border border-cyan-300/10 bg-[#06111d]/74 shadow-[0_28px_76px_-48px_rgba(34,211,238,0.78)] backdrop-blur-xl ${grindActive && !reducedMotion ? 'qt-production-grind--active' : ''}`}
                    >
                      <div className="absolute left-5 right-5 top-[57px] h-[18px] rounded-full border border-cyan-100/20 bg-[linear-gradient(180deg,#a9c0ce,#39586b_40%,#142839_60%,#718fa2)]" />
                      <div className="absolute left-6 right-6 top-[43px] h-[2px] overflow-hidden bg-cyan-300/10">
                        <span
                          className="block h-full bg-gradient-to-r from-transparent via-cyan-100 to-transparent shadow-[0_0_10px_rgba(103,232,249,0.65)]"
                          style={{
                            width: `${Math.max(4, grindProgress * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="absolute left-4 top-3 font-mono text-[6px] text-slate-600">
                        ACABADO
                      </div>
                      <div className="absolute right-4 top-3 text-right">
                        <p className="font-mono text-[8px] font-semibold text-cyan-100">
                          Ra 1.6
                        </p>
                        <p className="mt-0.5 font-mono text-[6px] text-slate-600">
                          ±0.02 mm
                        </p>
                      </div>
                      <div
                        className="absolute top-[34px] h-[64px] w-px bg-gradient-to-b from-transparent via-cyan-100 to-transparent shadow-[0_0_12px_rgba(103,232,249,0.72)]"
                        style={{ left: `${18 + grindProgress * 64}%` }}
                      />
                    </div>
                  </div>

                  <div className="absolute bottom-[1%] left-[8%] right-[8%] grid grid-cols-3 gap-3 font-mono text-[6px] text-slate-700">
                    <div className="flex items-center justify-between border-t border-white/[0.05] pt-2">
                      <span>CORTE</span>
                      <span
                        className={
                          cutStatus === 'COMPLETADO'
                            ? 'text-sky-300/70'
                            : cutStatus === 'EN PROCESO'
                              ? 'text-cyan-200/80'
                              : ''
                        }
                      >
                        {cutStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/[0.05] pt-2">
                      <span>CNC</span>
                      <span
                        className={
                          turnStatus === 'COMPLETADO'
                            ? 'text-sky-300/70'
                            : turnStatus === 'EN PROCESO'
                              ? 'text-cyan-200/80'
                              : ''
                        }
                      >
                        {turnStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/[0.05] pt-2">
                      <span>RECTIFICADO</span>
                      <span
                        className={
                          grindStatus === 'COMPLETADO'
                            ? 'text-sky-300/70'
                            : grindStatus === 'EN PROCESO'
                              ? 'text-cyan-200/80'
                              : ''
                        }
                      >
                        {grindStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute left-[54%] top-[49%] z-[20] w-[360px] -translate-x-1/2 -translate-y-1/2 text-center"
                  style={{
                    opacity: readyProgress,
                    transform: `translate(-50%, -50%) scale(${0.86 + readyProgress * 0.14})`,
                  }}
                >
                  <div className="relative mx-auto h-[108px] w-[244px]">
                    <div className="absolute inset-0 rounded-[50%] bg-sky-400/[0.08] blur-[38px]" />
                    <div className="absolute left-1/2 top-1/2 h-[34px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-100/30 bg-[linear-gradient(180deg,#c0d2dc_0%,#4b6d80_35%,#122b3b_58%,#88a5b5_100%)] shadow-[0_0_40px_rgba(56,189,248,0.2)]">
                      <span className="absolute left-[18%] top-[-3px] h-[38px] w-px bg-white/15" />
                      <span className="absolute left-[61%] top-[-3px] h-[38px] w-px bg-white/15" />
                      <span className="absolute left-1/2 top-1/2 h-[5px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.1] blur-[1px]" />
                    </div>
                    <div
                      className="qt-production-scan absolute bottom-1 top-1 w-px bg-gradient-to-b from-transparent via-emerald-200 to-transparent shadow-[0_0_22px_rgba(110,231,183,0.8)]"
                      style={{
                        left: `${qualityProgress * 100}%`,
                        opacity: qualityProgress,
                      }}
                    />
                  </div>

                  <p className="mt-3 text-[8px] font-extrabold uppercase tracking-[0.15em] text-sky-200/75">
                    Pieza lista para inspección
                  </p>
                  <p className="mt-2 font-mono text-[13px] font-semibold text-white">
                    OT-2026-014
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {['LOT-4140-202', '3 OPERACIONES', 'TRAZABLE'].map(
                      (item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 font-mono text-[6px] text-slate-500"
                        >
                          {item}
                        </span>
                      ),
                    )}
                  </div>
                  <div
                    className="mx-auto mt-4 h-px w-[240px] bg-gradient-to-r from-sky-300/25 via-cyan-200/70 to-emerald-300/35 shadow-[0_0_14px_rgba(34,211,238,0.25)]"
                    style={{ opacity: qualityProgress }}
                  />
                </div>
              </div>

              <div className="relative mx-auto mt-2 h-[370px] w-full max-w-[540px] lg:hidden">
                <div className="absolute left-[23px] top-0 bottom-8 w-px bg-white/[0.06]" />
                <div
                  className="absolute left-[23px] top-0 bottom-8 w-px origin-top bg-gradient-to-b from-sky-300/70 via-cyan-300/70 to-emerald-300/35"
                  style={{
                    transform: `scaleY(${Math.max(entryProgress * 0.15, executionProgress)})`,
                  }}
                />

                <div className="space-y-3 pt-3">
                  {[
                    ['Corte', 'AISI 4140 · 82.4 kg', cutStatus, cutProgress],
                    [
                      'Torneado CNC',
                      'Torno CNC-02 · Ø48.00',
                      turnStatus,
                      turnProgress,
                    ],
                    [
                      'Rectificado',
                      'Ra 1.6 · ±0.02 mm',
                      grindStatus,
                      grindProgress,
                    ],
                  ].map(([title, detail, status, progress]) => (
                    <div
                      key={String(title)}
                      className="relative ml-6 pl-5"
                      style={{ opacity: Math.max(0.16, Number(progress)) }}
                    >
                      <span
                        className={`absolute left-[-4px] top-[8px] h-[9px] w-[9px] rounded-full border ${status === 'COMPLETADO' ? 'border-sky-200/45 bg-sky-300' : status === 'EN PROCESO' ? 'border-cyan-200/55 bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.5)]' : 'border-white/10 bg-[#07101d]'}`}
                      />
                      <div className="rounded-xl border border-white/[0.055] bg-white/[0.018] px-3 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[8px] font-bold text-slate-200">
                            {title}
                          </p>
                          <span className="font-mono text-[6px] text-sky-200/70">
                            {status}
                          </span>
                        </div>
                        <p className="mt-1 text-[7px] text-slate-500">
                          {detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="absolute inset-0 grid place-items-center"
                  style={{ opacity: readyProgress }}
                >
                  <div className="rounded-[24px] border border-sky-300/12 bg-[#06111d]/92 px-6 py-5 text-center shadow-[0_24px_70px_-40px_rgba(56,189,248,0.7)] backdrop-blur-xl">
                    <p className="text-[7px] font-bold uppercase tracking-[0.13em] text-sky-200/75">
                      Pieza lista para inspección
                    </p>
                    <p className="mt-2 font-mono text-[11px] font-semibold text-white">
                      OT-2026-014
                    </p>
                    <p className="mt-2 text-[7px] text-slate-500">
                      LOT-4140-202 · 3 operaciones completadas
                    </p>
                    <p
                      className="mt-2 text-[7px] font-semibold text-emerald-300"
                      style={{ opacity: qualityProgress }}
                    >
                      Hacia calidad
                    </p>
                  </div>
                </div>

                <div
                  className="pointer-events-none absolute left-1/2 top-0 h-10 w-px -translate-x-1/2 bg-gradient-to-b from-sky-300/45 to-transparent"
                  style={{ opacity: entryProgress }}
                />
                <div
                  className="pointer-events-none absolute bottom-0 left-1/2 h-10 w-px -translate-x-1/2 origin-top bg-gradient-to-b from-cyan-300/45 to-emerald-300/35"
                  style={{
                    opacity: qualityProgress,
                    transform: `translateX(-50%) scaleY(${qualityProgress})`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
