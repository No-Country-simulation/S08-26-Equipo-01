import { rangeProgress } from '../hooks/usePinnedSectionProgress'

interface QualityTraceProps {
  entryProgress: number
  exitProgress: number
}

const entryPath =
  'M 666 0 C 666 74, 690 105, 686 154 C 682 205, 648 225, 650 262'
const exitPath =
  'M 688 735 C 730 786, 760 826, 748 880 C 738 925, 756 964, 760 1000'

export function QualityTrace({
  entryProgress,
  exitProgress,
}: QualityTraceProps) {
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
            id="qtQualityEntry"
            x1="0.666"
            y1="0"
            x2="0.65"
            y2="0.27"
          >
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.38" />
            <stop offset="48%" stopColor="#22d3ee" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient
            id="qtQualityExit"
            x1="0.688"
            y1="0.73"
            x2="0.76"
            y2="1"
          >
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.75" />
            <stop offset="58%" stopColor="#22d3ee" stopOpacity="0.58" />
            <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.34" />
          </linearGradient>
          <filter
            id="qtQualityGlow"
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
          stroke="url(#qtQualityEntry)"
          strokeWidth="14"
          opacity={entryProgress * 0.11}
          filter="url(#qtQualityGlow)"
        />
        <path
          d={entryPath}
          fill="none"
          pathLength="1"
          stroke="url(#qtQualityEntry)"
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeDasharray="1"
          strokeDashoffset={1 - entryProgress}
        />
        <circle
          cx="666"
          cy="0"
          r="3.4"
          fill="#6ee7b7"
          opacity={entryProgress}
        />
        <circle
          cx="650"
          cy="262"
          r="3.6"
          fill="#a7f3d0"
          opacity={rangeProgress(entryProgress, 0.68, 1)}
        />

        <path
          d={exitPath}
          fill="none"
          stroke="url(#qtQualityExit)"
          strokeWidth="14"
          opacity={exitProgress * 0.11}
          filter="url(#qtQualityGlow)"
        />
        <path
          d={exitPath}
          fill="none"
          pathLength="1"
          stroke="url(#qtQualityExit)"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeDasharray="1"
          strokeDashoffset={1 - exitProgress}
        />
        <circle
          cx="760"
          cy="1000"
          r="3.4"
          fill="#67e8f9"
          opacity={rangeProgress(exitProgress, 0.72, 1)}
        />
      </svg>

      <div
        className="absolute left-[75.8%] top-[84%] flex items-center gap-2.5"
        style={{ opacity: rangeProgress(exitProgress, 0.24, 0.72) }}
      >
        <span className="h-px w-9 bg-gradient-to-r from-emerald-300/60 via-cyan-300/48 to-cyan-200/28" />
        <div>
          <p className="font-mono text-[7px] uppercase tracking-[0.15em] text-slate-600">
            Siguiente
          </p>
          <p className="mt-1 text-[9px] font-semibold text-cyan-100/85">
            Entrega
          </p>
        </div>
      </div>
    </div>
  )
}
