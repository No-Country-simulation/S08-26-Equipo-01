import { rangeProgress } from '../hooks/usePinnedSectionProgress'

interface QuoteTraceProps {
  entryProgress: number
  exitProgress: number
}

const quoteEntryPath =
  'M 900 0 C 895 72, 808 86, 728 126 C 640 169, 575 205, 458 232'
const quoteExitPath =
  'M 360 715 C 360 794, 315 842, 337 890 C 354 928, 337 963, 340 1000'

export function QuoteTrace({ entryProgress, exitProgress }: QuoteTraceProps) {
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
          <linearGradient id="qtQuoteEntry" x1="0.9" y1="0" x2="0.46" y2="0.24">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.42" />
            <stop offset="42%" stopColor="#22d3ee" stopOpacity="0.66" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.72" />
          </linearGradient>
          <linearGradient id="qtQuoteExit" x1="0.36" y1="0.71" x2="0.34" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.82" />
            <stop offset="48%" stopColor="#c4b5fd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.34" />
          </linearGradient>
          <filter
            id="qtQuoteTraceGlow"
            x="-80%"
            y="-50%"
            width="260%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        <path
          d={quoteEntryPath}
          fill="none"
          stroke="url(#qtQuoteEntry)"
          strokeWidth="13"
          opacity={entryProgress * 0.1}
          filter="url(#qtQuoteTraceGlow)"
        />
        <path
          d={quoteEntryPath}
          fill="none"
          pathLength="1"
          stroke="url(#qtQuoteEntry)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeDasharray="1"
          strokeDashoffset={1 - entryProgress}
        />
        <circle
          cx="900"
          cy="0"
          r="3.1"
          fill="#93c5fd"
          opacity={entryProgress}
        />
        <circle
          cx="458"
          cy="232"
          r="3.6"
          fill="#fcd34d"
          opacity={rangeProgress(entryProgress, 0.7, 1)}
        />

        <path
          d={quoteExitPath}
          fill="none"
          stroke="url(#qtQuoteExit)"
          strokeWidth="13"
          opacity={exitProgress * 0.11}
          filter="url(#qtQuoteTraceGlow)"
        />
        <path
          d={quoteExitPath}
          fill="none"
          pathLength="1"
          stroke="url(#qtQuoteExit)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="1"
          strokeDashoffset={1 - exitProgress}
        />
        <circle
          cx="340"
          cy="1000"
          r="3.3"
          fill="#a78bfa"
          opacity={rangeProgress(exitProgress, 0.74, 1)}
        />
      </svg>

      <div
        className="absolute left-[36%] top-[82%] flex items-center gap-2.5"
        style={{
          opacity: rangeProgress(exitProgress, 0.28, 0.74),
          transform: `translate3d(0, ${(1 - exitProgress) * 9}px, 0)`,
        }}
      >
        <span className="h-px w-8 bg-gradient-to-r from-amber-300/55 to-violet-300/35" />
        <div>
          <p className="font-mono text-[7px] uppercase tracking-[0.15em] text-slate-600">
            Siguiente
          </p>
          <p className="mt-1 text-[9px] font-semibold text-violet-200/85">
            Orden de trabajo
          </p>
        </div>
      </div>
    </div>
  )
}
