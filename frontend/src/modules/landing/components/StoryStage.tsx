import { Link } from 'react-router-dom'
import type { LandingStoryStage } from '../model/landingStory'

interface StoryStageProps {
  stage: LandingStoryStage
  active: boolean
}

const accentClasses = {
  blue: 'text-blue-300 border-blue-400/20 bg-blue-400/10',
  cyan: 'text-cyan-300 border-cyan-400/20 bg-cyan-400/10',
  amber: 'text-amber-300 border-amber-400/20 bg-amber-400/10',
  violet: 'text-violet-300 border-violet-400/20 bg-violet-400/10',
  emerald: 'text-emerald-300 border-emerald-400/20 bg-emerald-400/10',
} as const

export function StoryStage({ stage, active }: StoryStageProps) {
  return (
    <article
      className={`qt-story-copy pointer-events-auto w-full max-w-[620px] !pt-0 ${active ? 'qt-story-copy-active' : ''}`}
      aria-current={active ? 'step' : undefined}
    >
      <div className="flex items-center gap-2.5">
        <span className={`rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.13em] ${accentClasses[stage.accent]}`}>
          {stage.eyebrow}
        </span>
        <span className="text-[9px] font-semibold tracking-[0.18em] text-slate-600">
          {stage.step}
        </span>
      </div>

      <h1
        className={`${stage.hero ? 'mt-5 max-w-[620px] text-[clamp(2.35rem,5.4vw,4.9rem)]' : 'mt-4 text-[clamp(2rem,3.8vw,3.8rem)]'} font-semibold leading-[0.96] tracking-[-0.05em] text-white`}
      >
        {stage.title}
      </h1>

      <p className={`${stage.hero ? 'max-w-xl text-[13px] sm:text-[15px]' : 'max-w-lg text-[12px] sm:text-[13px]'} mt-5 leading-6 text-slate-300/90`}>
        {stage.description}
      </p>

      <div className="mt-5 flex max-w-[500px] items-start gap-3 rounded-2xl border border-white/8 bg-slate-950/55 p-3.5 backdrop-blur-md">
        <span className="mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.75)]" />
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-white">
            {stage.signal}
          </p>
          <p className="mt-1 text-[9px] leading-4 text-slate-400">{stage.detail}</p>
        </div>
      </div>

      {stage.hero ? (
        <div className="mt-7 flex flex-wrap items-center gap-2.5">
          <Link
            to="/login"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-500 px-4 text-[10px] font-bold text-white shadow-[0_18px_50px_-18px_rgba(59,130,246,0.9)] transition hover:bg-blue-400"
          >
            Entrar a QualityTrack
          </Link>
        </div>
      ) : null}
    </article>
  )
}
