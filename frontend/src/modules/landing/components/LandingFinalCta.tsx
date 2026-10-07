import { Link } from 'react-router-dom'

export function LandingFinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#020617] px-5 py-24 text-white sm:px-8 lg:py-32">
      <div className="qt-final-glow pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/70 px-6 py-12 text-center shadow-[0_40px_100px_-50px_rgba(37,99,235,0.55)] backdrop-blur sm:px-10 sm:py-16">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 shadow-[0_0_40px_rgba(59,130,246,0.13)]">
          <img
            src="/brand/qualitytrack-mark-inverse.svg"
            alt=""
            className="h-7 w-7"
          />
        </div>
        <p className="mt-6 text-[8px] font-bold uppercase tracking-[0.19em] text-blue-300">
          QualityTrack
        </p>
        <h2 className="mx-auto mt-3 max-w-4xl text-[clamp(2.4rem,6vw,5.6rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
          Haz visible el trabajo antes de que se vuelva ruido.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-[12px] leading-6 text-slate-400">
          Una plataforma para conectar solicitudes, ejecución, calidad y entrega sin perder el contexto que hace posible cada decisión.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          <Link
            to="/login"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-500 px-5 text-[10px] font-bold text-white shadow-[0_18px_50px_-20px_rgba(59,130,246,0.9)] transition hover:bg-blue-400"
          >
            Iniciar sesión
          </Link>
          <a
            href="#inicio"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-[10px] font-bold text-slate-200 transition hover:bg-white/10"
          >
            Volver al recorrido
          </a>
        </div>
      </div>

      <footer className="relative mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/8 pt-5 text-[8px] text-slate-600 sm:flex-row">
        <span>QualityTrack · Gestión industrial conectada</span>
        <span>Solicitud → Cotización → Operación → Calidad → Entrega</span>
      </footer>
    </section>
  )
}
