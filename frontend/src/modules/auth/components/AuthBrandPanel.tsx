interface AuthBrandPanelProps {
  immersive?: boolean
}

export function AuthBrandPanel({ immersive = false }: AuthBrandPanelProps) {
  return (
    <aside className="qt-auth-brand-panel hidden min-h-screen px-9 py-8 text-white lg:flex lg:flex-col lg:justify-between xl:px-12 xl:py-10">
      <a
        href="/"
        className="relative z-10 flex w-fit items-center gap-3 rounded-xl"
        aria-label="Volver a QualityTrack"
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.09] bg-white/[0.035] shadow-[0_14px_40px_-24px_rgba(56,189,248,0.8)] backdrop-blur-xl">
          <img
            src="/brand/qualitytrack-mark-inverse.svg"
            alt=""
            className="h-8 w-8"
          />
        </span>
        <div>
          <p className="text-[17px] font-semibold tracking-[-0.03em] text-white">
            Quality<span className="text-blue-400">Track</span>
          </p>
          <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.16em] text-slate-600">
            Operación conectada
          </p>
        </div>
      </a>

      <div className="relative z-10 max-w-[520px]">
        <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-cyan-200/70">
          Continuidad operativa
        </p>
        <h1
          className={`${
            immersive
              ? 'max-w-[500px] text-[34px] xl:text-[40px]'
              : 'max-w-[420px] text-[30px] xl:text-[34px]'
          } mt-3 font-semibold leading-[1.05] tracking-[-0.045em] text-white`}
        >
          La trazabilidad continúa dentro de tu operación.
        </h1>
        <p className="mt-4 max-w-[470px] text-[11px] leading-5 text-slate-400 xl:text-[12px]">
          Inicia sesión para continuar el mismo recorrido con solicitudes,
          expedientes, producción, calidad y seguimiento en un solo lugar.
        </p>
      </div>

      <p className="relative z-10 text-[8px] font-medium uppercase tracking-[0.12em] text-slate-600">
        QualityTrack · Trazabilidad industrial
      </p>
    </aside>
  )
}
