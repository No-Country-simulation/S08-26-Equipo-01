import { rangeProgress } from '../hooks/usePinnedSectionProgress'

interface CaseTraceProps {
  exitProgress: number
}

const quoteHandoffPath = 'M 950 900 C 956 940, 924 970, 900 1000'

export function CaseTrace({ exitProgress }: CaseTraceProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[4] hidden lg:block"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1000 1000"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="qtCaseQuoteHandoff"
            x1="0.95"
            y1="0.9"
            x2="0.9"
            y2="1"
          >
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.68" />
            <stop offset="52%" stopColor="#22d3ee" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.34" />
          </linearGradient>
          <filter
            id="qtCaseQuoteGlow"
            x="-120%"
            y="-80%"
            width="340%"
            height="260%"
          >
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <path
          d={quoteHandoffPath}
          fill="none"
          stroke="url(#qtCaseQuoteHandoff)"
          strokeWidth="12"
          opacity={exitProgress * 0.09}
          filter="url(#qtCaseQuoteGlow)"
        />
        <path
          d={quoteHandoffPath}
          fill="none"
          pathLength="1"
          stroke="url(#qtCaseQuoteHandoff)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeDasharray="1"
          strokeDashoffset={1 - exitProgress}
        />
        <circle
          cx="900"
          cy="1000"
          r="3.2"
          fill="#93c5fd"
          opacity={rangeProgress(exitProgress, 0.72, 1)}
        />
      </svg>
    </div>
  )
}
