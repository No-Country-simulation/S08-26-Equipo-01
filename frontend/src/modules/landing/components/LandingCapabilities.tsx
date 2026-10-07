import { operationalCapabilities } from '../model/landingStory'

export function LandingCapabilities() {
  return (
    <section id="capacidades" className="relative overflow-hidden bg-[#f5f7fb] px-5 py-24 sm:px-8 lg:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#020617] via-slate-900/10 to-transparent" />
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Una sola operación
            </p>
            <h2 className="mt-3 max-w-xl text-[clamp(2.3rem,5vw,4.8rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-slate-950">
              Distintas áreas. Un mismo hilo de trabajo.
            </h2>
          </div>
          <p className="max-w-2xl text-[13px] leading-6 text-slate-500 lg:justify-self-end">
            QualityTrack no reemplaza el proceso con una colección de pantallas. Conecta la información que cada etapa necesita y conserva el contexto cuando el trabajo cambia de manos.
          </p>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {operationalCapabilities.map((capability) => (
            <article
              key={capability.title}
              className="qt-capability-card group relative min-h-[190px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.55)]"
            >
              <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-blue-50 transition duration-500 group-hover:scale-150 group-hover:bg-blue-100/80" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 px-2 text-[9px] font-black tracking-[-0.02em] text-blue-600">
                    {capability.glyph}
                  </span>
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-200 transition group-hover:bg-blue-500 group-hover:shadow-[0_0_14px_rgba(59,130,246,0.7)]" />
                </div>
                <p className="mt-7 text-[8px] font-bold uppercase tracking-[0.13em] text-slate-400">
                  {capability.eyebrow}
                </p>
                <h3 className="mt-1 text-[15px] font-semibold tracking-[-0.02em] text-slate-950">
                  {capability.title}
                </h3>
                <p className="mt-2 text-[10px] leading-5 text-slate-500">
                  {capability.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 px-5 py-6 text-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.8)] sm:px-8 sm:py-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-blue-300">
                Trazabilidad transversal
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                El expediente recuerda lo que la operación ya vivió.
              </h3>
            </div>
            <div className="relative">
              <div className="absolute left-3 right-3 top-[17px] h-px bg-gradient-to-r from-blue-500/10 via-blue-400/70 to-emerald-400/20" />
              <div className="relative grid grid-cols-4 gap-2 sm:grid-cols-7">
                {['Solicitud', 'Revisión', 'Cotización', 'OT', 'Producción', 'Calidad', 'Entrega'].map((label, index) => (
                  <div key={label} className={`${index > 3 ? 'hidden sm:block' : ''}`}>
                    <span className={`mx-auto block h-2.5 w-2.5 rounded-full ${index === 6 ? 'bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.65)]' : 'bg-blue-400'}`} />
                    <p className="mt-3 text-center text-[8px] font-semibold text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
