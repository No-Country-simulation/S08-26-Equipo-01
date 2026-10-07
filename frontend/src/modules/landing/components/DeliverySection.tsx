import {
  rangeProgress,
  usePinnedSectionProgress,
} from '../hooks/usePinnedSectionProgress'
import type { LandingStoryStage } from '../model/landingStory'
import { DeliveryIntro } from './DeliveryIntro'
import { DeliveryTrace } from './DeliveryTrace'
import '../deliverySection.css'

interface DeliverySectionProps {
  stage: LandingStoryStage
  reducedMotion: boolean
}

const historyStages = [
  ['SOL', 'SOL-2026-014', 'Solicitud'],
  ['EXP', 'EXP-2026-014', 'Expediente'],
  ['COT', 'COT-2026-014 · V2', 'Cotización'],
  ['OT', 'OT-2026-014', 'Orden de trabajo'],
  ['PROD', '3 operaciones', 'Producción'],
  ['QC', '3 / 3 conforme', 'Calidad'],
  ['ENT', 'ENT-2026-014', 'Entrega'],
] as const

export function DeliverySection({
  stage,
  reducedMotion,
}: DeliverySectionProps) {
  const { sectionRef, scrollProgress, reveal } = usePinnedSectionProgress({
    reducedMotion,
    accelerateReverse: true,
  })

  const entryProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.025, 0.13)
  const dispatchProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.12, 0.31)
  const transitProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.29, 0.52)
  const arrivalProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.5, 0.67)
  const historyProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.66, 0.86)
  const closeProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.85, 0.98)

  const routeProgress = Math.max(dispatchProgress * 0.18, transitProgress)
  const parcelPosition = 12 + routeProgress * 75
  const logisticsOpacity = 1 - historyProgress * 0.82
  const historyOpacity = historyProgress * (1 - closeProgress * 0.7)

  const phase =
    closeProgress > 0
      ? 'Caso cerrado'
      : historyProgress > 0
        ? 'Reconstruyendo trazabilidad'
        : arrivalProgress > 0
          ? 'Entrega confirmada'
          : transitProgress > 0
            ? 'En tránsito'
            : dispatchProgress > 0
              ? 'Despachando'
              : 'Recibiendo liberación'

  return (
    <section
      ref={sectionRef}
      id={stage.id}
      className="qt-delivery-section relative isolate bg-[#020a10]"
    >
      <div className="sticky qt-delivery-pinned overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_47%,rgba(34,211,238,0.11),transparent_28%),radial-gradient(circle_at_48%_58%,rgba(59,130,246,0.055),transparent_31%),linear-gradient(180deg,#020b0b_0%,#03111a_48%,#020617_100%)]" />
        <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(103,232,249,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.04)_1px,transparent_1px)] [background-size:76px_76px] [mask-image:radial-gradient(circle_at_68%_53%,black,transparent_70%)]" />

        <DeliveryTrace entryProgress={entryProgress} />

        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1440px] grid-rows-[auto_1fr] gap-3 px-5 pb-4 pt-4 sm:px-8 sm:pt-5 lg:grid-cols-[0.72fr_1.28fr] lg:grid-rows-1 lg:items-center lg:gap-10 lg:px-12 lg:pb-8 lg:pt-8 xl:px-16">
          <DeliveryIntro
            stage={stage}
            reducedMotion={reducedMotion}
            scrollProgress={scrollProgress}
            phase={phase}
            reveal={reveal}
          />

          <div className="order-2 min-h-0">
            <div className="relative h-full min-h-[410px] lg:min-h-[620px]">
              <div className="pointer-events-none absolute left-[8%] top-[14%] h-[70%] w-[84%] rounded-[50%] bg-cyan-400/[0.04] blur-[100px]" />

              <div
                className="absolute inset-0 hidden lg:block"
                style={{ opacity: logisticsOpacity }}
              >
                <div className="absolute left-[5%] right-[4%] top-[45%] h-[250px] -translate-y-1/2">
                  <svg
                    viewBox="0 0 1000 250"
                    className="qt-delivery-route absolute inset-0 h-full w-full"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="qtDeliveryRouteLine"
                        x1="0"
                        y1="0.5"
                        x2="1"
                        y2="0.5"
                      >
                        <stop
                          offset="0%"
                          stopColor="#6ee7b7"
                          stopOpacity="0.55"
                        />
                        <stop
                          offset="48%"
                          stopColor="#22d3ee"
                          stopOpacity="0.78"
                        />
                        <stop
                          offset="100%"
                          stopColor="#60a5fa"
                          stopOpacity="0.58"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 90 170 C 190 80, 330 70, 430 134 S 650 214, 770 126 S 885 86, 925 74"
                      fill="none"
                      stroke="rgba(255,255,255,0.055)"
                      strokeWidth="2"
                    />
                    <path
                      d="M 90 170 C 190 80, 330 70, 430 134 S 650 214, 770 126 S 885 86, 925 74"
                      fill="none"
                      pathLength="1"
                      stroke="url(#qtDeliveryRouteLine)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="1"
                      strokeDashoffset={1 - routeProgress}
                    />
                  </svg>

                  {[
                    ['PLANTA', 'Liberada', '10%'],
                    ['TRÁNSITO', 'DHL Express', '51%'],
                    ['DESTINO', 'AeroParts', '91%'],
                  ].map(([label, detail, left], index) => {
                    const activeProgress =
                      index === 0
                        ? dispatchProgress
                        : index === 1
                          ? transitProgress
                          : arrivalProgress
                    const completed =
                      index === 0
                        ? transitProgress > 0.12
                        : index === 1
                          ? arrivalProgress > 0.1
                          : arrivalProgress > 0.72

                    return (
                      <div
                        key={label}
                        className="absolute top-[53%] -translate-x-1/2"
                        style={{ left }}
                      >
                        <span
                          className={`mx-auto grid h-5 w-5 place-items-center rounded-full border ${completed ? 'border-cyan-200/45 bg-cyan-300 text-[#041019]' : activeProgress > 0 ? 'border-cyan-200/55 bg-[#06131d] shadow-[0_0_22px_rgba(34,211,238,0.45)]' : 'border-white/10 bg-[#07101a]'}`}
                        >
                          {completed ? (
                            <span className="text-[9px] font-black">✓</span>
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-200/75" />
                          )}
                        </span>
                        <div className="mt-3 text-center">
                          <p className="text-[7px] font-extrabold tracking-[0.12em] text-cyan-100/80">
                            {label}
                          </p>
                          <p className="mt-1 font-mono text-[6px] text-slate-600">
                            {detail}
                          </p>
                        </div>
                      </div>
                    )
                  })}

                  <div
                    className="qt-delivery-parcel absolute top-[42%] z-[10] -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${parcelPosition}%` }}
                  >
                    <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/[0.07] blur-2xl" />
                    <div className="relative rounded-[16px] border border-cyan-200/18 bg-[#07121c]/95 px-3 py-2.5 shadow-[0_16px_48px_-28px_rgba(34,211,238,0.75)] backdrop-blur-xl">
                      <div className="flex items-center gap-2">
                        <span className="grid h-7 w-7 place-items-center rounded-lg border border-cyan-200/12 bg-cyan-300/[0.045] font-mono text-[7px] font-bold text-cyan-100">
                          ENT
                        </span>
                        <div>
                          <p className="font-mono text-[7px] font-semibold text-white">
                            ENT-2026-014
                          </p>
                          <p className="mt-0.5 font-mono text-[5px] text-slate-600">
                            LOT-4140-202
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute left-[8%] top-[-4%] flex gap-3"
                    style={{ opacity: dispatchProgress }}
                  >
                    {[
                      ['Destino', 'AeroParts Manufacturing'],
                      ['Transportista', 'DHL Express'],
                      ['Entrega', '08 oct 2026'],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-white/[0.055] bg-white/[0.02] px-3 py-2 backdrop-blur-md"
                      >
                        <p className="text-[5px] font-bold uppercase tracking-[0.1em] text-slate-700">
                          {label}
                        </p>
                        <p className="mt-1 text-[7px] font-semibold text-slate-300">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div
                    className="qt-delivery-proof absolute right-[2%] top-[-5%] w-[230px] rounded-[20px] border border-cyan-200/12 bg-[#07131d]/94 p-4 backdrop-blur-xl"
                    style={{
                      opacity: arrivalProgress,
                      transform: `translate3d(0, ${(1 - arrivalProgress) * 14}px, 0) scale(${0.96 + arrivalProgress * 0.04})`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[6px] font-bold uppercase tracking-[0.13em] text-cyan-100/70">
                        Entrega confirmada
                      </span>
                      <span className="grid h-6 w-6 place-items-center rounded-full border border-emerald-300/15 bg-emerald-300/[0.055] text-[10px] font-bold text-emerald-300">
                        ✓
                      </span>
                    </div>
                    <p className="mt-3 font-mono text-[10px] font-semibold text-white">
                      08 OCT 2026 · 16:42
                    </p>
                    <div className="mt-3 space-y-2 border-t border-white/[0.055] pt-3">
                      <div className="flex justify-between gap-4 text-[7px]">
                        <span className="text-slate-600">Recibió</span>
                        <span className="font-semibold text-slate-300">
                          Carlos Mendoza
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 text-[7px]">
                        <span className="text-slate-600">Destino</span>
                        <span className="font-semibold text-slate-300">
                          AeroParts
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 text-[7px]">
                        <span className="text-slate-600">Evidencia</span>
                        <span className="font-semibold text-emerald-300">
                          Adjunta ✓
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="absolute inset-0 hidden lg:block"
                style={{ opacity: historyOpacity }}
              >
                <div className="qt-delivery-history absolute left-[55%] top-[49%] h-[430px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/[0.055] bg-cyan-300/[0.012]">
                  <div className="absolute left-[8%] right-[8%] top-1/2 h-px -translate-y-1/2 bg-white/[0.055]" />
                  <div
                    className="absolute left-[8%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-cyan-300/65 via-blue-300/65 to-emerald-300/55 shadow-[0_0_16px_rgba(34,211,238,0.24)]"
                    style={{ width: `${historyProgress * 84}%` }}
                  />

                  {historyStages.map(([code, ref, label], index) => {
                    const pointProgress = reducedMotion
                      ? 1
                      : rangeProgress(
                          historyProgress,
                          index * 0.11,
                          index * 0.11 + 0.22,
                        )
                    const left = 8 + index * 14

                    return (
                      <div
                        key={code}
                        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                        style={{ left: `${left}%`, opacity: pointProgress }}
                      >
                        <span className="mx-auto grid h-8 w-8 place-items-center rounded-full border border-cyan-200/16 bg-[#06121c]/96 font-mono text-[6px] font-bold text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.08)]">
                          {code}
                        </span>
                        <p className="mt-2 whitespace-nowrap text-[6px] font-semibold text-slate-300">
                          {label}
                        </p>
                        <p className="mt-1 whitespace-nowrap font-mono text-[5px] text-slate-700">
                          {ref}
                        </p>
                      </div>
                    )
                  })}

                  <div
                    className="absolute left-1/2 top-[17%] -translate-x-1/2 text-center"
                    style={{ opacity: historyProgress }}
                  >
                    <p className="text-[7px] font-bold uppercase tracking-[0.16em] text-cyan-100/70">
                      Una sola historia
                    </p>
                    <p className="mt-2 text-[18px] font-semibold tracking-[-0.04em] text-white">
                      De la solicitud a la entrega
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="absolute inset-0 hidden place-items-center lg:grid"
                style={{ opacity: closeProgress }}
              >
                <div
                  className="relative text-center"
                  style={{ transform: `scale(${0.9 + closeProgress * 0.1})` }}
                >
                  <div className="qt-delivery-close-ring absolute left-1/2 top-1/2 h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/12" />
                  <div className="absolute left-1/2 top-1/2 h-[235px] w-[235px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-emerald-300/10" />
                  <div className="relative z-10 mx-auto grid h-[180px] w-[180px] place-items-center rounded-full border border-cyan-200/14 bg-[#06131d]/92 shadow-[0_0_90px_rgba(34,211,238,0.1)] backdrop-blur-xl">
                    <div>
                      <span className="mx-auto grid h-9 w-9 place-items-center rounded-full border border-emerald-300/18 bg-emerald-300/[0.06] text-[14px] font-bold text-emerald-300">
                        ✓
                      </span>
                      <p className="mt-3 text-[7px] font-bold uppercase tracking-[0.16em] text-cyan-100/70">
                        Trazabilidad completa
                      </p>
                      <p className="mt-2 text-[16px] font-semibold tracking-[-0.035em] text-white">
                        Caso cerrado
                      </p>
                      <p className="mt-2 font-mono text-[6px] text-slate-600">
                        SOL-2026-014 → ENT-2026-014
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-center gap-2">
                    {['7 ETAPAS', '1 HISTORIA', '0 SALTOS'].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 font-mono text-[6px] text-slate-500"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 text-[9px] font-semibold tracking-[0.02em] text-slate-300">
                    De una solicitud a una entrega. Sin perder el hilo.
                  </p>
                </div>
              </div>

              <div className="relative mx-auto mt-2 h-[370px] w-full max-w-[540px] lg:hidden">
                <div className="absolute left-[23px] top-0 bottom-8 w-px bg-white/[0.06]" />
                <div
                  className="absolute left-[23px] top-0 bottom-8 w-px origin-top bg-gradient-to-b from-emerald-300/60 via-cyan-300/70 to-blue-300/35"
                  style={{
                    transform: `scaleY(${Math.max(entryProgress * 0.16, transitProgress)})`,
                  }}
                />

                <div
                  className="space-y-3 pt-3"
                  style={{ opacity: 1 - historyProgress * 0.75 }}
                >
                  {[
                    [
                      'Despachada',
                      'DHL Express · 08 oct 2026',
                      dispatchProgress,
                    ],
                    [
                      'En tránsito',
                      'ENT-2026-014 · LOT-4140-202',
                      transitProgress,
                    ],
                    [
                      'Entrega confirmada',
                      'AeroParts · 16:42',
                      arrivalProgress,
                    ],
                  ].map(([title, detail, progress]) => (
                    <div
                      key={String(title)}
                      className="relative ml-6 pl-5"
                      style={{ opacity: Math.max(0.14, Number(progress)) }}
                    >
                      <span className="absolute left-[-4px] top-[8px] h-[9px] w-[9px] rounded-full border border-cyan-200/40 bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.28)]" />
                      <div className="rounded-xl border border-white/[0.055] bg-white/[0.018] px-3 py-2.5">
                        <p className="text-[8px] font-bold text-slate-200">
                          {title}
                        </p>
                        <p className="mt-1 text-[7px] text-slate-500">
                          {detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="absolute inset-0 grid place-items-center"
                  style={{ opacity: historyProgress * (1 - closeProgress) }}
                >
                  <div className="rounded-[24px] border border-cyan-300/10 bg-[#06131d]/92 px-5 py-5 text-center backdrop-blur-xl">
                    <p className="text-[6px] font-bold uppercase tracking-[0.14em] text-cyan-100/70">
                      Recorrido completo
                    </p>
                    <p className="mt-2 text-[8px] font-semibold text-white">
                      SOL → EXP → COT → OT → PROD → QC → ENT
                    </p>
                    <p className="mt-2 font-mono text-[6px] text-slate-600">
                      7 etapas · una sola historia
                    </p>
                  </div>
                </div>

                <div
                  className="absolute inset-0 grid place-items-center"
                  style={{ opacity: closeProgress }}
                >
                  <div className="rounded-[26px] border border-cyan-300/12 bg-[#06131d]/94 px-6 py-6 text-center shadow-[0_20px_70px_-40px_rgba(34,211,238,0.7)] backdrop-blur-xl">
                    <span className="mx-auto grid h-9 w-9 place-items-center rounded-full border border-emerald-300/18 bg-emerald-300/[0.06] text-emerald-300">
                      ✓
                    </span>
                    <p className="mt-3 text-[7px] font-bold uppercase tracking-[0.15em] text-cyan-100/70">
                      Trazabilidad completa
                    </p>
                    <p className="mt-2 text-[14px] font-semibold text-white">
                      Caso cerrado
                    </p>
                    <p className="mt-2 font-mono text-[6px] text-slate-600">
                      SOL-2026-014 → ENT-2026-014
                    </p>
                  </div>
                </div>

                <div
                  className="pointer-events-none absolute left-1/2 top-0 h-10 w-px -translate-x-1/2 bg-gradient-to-b from-emerald-300/45 to-cyan-300/20"
                  style={{ opacity: entryProgress }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
