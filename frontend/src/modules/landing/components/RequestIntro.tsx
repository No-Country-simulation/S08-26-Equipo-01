import type { LandingStoryStage } from '../model/landingStory'

interface RequestIntroProps {
  stage: LandingStoryStage
  reducedMotion: boolean
  scrollProgress: number
  phase: number
}

export function RequestIntro({
  stage,
  reducedMotion,
  scrollProgress,
  phase,
}: RequestIntroProps) {
  return (
    <div className="order-1 lg:order-2 lg:pl-4">
      <div className="flex items-center gap-2.5">
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.13em] text-cyan-300">
          {stage.eyebrow}
        </span>
        <span className="text-[9px] font-semibold tracking-[0.18em] text-slate-600">
          {stage.step}
        </span>
      </div>

      <h2 className="mt-3 max-w-[620px] text-[clamp(2rem,9vw,3.2rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-white lg:mt-4 lg:text-[clamp(2.15rem,4.4vw,4.2rem)] lg:leading-[0.98]">
        {stage.title}
      </h2>

      <p className="mt-3 max-w-lg text-[11px] leading-5 text-slate-300/90 sm:text-[12px] lg:mt-5 lg:text-[13px] lg:leading-6">
        {stage.description}
      </p>

      <div className="mt-6 hidden flex-wrap gap-2 lg:flex">
        {['Requerimientos', 'Documentos', 'Seguimiento'].map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.11em] text-slate-400"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-7 hidden max-w-[500px] items-start gap-3 rounded-2xl border border-cyan-300/10 bg-slate-950/40 p-3.5 backdrop-blur-md lg:flex">
        <span className="mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.7)]" />
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-white">
            {stage.signal}
          </p>
          <p className="mt-1 text-[9px] leading-4 text-slate-400">
            {stage.detail}
          </p>
        </div>
      </div>

      {!reducedMotion ? (
        <div className="mt-3 flex items-center gap-2 lg:mt-7">
          <div className="h-px flex-1 overflow-hidden bg-white/[0.055]">
            <div
              className="h-full bg-gradient-to-r from-blue-500/25 via-cyan-300/80 to-cyan-100/20 shadow-[0_0_12px_rgba(34,211,238,0.45)]"
              style={{ width: `${Math.max(3, scrollProgress * 100)}%` }}
            />
          </div>
          <span className="font-mono text-[7px] text-slate-600">
            {phase === 0
              ? 'Conectando'
              : phase === 1
                ? 'Contexto'
                : phase === 2
                  ? 'Estructurando'
                  : phase === 3
                    ? 'Documentando'
                    : phase === 4
                      ? 'Consolidando'
                      : 'Continuando'}
          </span>
        </div>
      ) : null}
    </div>
  )
}
