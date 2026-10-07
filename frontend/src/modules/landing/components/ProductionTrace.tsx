import { rangeProgress } from '../hooks/usePinnedSectionProgress'

interface ProductionTraceProps {
  entryProgress: number
  qualityProgress: number
}

const entryPath =
  'M 748 0 C 748 72, 714 88, 696 132 C 680 170, 704 194, 706 228'
const qualityExitPath =
  'M 706 690 C 706 780, 670 826, 666 882 C 662 930, 666 968, 666 1000'

export function ProductionTrace({
  entryProgress,
  qualityProgress,
}: ProductionTraceProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[3] hidden lg:block"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1000 1000"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="qtProductionEntry"
            x1="0.748"
            y1="0"
            x2="0.706"
            y2="0.23"
          >
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.38" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.64" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient
            id="qtProductionExit"
            x1="0.706"
            y1="0.69"
            x2="0.666"
            y2="1"
          >
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.74" />
            <stop offset="46%" stopColor="#22d3ee" stopOpacity="0.68" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.36" />
          </linearGradient>
          <filter
            id="qtProductionTraceGlow"
            x="-80%"
            y="-50%"
            width="260%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        <path
          d={entryPath}
          fill="none"
          stroke="url(#qtProductionEntry)"
          strokeWidth="14"
          opacity={entryProgress * 0.11}
          filter="url(#qtProductionTraceGlow)"
        />
        <path
          d={entryPath}
          fill="none"
          pathLength="1"
          stroke="url(#qtProductionEntry)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="1"
          strokeDashoffset={1 - entryProgress}
        />
        <circle
          cx="748"
          cy="0"
          r="3.4"
          fill="#7dd3fc"
          opacity={entryProgress}
        />
        <circle
          cx="706"
          cy="228"
          r="3.7"
          fill="#67e8f9"
          opacity={rangeProgress(entryProgress, 0.68, 1)}
        />

        <path
          d={qualityExitPath}
          fill="none"
          stroke="url(#qtProductionExit)"
          strokeWidth="14"
          opacity={qualityProgress * 0.11}
          filter="url(#qtProductionTraceGlow)"
        />
        <path
          d={qualityExitPath}
          fill="none"
          pathLength="1"
          stroke="url(#qtProductionExit)"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeDasharray="1"
          strokeDashoffset={1 - qualityProgress}
        />
        <circle
          cx="666"
          cy="1000"
          r="3.4"
          fill="#6ee7b7"
          opacity={rangeProgress(qualityProgress, 0.72, 1)}
        />
      </svg>

      <div
        className="absolute left-[66.5%] top-[84%] flex items-center gap-2.5"
        style={{ opacity: rangeProgress(qualityProgress, 0.24, 0.72) }}
      >
        <span className="h-px w-9 bg-gradient-to-r from-sky-300/60 via-cyan-300/50 to-emerald-300/35" />
        <div>
          <p className="font-mono text-[7px] uppercase tracking-[0.15em] text-slate-600">
            Siguiente
          </p>
          <p className="mt-1 text-[9px] font-semibold text-emerald-200/85">
            Calidad
          </p>
        </div>
      </div>
    </div>
  )
}
