import type { CSSProperties } from 'react'
import type { LandingStoryStage } from '../model/landingStory'

interface ProductionIntroProps {
  stage: LandingStoryStage
  reducedMotion: boolean
  scrollProgress: number
  phase: string
  reveal: (start: number, end: number, distance?: number) => CSSProperties
}

export function ProductionIntro({
  stage,
  reducedMotion,
  scrollProgress,
  phase,
  reveal,
}: ProductionIntroProps) {
  return (
    <div className="order-1 lg:pr-4">
      <div className="flex items-center gap-2.5">
        <span className="rounded-full border border-sky-400/20 bg-sky-400/[0.08] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.13em] text-sky-200">
          {stage.eyebrow}
        </span>
        <span className="text-[9px] font-semibold tracking-[0.18em] text-slate-600">
          {stage.step}
        </span>
      </div>

      <h2 className="mt-3 max-w-[560px] text-[clamp(2rem,8.7vw,3.15rem)] font-semibold leading-[0.96] tracking-[-0.052em] text-white lg:mt-4 lg:text-[clamp(2.15rem,3.8vw,3.85rem)]">
        {stage.title}
      </h2>

      <p className="mt-3 max-w-lg text-[11px] leading-5 text-slate-300/90 sm:text-[12px] lg:mt-5 lg:text-[13px] lg:leading-6">
        {stage.description}
      </p>

      <div className="mt-6 hidden flex-wrap gap-2 lg:flex">
        {['Lote trazable', 'Ejecución secuencial', 'Avance real'].map(
          (item) => (
            <span
              key={item}
              className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.11em] text-slate-400"
            >
              {item}
            </span>
          ),
        )}
      </div>

      <div
        className="mt-7 hidden max-w-[470px] items-center gap-3 lg:flex"
        style={reveal(0.1, 0.2, 8)}
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-300 opacity-25" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-300" />
        </span>
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-sky-200/80">
            OT-2026-014 · LOT-4140-202
          </p>
          <p className="mt-1 text-[8px] text-slate-500">
            La misma pieza avanza. La historia no se reinicia.
          </p>
        </div>
      </div>

      {!reducedMotion ? (
        <div className="mt-3 flex items-center gap-2 lg:mt-7">
          <div className="h-px flex-1 overflow-hidden bg-white/[0.055]">
            <div
              className="h-full bg-gradient-to-r from-violet-400/20 via-sky-300/80 to-emerald-300/28 shadow-[0_0_12px_rgba(56,189,248,0.42)]"
              style={{ width: `${Math.max(3, scrollProgress * 100)}%` }}
            />
          </div>
          <span className="font-mono text-[7px] text-slate-600">{phase}</span>
        </div>
      ) : null}
    </div>
  )
}
