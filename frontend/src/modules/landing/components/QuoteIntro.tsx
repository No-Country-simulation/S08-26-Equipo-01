import type { LandingStoryStage } from '../model/landingStory'

interface QuoteIntroProps {
  stage: LandingStoryStage
  reducedMotion: boolean
  scrollProgress: number
  phase: string
}

export function QuoteIntro({
  stage,
  reducedMotion,
  scrollProgress,
  phase,
}: QuoteIntroProps) {
  return (
    <div className="order-1 lg:order-2 lg:pl-2">
      <div className="flex items-center gap-2.5">
        <span className="rounded-full border border-amber-400/20 bg-amber-400/[0.08] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.13em] text-amber-200">
          {stage.eyebrow}
        </span>
        <span className="text-[9px] font-semibold tracking-[0.18em] text-slate-600">
          {stage.step}
        </span>
      </div>

      <h2 className="mt-3 max-w-[600px] text-[clamp(2rem,8.7vw,3.15rem)] font-semibold leading-[0.96] tracking-[-0.052em] text-white lg:mt-4 lg:text-[clamp(2.15rem,4vw,3.95rem)]">
        {stage.title}
      </h2>

      <p className="mt-3 max-w-lg text-[11px] leading-5 text-slate-300/90 sm:text-[12px] lg:mt-5 lg:text-[13px] lg:leading-6">
        {stage.description}
      </p>

      <div className="mt-6 hidden flex-wrap gap-2 lg:flex">
        {['V1', 'Revisión breve', 'V2 aprobada'].map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.11em] text-slate-400"
          >
            {item}
          </span>
        ))}
      </div>

      {!reducedMotion ? (
        <div className="mt-3 flex items-center gap-2 lg:mt-7">
          <div className="h-px flex-1 overflow-hidden bg-white/[0.055]">
            <div
              className="h-full bg-gradient-to-r from-cyan-400/20 via-amber-300/78 to-violet-300/24 shadow-[0_0_12px_rgba(251,191,36,0.34)]"
              style={{ width: `${Math.max(3, scrollProgress * 100)}%` }}
            />
          </div>
          <span className="font-mono text-[7px] text-slate-600">{phase}</span>
        </div>
      ) : null}
    </div>
  )
}
