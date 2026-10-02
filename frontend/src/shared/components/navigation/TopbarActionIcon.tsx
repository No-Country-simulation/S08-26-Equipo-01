interface TopbarActionIconProps {
  name: 'menu' | 'logout' | 'search' | 'chevron-down'
  className?: string
}

export function TopbarActionIcon({
  name,
  className = 'h-[18px] w-[18px]',
}: TopbarActionIconProps) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      {...common}
    >
      {name === 'menu' ? (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </>
      ) : null}

      {name === 'logout' ? (
        <>
          <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
          <path d="m14 8 4 4-4 4M18 12H9" />
        </>
      ) : null}

      {name === 'search' ? (
        <>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </>
      ) : null}

      {name === 'chevron-down' ? <path d="m7 9.5 5 5 5-5" /> : null}
    </svg>
  )
}
