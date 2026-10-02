interface CompactBackButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export function CompactBackButton({
  label,
  onClick,
  disabled = false,
}: CompactBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-6 shrink-0 items-center gap-1 rounded-md border border-slate-300 bg-white/85 px-2 text-[7px] font-medium leading-none text-slate-500 transition hover:border-slate-400 hover:bg-white hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-3 w-3 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      <span>{label}</span>
    </button>
  )
}
