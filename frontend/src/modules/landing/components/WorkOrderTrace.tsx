import { rangeProgress } from '../hooks/usePinnedSectionProgress'

interface WorkOrderTraceProps {
  entryProgress: number
  exitProgress: number
}

const entryPath =
  'M 340 0 C 342 70, 420 88, 492 126 C 560 162, 575 180, 624 202'
const exitPath =
  'M 720 760 C 722 835, 760 875, 748 924 C 740 956, 748 978, 748 1000'

export function WorkOrderTrace({
  entryProgress,
  exitProgress,
}: WorkOrderTraceProps) {
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
          <linearGradient id="qtWorkEntry" x1="0.34" y1="0" x2="0.62" y2="0.2">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.48" />
            <stop offset="46%" stopColor="#a78bfa" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="qtWorkExit" x1="0.72" y1="0.76" x2="0.75" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.72" />
            <stop offset="62%" stopColor="#60a5fa" stopOpacity="0.52" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.28" />
          </linearGradient>
          <filter id="qtWorkGlow" x="-80%" y="-60%" width="260%" height="220%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        <path
          d={entryPath}
          fill="none"
          stroke="url(#qtWorkEntry)"
          strokeWidth="13"
          opacity={entryProgress * 0.1}
          filter="url(#qtWorkGlow)"
        />
        <path
          d={entryPath}
          fill="none"
          pathLength="1"
          stroke="url(#qtWorkEntry)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="1"
          strokeDashoffset={1 - entryProgress}
        />
        <circle
          cx="340"
          cy="0"
          r="3.2"
          fill="#a78bfa"
          opacity={entryProgress}
        />
        <circle
          cx="624"
          cy="202"
          r="3.5"
          fill="#ddd6fe"
          opacity={rangeProgress(entryProgress, 0.68, 1)}
        />

        <path
          d={exitPath}
          fill="none"
          stroke="url(#qtWorkExit)"
          strokeWidth="13"
          opacity={exitProgress * 0.11}
          filter="url(#qtWorkGlow)"
        />
        <path
          d={exitPath}
          fill="none"
          pathLength="1"
          stroke="url(#qtWorkExit)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="1"
          strokeDashoffset={1 - exitProgress}
        />
        <circle
          cx="748"
          cy="1000"
          r="3.3"
          fill="#7dd3fc"
          opacity={rangeProgress(exitProgress, 0.72, 1)}
        />
      </svg>

      <div
        className="absolute left-[75%] top-[84%] flex items-center gap-2.5"
        style={{ opacity: rangeProgress(exitProgress, 0.25, 0.72) }}
      >
        <span className="h-px w-8 bg-gradient-to-r from-violet-300/55 to-sky-300/35" />
        <div>
          <p className="font-mono text-[7px] uppercase tracking-[0.15em] text-slate-600">
            Siguiente
          </p>
          <p className="mt-1 text-[9px] font-semibold text-sky-200/85">
            Producción
          </p>
        </div>
      </div>
    </div>
  )
}
