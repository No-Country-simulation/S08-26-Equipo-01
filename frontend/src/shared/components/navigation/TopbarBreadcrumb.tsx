import { Fragment } from 'react'

interface TopbarBreadcrumbProps {
  value: string
}

export function TopbarBreadcrumb({ value }: TopbarBreadcrumbProps) {
  const parts = value.split(' / ')

  return (
    <nav aria-label="Ruta actual" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-[11px]">
        {parts.map((part, index) => {
          const current = index === parts.length - 1

          return (
            <Fragment key={`${part}-${index}`}>
              {index > 0 ? (
                <li aria-hidden="true" className="text-slate-300">
                  /
                </li>
              ) : null}
              <li
                className={
                  current
                    ? 'truncate font-semibold text-slate-800'
                    : 'shrink-0 font-medium text-slate-400'
                }
                aria-current={current ? 'page' : undefined}
              >
                {part}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
