import { rangeProgress } from '../hooks/usePinnedSectionProgress'

interface DeliveryTraceProps {
  entryProgress: number
}

const entryPath =
  'M 760 0 C 760 72, 727 98, 713 144 C 698 194, 718 219, 716 252'

export function DeliveryTrace({ entryProgress }: DeliveryTraceProps) {
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
            id="qtDeliveryEntry"
            x1="0.76"
            y1="0"
            x2="0.716"
            y2="0.25"
          >
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.38" />
            <stop offset="48%" stopColor="#22d3ee" stopOpacity="0.66" />
            <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.7" />
          </linearGradient>
          <filter
            id="qtDeliveryGlow"
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
          stroke="url(#qtDeliveryEntry)"
          strokeWidth="14"
          opacity={entryProgress * 0.11}
          filter="url(#qtDeliveryGlow)"
        />
        <path
          d={entryPath}
          fill="none"
          pathLength="1"
          stroke="url(#qtDeliveryEntry)"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeDasharray="1"
          strokeDashoffset={1 - entryProgress}
        />
        <circle
          cx="760"
          cy="0"
          r="3.4"
          fill="#67e8f9"
          opacity={entryProgress}
        />
        <circle
          cx="716"
          cy="252"
          r="3.6"
          fill="#a5f3fc"
          opacity={rangeProgress(entryProgress, 0.68, 1)}
        />
      </svg>
    </div>
  )
}
