import type { LandingStoryStage } from '../model/landingStory'

interface StoryProgressProps {
  stages: LandingStoryStage[]
  activeIndex: number
}

export function StoryProgress({ stages, activeIndex }: StoryProgressProps) {
  return (
    <div className="pointer-events-none absolute bottom-7 right-6 top-24 z-20 hidden w-28 flex-col justify-center xl:flex">
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const active = index === activeIndex
          const completed = index < activeIndex

          return (
            <div key={stage.id} className="flex items-center justify-end gap-2.5">
              <span
                className={`max-w-[76px] truncate text-right text-[8px] font-semibold uppercase tracking-[0.1em] transition ${active ? 'text-white' : completed ? 'text-slate-500' : 'text-slate-700'}`}
              >
                {stage.hero ? 'Inicio' : stage.eyebrow}
              </span>
              <span
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${active ? 'scale-125 bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)]' : completed ? 'bg-slate-500' : 'bg-slate-800'}`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
