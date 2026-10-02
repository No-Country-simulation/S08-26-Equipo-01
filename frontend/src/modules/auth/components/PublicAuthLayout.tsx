import type { ReactNode } from 'react'
import { AuthBrandPanel } from './AuthBrandPanel'

interface PublicAuthLayoutProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
  immersive?: boolean
}

export function PublicAuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
  wide = false,
  immersive = false,
}: PublicAuthLayoutProps) {
  if (immersive) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] lg:grid lg:grid-cols-2">
        <AuthBrandPanel immersive />

        <section className="flex min-h-screen items-center justify-center px-6 py-5 sm:px-10 lg:px-12 xl:px-16">
          <div className={wide ? 'w-full max-w-[520px]' : 'w-full max-w-[480px]'}>
            <div className="mb-6 flex items-center gap-2.5 lg:hidden">
              <img
                src="/brand/qualitytrack-mark.svg"
                alt=""
                className="h-9 w-9"
              />
              <span className="text-lg font-bold tracking-tight text-slate-950">
                Quality<span className="text-blue-600">Track</span>
              </span>
            </div>

            <div className="mb-6">
              <h1 className="text-[24px] font-bold tracking-tight text-slate-950 sm:text-[26px]">
                {title}
              </h1>
              <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                {description}
              </p>
            </div>

            {children}

            {footer ? (
              <div className="mt-6 text-center text-[10px] text-slate-500">
                {footer}
              </div>
            ) : null}
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] lg:grid lg:grid-cols-[minmax(340px,0.78fr)_minmax(520px,1.22fr)]">
      <AuthBrandPanel />

      <section className="flex min-h-screen items-center justify-center px-5 py-6 sm:px-8 lg:py-8">
        <div className={wide ? 'w-full max-w-[520px]' : 'w-full max-w-[420px]'}>
          <div className="mb-5 flex items-center gap-2.5 lg:hidden">
            <img
              src="/brand/qualitytrack-mark.svg"
              alt=""
              className="h-9 w-9"
            />
            <span className="text-lg font-bold tracking-tight text-slate-950">
              Quality<span className="text-blue-600">Track</span>
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_52px_-38px_rgba(15,23,42,0.38)]">
            <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-5 py-4 sm:px-6">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                {eyebrow}
              </p>
              <h1 className="mt-1 text-lg font-bold tracking-tight text-slate-950">
                {title}
              </h1>
              <p className="mt-1 text-[10px] leading-4 text-slate-600">
                {description}
              </p>
            </div>

            <div className="px-5 py-5 sm:px-6">{children}</div>
          </div>

          {footer ? (
            <div className="mt-4 text-center text-[9px] text-slate-500">
              {footer}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}
