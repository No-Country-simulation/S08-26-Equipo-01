interface QuoteReviewBadgeProps {
  reviewProgress: number
  versionProgress: number
  approvalProgress: number
}

export function QuoteReviewBadge({
  reviewProgress,
  versionProgress,
  approvalProgress,
}: QuoteReviewBadgeProps) {
  return (
    <div
      className="pointer-events-none absolute left-[12%] top-[8%] z-[6] hidden rounded-xl border border-amber-200/[0.1] bg-[#0d1117]/92 px-3 py-2.5 shadow-[0_20px_65px_-36px_rgba(245,158,11,0.65)] backdrop-blur-xl lg:block"
      style={{
        opacity: reviewProgress * (1 - approvalProgress),
        transform: `translate3d(${(1 - reviewProgress) * -12}px, ${versionProgress * -7}px, 0)`,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_9px_rgba(252,211,77,0.65)]" />
        <span className="text-[6px] font-bold uppercase tracking-[0.12em] text-amber-200/70">
          Revisión comercial
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 font-mono text-[8px]">
        <span className="text-slate-600 line-through">18 OCT</span>
        <span className="text-slate-700">→</span>
        <span className="font-semibold text-amber-200">08 OCT</span>
      </div>
    </div>
  )
}
