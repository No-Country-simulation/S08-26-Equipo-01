import type { LandingStoryStage } from '../model/landingStory'

interface WorkOrderIntroProps {
  stage: LandingStoryStage
  reducedMotion: boolean
  scrollProgress: number
  phase: string
}

export function WorkOrderIntro({
  stage,
  reducedMotion,
  scrollProgress,
  phase,
}: WorkOrderIntroProps) {
  return (
    <div className="order-1 lg:pr-3">
      <div className="flex items-center gap-2.5">
        <span className="rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.13em] text-violet-200">
          {stage.eyebrow}
        </span>
        <span className="text-[9px] font-semibold tracking-[0.18em] text-slate-600">
          {stage.step}
        </span>
      </div>

      <h2 className="mt-3 max-w-[590px] text-[clamp(2rem,8.7vw,3.15rem)] font-semibold leading-[0.96] tracking-[-0.052em] text-white lg:mt-4 lg:text-[clamp(2.15rem,4vw,3.95rem)]">
        {stage.title}
      </h2>

      <p className="mt-3 max-w-lg text-[11px] leading-5 text-slate-300/90 sm:text-[12px] lg:mt-5 lg:text-[13px] lg:leading-6">
        {stage.description}
      </p>

      <div className="mt-6 hidden flex-wrap gap-2 lg:flex">
        {['Material', 'Máquina', 'Ruta'].map((item) => (
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
              className="h-full bg-gradient-to-r from-violet-400/25 via-violet-300/78 to-sky-300/30 shadow-[0_0_12px_rgba(139,92,246,0.38)]"
              style={{ width: `${Math.max(3, scrollProgress * 100)}%` }}
            />
          </div>
          <span className="font-mono text-[7px] text-slate-600">{phase}</span>
        </div>
      ) : null}
    </div>
  )
}
