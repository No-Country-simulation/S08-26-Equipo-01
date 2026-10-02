interface AuthBrandPanelProps {
  immersive?: boolean
}

const benefits = [
  'Trazabilidad de punta a punta',
  'Control de calidad verificable',
  'Operación conectada por expediente',
]

const industrialImage =
  'https://images.unsplash.com/photo-1717386255773-a456c611dc4e?auto=format&fit=crop&fm=jpg&q=85&w=1800'

export function AuthBrandPanel({ immersive = false }: AuthBrandPanelProps) {
  if (immersive) {
    return (
      <aside
        className="relative hidden min-h-screen overflow-hidden bg-slate-950 text-white lg:flex lg:flex-col lg:justify-between"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15, 40, 92, 0.80) 0%, rgba(12, 48, 103, 0.72) 42%, rgba(8, 32, 80, 0.94) 100%), url("${industrialImage}")`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-transparent to-slate-950/25"
        />

        <div className="relative px-10 py-9 xl:px-14 xl:py-10">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/14 ring-1 ring-white/15 backdrop-blur-sm">
              <img
                src="/brand/qualitytrack-mark-inverse.svg"
                alt=""
                className="h-8 w-8"
              />
            </span>
            <span className="text-xl font-bold tracking-tight">
              Quality<span className="text-blue-300">Track</span>
            </span>
          </div>
        </div>

        <div className="relative max-w-[640px] px-10 pb-12 xl:px-14 xl:pb-14">
          <h1 className="max-w-[560px] text-[34px] font-bold leading-[1.16] tracking-tight xl:text-[40px]">
            Trazabilidad completa de tu fabricación
          </h1>
          <p className="mt-5 max-w-[590px] text-[14px] leading-6 text-blue-50/85 xl:text-[15px]">
            Del expediente a la entrega: solicitudes, cotizaciones, producción,
            calidad y seguimiento en una sola plataforma.
          </p>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-medium text-blue-100/80">
            <span>Solicitudes</span>
            <span className="text-blue-300/60">•</span>
            <span>Cotizaciones</span>
            <span className="text-blue-300/60">•</span>
            <span>Producción</span>
            <span className="text-blue-300/60">•</span>
            <span>Calidad</span>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-slate-950 px-9 py-8 text-white lg:flex lg:flex-col lg:justify-between xl:px-11">
      <div
        aria-hidden="true"
        className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center gap-3">
          <img
            src="/brand/qualitytrack-mark-inverse.svg"
            alt=""
            className="h-9 w-9"
          />
          <span className="text-lg font-bold tracking-tight">
            Quality<span className="text-blue-500">Track</span>
          </span>
        </div>
      </div>

      <div className="relative max-w-md">
        <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.16em] text-blue-300">
          Del proceso al resultado
        </p>
        <h1 className="max-w-sm text-[30px] font-bold leading-[1.15] tracking-tight">
          Cada etapa deja una huella clara.
        </h1>
        <p className="mt-4 max-w-sm text-[11px] leading-5 text-slate-300">
          QualityTrack conecta solicitudes, cotizaciones, producción, calidad y
          entrega en un mismo recorrido operativo.
        </p>

        <ul className="mt-6 space-y-2.5">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-center gap-2.5 text-[10px] text-slate-200"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-blue-400"
              />
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-[9px] text-slate-500">
        Control industrial · Expediente 360 · Calidad
      </p>
    </aside>
  )
}
