import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AuthBrandPanel } from './AuthBrandPanel'
import '../authVisual.css'

interface PublicAuthLayoutProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
  immersive?: boolean
  lockViewport?: boolean
}

export function PublicAuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
  wide = false,
  immersive = false,
  lockViewport = false,
}: PublicAuthLayoutProps) {
  const widthClass = wide ? 'w-full max-w-[520px]' : 'w-full max-w-[460px]'

  return (
    <main
      className={`qt-auth-root min-h-screen lg:grid ${
        lockViewport ? 'qt-auth-root--locked' : ''
      } ${
        immersive
          ? 'lg:grid-cols-[minmax(340px,0.82fr)_minmax(520px,1.18fr)]'
          : 'lg:grid-cols-[minmax(340px,0.78fr)_minmax(520px,1.22fr)]'
      }`}
    >
      <AuthBrandPanel immersive={immersive} />

      <section className="qt-auth-form-stage flex min-h-screen items-center justify-center px-5 py-6 sm:px-8 lg:px-12 lg:py-8 xl:px-16">
        <div className={widthClass}>
          <div className="mb-4 flex items-center justify-between gap-3 lg:mb-5">
            <Link
              to="/"
              className="flex w-fit items-center gap-2.5 rounded-xl py-1 lg:hidden"
              aria-label="Volver a la página principal"
            >
              <img
                src="/brand/qualitytrack-mark-inverse.svg"
                alt=""
                className="h-9 w-9"
              />
              <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">
                Quality<span className="text-blue-400">Track</span>
              </span>
            </Link>

            <Link
              to="/"
              className="qt-auth-back-link inline-flex h-8 shrink-0 items-center gap-2 rounded-lg px-3 text-[8px] font-bold uppercase tracking-[0.09em]"
            >
              <span aria-hidden="true">←</span>
              <span className="sm:hidden">Volver</span>
              <span className="hidden sm:inline">Volver a la página principal</span>
            </Link>
          </div>

          <div className="qt-auth-form-card rounded-[26px] px-5 py-5 sm:px-6 sm:py-6">
            <div className="mb-5">
              <p className="qt-auth-eyebrow text-[8px] font-bold uppercase tracking-[0.15em]">
                {eyebrow}
              </p>
              <h1 className="mt-1.5 text-[23px] font-bold tracking-[-0.035em] text-slate-950 sm:text-[25px]">
                {title}
              </h1>
              <p className="mt-1.5 max-w-lg text-[10px] leading-4.5 text-slate-500 sm:text-[11px] sm:leading-5">
                {description}
              </p>
            </div>

            {children}
          </div>

          {footer ? (
            <div className="qt-auth-footer mt-4 text-center text-[9px]">
              {footer}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}
