import {
  rangeProgress,
  usePinnedSectionProgress,
} from '../hooks/usePinnedSectionProgress'
import type { LandingStoryStage } from '../model/landingStory'
import { QuoteIntro } from './QuoteIntro'
import { QuoteReviewBadge } from './QuoteReviewBadge'
import { QuoteTrace } from './QuoteTrace'
import '../quoteSection.css'

interface QuoteSectionProps {
  stage: LandingStoryStage
  reducedMotion: boolean
}

const quoteItems = [
  ['Eje mecanizado AISI 4140', '120 pzas', '$1,350', '$162,000'],
  ['Rectificado y acabado', '120 pzas', '$145', '$17,400'],
  ['Inspección dimensional', '1 lote', '$5,100', '$5,100'],
] as const

export function QuoteSection({ stage, reducedMotion }: QuoteSectionProps) {
  const { sectionRef, scrollProgress, reveal } = usePinnedSectionProgress({
    reducedMotion,
    accelerateReverse: true,
  })

  const entryProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.025, 0.12)
  const outlineProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.1, 0.23)
  const identityProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.17, 0.27)
  const composeProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.24, 0.47)
  const reviewProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.48, 0.59)
  const versionProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.55, 0.68)
  const approvalProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.68, 0.84)
  const exitProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.86, 0.98)

  const phase =
    exitProgress > 0
      ? 'Liberando ejecución'
      : approvalProgress > 0
        ? 'Aprobando V2'
        : versionProgress > 0
          ? 'Versionando propuesta'
          : reviewProgress > 0
            ? 'Revisión comercial'
            : composeProgress > 0
              ? 'Construyendo V1'
              : outlineProgress > 0
                ? 'Trazando cotización'
                : 'Conectando expediente'

  const approved = approvalProgress > 0.55
  const showV2 = versionProgress > 0.44 || approvalProgress > 0
  const sheetOpacity = outlineProgress * (1 - versionProgress * 0.02)
  const reviewBandX = -115 + reviewProgress * 230
  const ghostProgress = versionProgress * (1 - approvalProgress)
  const contentOpacity = Math.max(identityProgress * 0.7, composeProgress)
  const oldDateOpacity = 1 - versionProgress
  const newDateOpacity = versionProgress

  return (
    <section
      ref={sectionRef}
      id={stage.id}
      className="qt-quote-section relative isolate bg-[#030712]"
    >
      <div className="sticky qt-quote-pinned overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_46%,rgba(245,158,11,0.105),transparent_28%),radial-gradient(circle_at_42%_58%,rgba(59,130,246,0.055),transparent_30%),linear-gradient(180deg,#020817_0%,#080d17_48%,#030712_100%)]" />
        <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] [background-size:76px_76px] [mask-image:radial-gradient(circle_at_31%_50%,black,transparent_66%)]" />

        <QuoteTrace entryProgress={entryProgress} exitProgress={exitProgress} />

        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1440px] grid-rows-[auto_1fr] gap-3 px-5 pb-4 pt-4 sm:px-8 sm:pt-5 lg:grid-cols-[1.12fr_0.88fr] lg:grid-rows-1 lg:items-center lg:gap-14 lg:px-12 lg:pb-8 lg:pt-8 xl:px-16">
          <div className="order-2 min-h-0 lg:order-1">
            <div className="qt-landing-stage relative flex h-full min-h-[390px] items-start justify-center lg:min-h-[610px] lg:items-center">
              <div className="pointer-events-none absolute left-[3%] top-[12%] h-[66%] w-[74%] rounded-full bg-amber-400/[0.065] blur-[95px]" />
              <div className="pointer-events-none absolute right-[2%] top-[26%] h-[44%] w-[44%] rounded-full bg-blue-500/[0.045] blur-[75px]" />

              <div
                className="qt-quote-version absolute left-[9%] top-[17%] z-[2] hidden w-[74%] max-w-[560px] rounded-[28px] border border-amber-200/[0.08] bg-[#080e17]/78 px-5 py-4 shadow-[0_28px_95px_-55px_rgba(245,158,11,0.5)] lg:block"
                style={{
                  opacity: ghostProgress * 0.72,
                  transform: `translate3d(${-8 - ghostProgress * 12}px, ${-5 - ghostProgress * 9}px, 0) rotate(-2.2deg) scale(${0.985 - ghostProgress * 0.02})`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[6px] font-bold uppercase tracking-[0.14em] text-slate-600">
                      Versión anterior
                    </p>
                    <p className="mt-1 font-mono text-[10px] font-semibold text-slate-300">
                      COT-2026-014 · V1
                    </p>
                  </div>
                  <span className="rounded-full border border-white/[0.055] px-2 py-1 font-mono text-[6px] text-slate-600">
                    18 OCT
                  </span>
                </div>
              </div>

              <div
                className="qt-quote-sheet relative z-[4] mt-2 w-full max-w-[610px] overflow-hidden rounded-[22px] bg-[#0a111c]/96 shadow-[0_42px_130px_-52px_rgba(245,158,11,0.72)] backdrop-blur-xl lg:mt-0 lg:rounded-[28px]"
                style={{
                  opacity: sheetOpacity,
                  transform: `translate3d(${versionProgress * 10}px, ${(1 - outlineProgress) * 14 + versionProgress * 5}px, 0) rotate(${-1.5 + versionProgress * 1.5}deg) scale(${0.985 + approvalProgress * 0.015})`,
                }}
              >
                <svg
                  className="pointer-events-none absolute inset-0 z-[8] h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <rect
                    x="1.2"
                    y="1.2"
                    width="97.6"
                    height="97.6"
                    rx="4.6"
                    fill="none"
                    pathLength="1"
                    stroke="#fbbf24"
                    strokeWidth="0.42"
                    strokeLinecap="round"
                    strokeDasharray="1"
                    strokeDashoffset={1 - outlineProgress}
                    opacity={0.22 + outlineProgress * 0.72}
                  />
                  <rect
                    x="1.2"
                    y="1.2"
                    width="97.6"
                    height="97.6"
                    rx="4.6"
                    fill="none"
                    pathLength="1"
                    stroke="#fde68a"
                    strokeWidth="0.38"
                    strokeLinecap="round"
                    strokeDasharray="1"
                    strokeDashoffset={1 - approvalProgress}
                    opacity={approvalProgress * 0.78}
                  />
                </svg>

                <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(251,191,36,0.035),transparent_34%,rgba(59,130,246,0.022)_72%,transparent)]" />
                <div className="absolute right-[-7%] top-[-10%] h-36 w-36 rounded-full bg-amber-300/[0.055] blur-3xl" />

                <div className="relative" style={{ opacity: contentOpacity }}>
                  <div className="border-b border-white/[0.06] px-4 py-3.5 sm:px-5 lg:px-6 lg:py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${approved ? 'bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.65)]' : 'bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.55)]'}`}
                          />
                          <span className="text-[7px] font-extrabold uppercase tracking-[0.16em] text-amber-100/75 lg:text-[8px]">
                            {approved
                              ? 'Cotización aprobada'
                              : 'Propuesta comercial'}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <p className="font-mono text-[12px] font-semibold text-white lg:text-[14px]">
                            COT-2026-014
                          </p>
                          <span
                            className={`font-mono text-[7px] ${showV2 ? 'text-amber-200/75' : 'text-slate-500'}`}
                          >
                            {showV2 ? '· V2' : '· V1'}
                          </span>
                          <span className="font-mono text-[7px] text-slate-700">
                            EXP-2026-014
                          </span>
                        </div>
                      </div>
                      <span
                        className={`rounded-lg border px-2 py-1 font-mono text-[7px] lg:px-2.5 lg:py-1.5 ${approved ? 'border-emerald-300/15 bg-emerald-400/[0.06] text-emerald-300' : reviewProgress > 0 ? 'border-amber-300/15 bg-amber-400/[0.055] text-amber-200' : 'border-white/[0.07] bg-white/[0.025] text-slate-500'}`}
                      >
                        {approved
                          ? 'APROBADA'
                          : reviewProgress > 0
                            ? 'REVISIÓN'
                            : 'BORRADOR'}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4 border-t border-white/[0.04] pt-3">
                      <div>
                        <p className="text-[6px] font-bold uppercase tracking-[0.11em] text-slate-600">
                          Cliente
                        </p>
                        <p className="mt-1 text-[9px] font-semibold text-slate-200 lg:text-[10px]">
                          AeroParts Manufacturing
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[6px] font-bold uppercase tracking-[0.11em] text-slate-600">
                          Referencia
                        </p>
                        <p className="mt-1 font-mono text-[8px] text-slate-400">
                          SHAFT-014
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative px-3 py-3 sm:px-4 lg:px-6 lg:py-4">
                    <div
                      className="grid grid-cols-[1fr_64px_68px_82px] gap-2 border-b border-white/[0.055] pb-2 text-[6px] font-bold uppercase tracking-[0.1em] text-slate-700 lg:grid-cols-[1fr_72px_82px_96px] lg:text-[7px]"
                      style={reveal(0.24, 0.3, 6)}
                    >
                      <span>Concepto</span>
                      <span className="text-right">Cantidad</span>
                      <span className="text-right">Unitario</span>
                      <span className="text-right">Importe</span>
                    </div>

                    <div className="divide-y divide-white/[0.045]">
                      {quoteItems.map(
                        ([concept, quantity, unitPrice, total], index) => {
                          const start = 0.28 + index * 0.052
                          const end = start + 0.045

                          return (
                            <div
                              key={concept}
                              className="grid grid-cols-[1fr_64px_68px_82px] gap-2 py-2.5 lg:grid-cols-[1fr_72px_82px_96px] lg:py-3"
                              style={reveal(start, end, 8)}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-[8px] font-semibold text-slate-200 lg:text-[9px]">
                                  {concept}
                                </p>
                                <p className="mt-0.5 font-mono text-[6px] text-slate-700">
                                  AISI 4140
                                </p>
                              </div>
                              <span className="self-center text-right font-mono text-[7px] text-slate-500 lg:text-[8px]">
                                {quantity}
                              </span>
                              <span className="self-center text-right font-mono text-[7px] text-slate-500 lg:text-[8px]">
                                {unitPrice}
                              </span>
                              <span className="self-center text-right font-mono text-[8px] font-semibold text-slate-300 lg:text-[9px]">
                                {total}
                              </span>
                            </div>
                          )
                        },
                      )}
                    </div>

                    <div
                      className="mt-2 grid grid-cols-[1fr_auto] items-end gap-4 border-t border-white/[0.06] pt-3"
                      style={reveal(0.4, 0.47, 7)}
                    >
                      <div className="grid grid-cols-3 gap-1.5">
                        <div
                          className="relative overflow-hidden rounded-lg border bg-white/[0.018] px-2 py-2"
                          style={{
                            borderColor:
                              reviewProgress > 0
                                ? `rgba(251,191,36,${0.08 + reviewProgress * 0.2})`
                                : 'rgba(255,255,255,0.05)',
                          }}
                        >
                          <p className="text-[5px] font-bold uppercase tracking-[0.09em] text-slate-700 lg:text-[6px]">
                            Entrega
                          </p>
                          <div className="relative mt-1 h-[13px] whitespace-nowrap text-[7px] font-semibold lg:text-[8px]">
                            <span
                              className="absolute left-0 top-0 text-slate-300"
                              style={{
                                opacity: oldDateOpacity,
                                transform: `translateY(${-versionProgress * 5}px)`,
                              }}
                            >
                              18 oct 2026
                            </span>
                            <span
                              className="absolute left-0 top-0 text-amber-200"
                              style={{
                                opacity: newDateOpacity,
                                transform: `translateY(${(1 - versionProgress) * 5}px)`,
                              }}
                            >
                              08 oct 2026
                            </span>
                          </div>
                        </div>
                        {[
                          ['Validez', '7 días'],
                          ['Pago', '50 / 50'],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-lg border border-white/[0.05] bg-white/[0.018] px-2 py-2"
                          >
                            <p className="text-[5px] font-bold uppercase tracking-[0.09em] text-slate-700 lg:text-[6px]">
                              {label}
                            </p>
                            <p className="mt-1 whitespace-nowrap text-[7px] font-semibold text-slate-300 lg:text-[8px]">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="text-right">
                        <p className="text-[6px] font-bold uppercase tracking-[0.11em] text-slate-600">
                          Total
                        </p>
                        <p className="mt-1 font-mono text-[14px] font-semibold tracking-[-0.04em] text-amber-100 lg:text-[17px]">
                          $184,500
                        </p>
                        <p className="mt-0.5 font-mono text-[6px] text-slate-600">
                          MXN + IVA
                        </p>
                      </div>
                    </div>

                    <div
                      className="pointer-events-none absolute inset-y-0 z-[4] w-28 bg-gradient-to-r from-transparent via-amber-200/[0.05] to-transparent"
                      style={{
                        left: `${reviewBandX}%`,
                        opacity: reviewProgress * (1 - approvalProgress * 0.8),
                      }}
                    />
                  </div>

                  <div className="relative border-t border-white/[0.06] px-4 py-3 sm:px-5 lg:px-6 lg:py-4">
                    <div
                      className="flex items-center justify-between gap-4"
                      style={{
                        opacity: reviewProgress * (1 - approvalProgress),
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-7 w-7 place-items-center rounded-full border border-amber-300/14 bg-amber-300/[0.045] font-mono text-[8px] text-amber-200/80">
                          V2
                        </span>
                        <div>
                          <p className="text-[6px] font-bold uppercase tracking-[0.11em] text-amber-200/65">
                            Revisión breve
                          </p>
                          <p className="mt-0.5 text-[8px] text-slate-300">
                            Entrega actualizada · 18 oct → 08 oct
                          </p>
                        </div>
                      </div>
                      <span className="hidden rounded-full border border-amber-300/10 bg-amber-300/[0.035] px-2 py-1 font-mono text-[5px] text-amber-200/65 sm:inline-flex">
                        CAMBIO 01
                      </span>
                    </div>

                    <div
                      className="absolute inset-x-4 bottom-2 top-2 flex items-center justify-between rounded-xl border border-emerald-300/12 bg-[#07140f]/96 px-3 backdrop-blur-xl sm:inset-x-5 lg:inset-x-6 lg:px-4"
                      style={{
                        opacity: approvalProgress,
                        transform: `translate3d(0, ${(1 - approvalProgress) * 12}px, 0) scale(${0.97 + approvalProgress * 0.03})`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-full border border-emerald-300/20 bg-emerald-400/[0.08] text-[12px] font-bold text-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.1)]">
                          ✓
                        </span>
                        <div>
                          <p className="text-[7px] font-extrabold uppercase tracking-[0.13em] text-emerald-300">
                            Cotización aprobada
                          </p>
                          <p className="mt-0.5 font-mono text-[7px] text-slate-400">
                            COT-2026-014 · V2 · $184,500 MXN
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-[8px] font-semibold text-white">
                        08 OCT
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="pointer-events-none absolute bottom-0 left-[32%] z-[9] h-px origin-left bg-gradient-to-r from-amber-200/80 via-amber-300/65 to-violet-300/60 shadow-[0_0_14px_rgba(251,191,36,0.38)]"
                  style={{
                    width: `${exitProgress * 34}%`,
                    opacity: exitProgress,
                  }}
                />
              </div>

              <QuoteReviewBadge
                reviewProgress={reviewProgress}
                versionProgress={versionProgress}
                approvalProgress={approvalProgress}
              />

              <div
                className="pointer-events-none absolute left-1/2 top-0 h-10 w-px -translate-x-1/2 bg-gradient-to-b from-blue-300/45 via-cyan-300/35 to-amber-300/25 lg:hidden"
                style={{ opacity: entryProgress }}
              />
              <div
                className="pointer-events-none absolute bottom-0 left-1/2 h-10 w-px -translate-x-1/2 origin-top bg-gradient-to-b from-amber-300/45 to-violet-300/28 lg:hidden"
                style={{
                  opacity: exitProgress,
                  transform: `translateX(-50%) scaleY(${exitProgress})`,
                }}
              />
            </div>
          </div>

          <QuoteIntro
            stage={stage}
            reducedMotion={reducedMotion}
            scrollProgress={scrollProgress}
            phase={phase}
          />
        </div>
      </div>
    </section>
  )
}
