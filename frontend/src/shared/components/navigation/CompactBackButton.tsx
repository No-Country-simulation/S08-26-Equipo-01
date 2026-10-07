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
      className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md bg-transparent px-1.5 text-[9px] font-medium leading-none text-slate-500 transition hover:bg-slate-100/70 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50 sm:h-7 sm:text-[8px]"
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
