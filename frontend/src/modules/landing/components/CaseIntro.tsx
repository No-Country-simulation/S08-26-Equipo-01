import type { LandingStoryStage } from '../model/landingStory'

interface CaseIntroProps {
  stage: LandingStoryStage
  reducedMotion: boolean
  scrollProgress: number
  phase: string
}

export function CaseIntro({
  stage,
  reducedMotion,
  scrollProgress,
  phase,
}: CaseIntroProps) {
  return (
    <div className="order-1 lg:pr-4">
      <div className="flex items-center gap-2.5">
        <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.13em] text-blue-200">
          {stage.eyebrow}
        </span>
        <span className="text-[9px] font-semibold tracking-[0.18em] text-slate-600">
          {stage.step}
        </span>
      </div>

      <h2 className="mt-3 max-w-[590px] text-[clamp(2rem,8.7vw,3.1rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-white lg:mt-4 lg:text-[clamp(2.15rem,4vw,3.9rem)]">
        {stage.title}
      </h2>

      <p className="mt-3 max-w-lg text-[11px] leading-5 text-slate-300/90 sm:text-[12px] lg:mt-5 lg:text-[13px] lg:leading-6">
        {stage.description}
      </p>

      <div className="mt-6 hidden flex-wrap gap-2 lg:flex">
        {['Historial', 'Evidencia', 'Decisiones'].map((item) => (
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
              className="h-full bg-gradient-to-r from-blue-500/30 via-cyan-300/75 to-blue-200/20 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
              style={{ width: `${Math.max(3, scrollProgress * 100)}%` }}
            />
          </div>
          <span className="font-mono text-[7px] text-slate-600">{phase}</span>
        </div>
      ) : null}
    </div>
  )
}
