import { Link } from 'react-router-dom'
import '../finalCta.css'

const footerLinks = [
  ['Solicitud', '#solicitud'],
  ['Expediente', '#expediente'],
  ['Cotización', '#cotizacion'],
  ['Orden de trabajo', '#orden-trabajo'],
  ['Producción', '#produccion'],
  ['Calidad', '#calidad'],
  ['Entrega', '#entrega'],
] as const

export function FinalCta() {
  return (
    <section className="qt-final-section relative isolate overflow-hidden bg-[#020617]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(34,211,238,0.09),transparent_27%),radial-gradient(circle_at_50%_44%,rgba(59,130,246,0.07),transparent_34%),linear-gradient(180deg,#020617_0%,#040a15_52%,#020617_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] [background-size:78px_78px] [mask-image:radial-gradient(circle_at_50%_28%,black,transparent_70%)]" />

      <div className="relative mx-auto flex min-h-[74svh] w-full max-w-[1200px] flex-col px-5 sm:px-8 lg:min-h-[78svh] lg:px-12 xl:px-16">
        <div className="flex flex-1 items-center justify-center py-16 text-center lg:py-20">
          <div className="w-full max-w-[760px]">
            <div className="qt-final-terminal mx-auto mb-7 grid h-12 w-12 place-items-center rounded-full border border-cyan-200/14 bg-cyan-300/[0.035] shadow-[0_0_45px_rgba(34,211,238,0.08)]">
              <span className="grid h-6 w-6 place-items-center rounded-full border border-emerald-300/18 bg-emerald-300/[0.06] text-[10px] font-bold text-emerald-300">
                ✓
              </span>
            </div>

            <div className="flex items-center justify-center gap-2.5">
              <span className="h-px w-7 bg-gradient-to-r from-transparent to-cyan-300/35" />
              <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-cyan-100/65">
                El hilo está completo
              </span>
              <span className="h-px w-7 bg-gradient-to-l from-transparent to-cyan-300/35" />
            </div>

            <h2 className="mt-5 text-[clamp(2.35rem,8vw,4.85rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-white">
              Conecta tu operación de principio a fin.
            </h2>

            <p className="mx-auto mt-5 max-w-[620px] text-[12px] leading-6 text-slate-400 sm:text-[13px] lg:text-[14px] lg:leading-7">
              Una solicitud, una historia operativa y la evidencia necesaria
              para saber qué pasó, qué sigue y cómo llegó cada pieza hasta su
              destino.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/login"
                className="qt-final-primary inline-flex h-11 min-w-[178px] items-center justify-center rounded-xl border border-blue-300/20 bg-blue-500 px-5 text-[10px] font-bold text-white shadow-[0_16px_45px_-22px_rgba(59,130,246,0.95)] transition hover:bg-blue-400"
              >
                Ver plataforma
                <span className="ml-2 text-[13px]" aria-hidden="true">
                  ↗
                </span>
              </Link>

              <a
                href="#inicio"
                className="inline-flex h-11 min-w-[178px] items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 text-[10px] font-bold text-slate-300 transition hover:border-white/[0.14] hover:bg-white/[0.045] hover:text-white"
              >
                Recorrer de nuevo
                <span
                  className="ml-2 text-[12px] text-slate-500"
                  aria-hidden="true"
                >
                  ↑
                </span>
              </a>
            </div>

            <div className="mx-auto mt-10 flex max-w-[560px] items-center justify-center gap-2 sm:gap-3">
              {['Solicitud', 'Producción', 'Calidad', 'Entrega'].map(
                (item, index) => (
                  <div key={item} className="contents">
                    {index > 0 ? (
                      <span className="h-px w-5 bg-white/[0.07] sm:w-8" />
                    ) : null}
                    <span className="whitespace-nowrap font-mono text-[6px] uppercase tracking-[0.11em] text-slate-700 sm:text-[7px]">
                      {item}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        <footer className="border-t border-white/[0.055] py-7 lg:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <a
              href="#inicio"
              className="flex w-fit items-center gap-2.5 rounded-xl py-1"
            >
              <img
                src="/brand/qualitytrack-mark-inverse.svg"
                alt=""
                className="h-8 w-8"
              />
              <div className="leading-none">
                <p className="text-[13px] font-semibold tracking-[-0.02em] text-white">
                  Quality<span className="text-blue-400">Track</span>
                </p>
                <p className="mt-1 text-[7px] font-medium uppercase tracking-[0.15em] text-slate-600">
                  Industrial workflow
                </p>
              </div>
            </a>

            <nav
              aria-label="Flujo QualityTrack"
              className="flex flex-wrap gap-x-4 gap-y-2 lg:justify-center"
            >
              {footerLinks.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="text-[8px] font-semibold text-slate-600 transition hover:text-slate-300"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3 text-[7px] text-slate-700 lg:justify-end">
              <span>QualityTrack · 2026</span>
              <span className="h-1 w-1 rounded-full bg-slate-800" />
              <span>Trazabilidad industrial</span>
            </div>
          </div>
        </footer>
      </div>
    </section>
  )
}
