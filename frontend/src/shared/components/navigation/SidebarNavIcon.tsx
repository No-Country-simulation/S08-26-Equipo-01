import type { ReactNode } from 'react'

export type SidebarNavIconName =
  | 'panel'
  | 'customers'
  | 'cases'
  | 'quotations'
  | 'work-orders'
  | 'production'
  | 'quality'
  | 'deliveries'
  | 'documents'
  | 'machines'
  | 'materials'
  | 'users'
  | 'requests'
  | 'members'
  | 'company'

interface SidebarNavIconProps {
  name: SidebarNavIconName
  className?: string
}

export function SidebarNavIcon({
  name,
  className = 'h-[18px] w-[18px]',
}: SidebarNavIconProps) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  const paths: Record<SidebarNavIconName, ReactNode> = {
    panel: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    customers: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    cases: (
      <>
        <path d="M4 7h5l2 2h9v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
        <path d="M7 13v4M11 14v3M15 12v5" />
      </>
    ),
    quotations: (
      <>
        <path d="M6 2h8l4 4v16H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
        <path d="M14 2v5h5M8 12h8M8 16h6" />
      </>
    ),
    'work-orders': (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4" />
      </>
    ),
    production: (
      <>
        <path d="M3 21h18M5 21V10l5 3V9l5 3V5l4 2v14" />
        <path d="M8 17h1M12 17h1M16 17h1" />
      </>
    ),
    quality: (
      <>
        <path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    deliveries: (
      <>
        <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </>
    ),
    documents: (
      <>
        <path d="M6 2h8l4 4v16H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
        <path d="M14 2v5h5M8 12h8M8 16h8" />
      </>
    ),
    machines: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.2 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2.4v-4h.1A1.7 1.7 0 0 0 4.2 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.6 4.2a1.7 1.7 0 0 0 1-.6A1.7 1.7 0 0 0 10 2.5v-.1h4v.1A1.7 1.7 0 0 0 15 4.2a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 8.6a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.1v4h-.1a1.7 1.7 0 0 0-1.7 1Z" />
      </>
    ),
    materials: (
      <>
        <path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z" />
        <path d="m4 6.5 8 4.5 8-4.5M12 11v9" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M3 20v-1.5A4.5 4.5 0 0 1 7.5 14h3" />
        <circle cx="17" cy="16" r="2.5" />
        <path d="M17 12.5v1M17 18.5v1M13.5 16h1M19.5 16h1" />
      </>
    ),
    requests: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>
    ),
    members: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M3 20v-1a5 5 0 0 1 10 0v1M14 20v-1a4 4 0 0 1 7-2.7" />
      </>
    ),
    company: (
      <>
        <path d="M4 21V5l8-3v19M12 8h8v13M7 7h2M7 11h2M7 15h2M15 12h2M15 16h2" />
      </>
    ),
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      {...common}
    >
      {paths[name]}
    </svg>
  )
}
