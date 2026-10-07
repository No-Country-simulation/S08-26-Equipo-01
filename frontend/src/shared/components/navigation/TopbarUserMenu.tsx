import { useEffect, useRef, useState } from 'react'
import { TopbarActionIcon } from './TopbarActionIcon'

interface TopbarUserMenuProps {
  email: string
  roleLabel: string
  accountLabel: string
  detailLabel?: string
  onProfile?: () => void
  onLogout: () => void
}

function getInitials(email: string): string {
  const localPart = email.split('@')[0] ?? ''
  const normalized = localPart.replace(/[^a-zA-Z0-9]/g, '')
  return normalized.slice(0, 2).toUpperCase() || 'QT'
}

export function TopbarUserMenu({
  email,
  roleLabel,
  accountLabel,
  detailLabel,
  onProfile,
  onLogout,
}: TopbarUserMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="topbar-account-popover"
        className="group flex h-11 items-center gap-2.5 rounded-xl px-1.5 pr-2 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[11px] font-bold text-blue-700 ring-1 ring-inset ring-blue-100 transition group-hover:bg-blue-100">
          {getInitials(email)}
        </span>

        <span className="hidden min-w-0 max-w-[190px] md:block">
          <span className="block truncate text-[11px] font-semibold text-slate-900">
            {email}
          </span>
          <span className="mt-0.5 block truncate text-[9px] font-medium text-slate-500">
            {roleLabel}
          </span>
        </span>

        <TopbarActionIcon
          name="chevron-down"
          className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-slate-600"
        />
      </button>

      {open ? (
        <div
          id="topbar-account-popover"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)]"
        >
          <div className="border-b border-slate-100 px-4 py-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {accountLabel}
            </p>
            <p className="mt-2 truncate text-xs font-semibold text-slate-950">
              {email}
            </p>
            <p className="mt-1 text-[10px] font-medium text-slate-600">
              {roleLabel}
              {detailLabel ? ` · ${detailLabel}` : ''}
            </p>
          </div>

          <div className="p-2">
            {onProfile ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onProfile()
                }}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:bg-blue-50 focus-visible:text-blue-700"
              >
                <TopbarActionIcon name="user" className="h-[18px] w-[18px]" />
                Mi perfil
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onLogout()
              }}
              className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:bg-red-50 focus-visible:text-red-700"
            >
              <TopbarActionIcon name="logout" className="h-[18px] w-[18px]" />
              Cerrar sesión
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
