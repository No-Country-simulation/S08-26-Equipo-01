import { rangeProgress } from '../hooks/usePinnedSectionProgress'

interface RequestTraceProps {
  reducedMotion: boolean
  scrollProgress: number
  linkProgress: number
  exitProgress: number
}

const requestTracePath =
  'M 343 0 C 326 27, 311 61, 329 96 C 352 137, 365 174, 328 206 C 294 236, 245 253, 202 284'
const requestHandoffPath =
  'M 286 505 C 281 588, 190 635, 205 720 C 219 800, 278 858, 250 1000'

export function RequestTrace({
  reducedMotion,
  scrollProgress,
  linkProgress,
  exitProgress,
}: RequestTraceProps) {
  const handoffLabelProgress = reducedMotion
    ? 1
    : rangeProgress(exitProgress, 0.34, 0.72)

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-[3] hidden lg:block"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1000 430"
          className="absolute left-0 top-0 h-[48%] w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="qtRequestTrace"
              x1="0.343"
              y1="0"
              x2="0.2"
              y2="0.7"
            >
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.22" />
              <stop offset="22%" stopColor="#22d3ee" stopOpacity="0.62" />
              <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.48" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
            </linearGradient>
            <filter
              id="qtRequestTraceGlow"
              x="-60%"
              y="-60%"
              width="220%"
              height="220%"
            >
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <filter
              id="qtRequestTravelerGlow"
              x="-200%"
              y="-200%"
              width="500%"
              height="500%"
            >
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          <path
            d={requestTracePath}
            fill="none"
            stroke="url(#qtRequestTrace)"
            strokeWidth="12"
            opacity={0.04 + linkProgress * 0.13}
            filter="url(#qtRequestTraceGlow)"
          />
          <path
            d={requestTracePath}
            fill="none"
            stroke="url(#qtRequestTrace)"
            strokeWidth="1.5"
            strokeDasharray="8 10"
            opacity={0.15 + linkProgress * 0.8}
          >
            {!reducedMotion && scrollProgress < 0.99 ? (
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="180"
                dur="7s"
                repeatCount="indefinite"
              />
            ) : null}
          </path>

          {!reducedMotion && linkProgress > 0 && scrollProgress < 0.81 ? (
            <>
              <circle
                r="10"
                fill="#67e8f9"
                opacity={0.16 * linkProgress}
                filter="url(#qtRequestTravelerGlow)"
              >
                <animateMotion
                  dur="5.2s"
                  repeatCount="indefinite"
                  path={requestTracePath}
                />
              </circle>
              <circle r="3.5" fill="#a5f3fc" opacity={0.95 * linkProgress}>
                <animateMotion
                  dur="5.2s"
                  repeatCount="indefinite"
                  path={requestTracePath}
                />
              </circle>
            </>
          ) : null}
        </svg>
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[7] hidden lg:block"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1000 1000"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="qtRequestHandoff"
              x1="0.28"
              y1="0.5"
              x2="0.25"
              y2="1"
            >
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.52" />
              <stop offset="24%" stopColor="#22d3ee" stopOpacity="0.76" />
              <stop offset="68%" stopColor="#60a5fa" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.22" />
            </linearGradient>
            <filter
              id="qtRequestHandoffGlow"
              x="-80%"
              y="-30%"
              width="260%"
              height="180%"
            >
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>

          <path
            d={requestHandoffPath}
            fill="none"
            stroke="url(#qtRequestHandoff)"
            strokeWidth="13"
            opacity={exitProgress * 0.11}
            filter="url(#qtRequestHandoffGlow)"
          />
          <path
            d={requestHandoffPath}
            fill="none"
            pathLength="1"
            stroke="url(#qtRequestHandoff)"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeDasharray={`${Math.max(0.001, exitProgress)} 1`}
            opacity={0.25 + exitProgress * 0.75}
          />
          <circle
            cx="286"
            cy="505"
            r="3.5"
            fill="#6ee7b7"
            opacity={exitProgress}
          />
          <circle
            cx="250"
            cy="1000"
            r="3.4"
            fill="#93c5fd"
            opacity={rangeProgress(exitProgress, 0.72, 1)}
          />
        </svg>

        <div
          className="absolute left-[15.5%] top-[76%] flex items-center gap-2.5"
          style={{
            opacity: handoffLabelProgress,
            transform: `translate3d(0, ${(1 - handoffLabelProgress) * 10}px, 0)`,
          }}
        >
          <span className="h-px w-9 bg-gradient-to-r from-transparent to-cyan-300/50" />
          <div>
            <p className="font-mono text-[7px] uppercase tracking-[0.16em] text-slate-600">
              Siguiente
            </p>
            <p className="mt-1 text-[9px] font-semibold tracking-[0.03em] text-blue-200/80">
              Expediente 360
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
