const clientJourney = [
  'Crear y documentar solicitudes',
  'Revisar cotizaciones y ajustes',
  'Consultar avances sin perseguir respuestas',
  'Mantener empresa, miembros y entregas en contexto',
]

const internalJourney = [
  'Convertir casos aprobados en trabajo ejecutable',
  'Coordinar ruta, máquinas, lotes y materiales',
  'Registrar producción e inspecciones de calidad',
  'Cerrar entregas con evidencia y trazabilidad',
]

function AudienceCard({
  eyebrow,
  title,
  description,
  items,
  tone,
}: {
  eyebrow: string
  title: string
  description: string
  items: string[]
  tone: 'blue' | 'emerald'
}) {
  const accent = tone === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'
  const wash = tone === 'blue' ? 'from-blue-50' : 'from-emerald-50'

  return (
    <article className={`relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br ${wash} via-white to-white p-6 shadow-[0_28px_70px_-54px_rgba(15,23,42,0.65)] sm:p-8`}>
      <div className={`absolute left-0 top-0 h-1 w-full ${accent}`} />
      <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-slate-400">
        {eyebrow}
      </p>
      <h3 className="mt-3 max-w-md text-3xl font-semibold tracking-[-0.045em] text-slate-950">
        {title}
      </h3>
      <p className="mt-3 max-w-xl text-[11px] leading-5 text-slate-500">
        {description}
      </p>

      <div className="mt-7 space-y-2.5">
        {items.map((item, index) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-xl border border-white/80 bg-white/75 px-3.5 py-3 backdrop-blur"
          >
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${accent} text-[8px] font-black text-white`}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-semibold leading-4 text-slate-700">
              {item}
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}

export function LandingAudiences() {
  return (
    <section id="usuarios" className="bg-white px-5 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600">
            Dos perspectivas, un mismo caso
          </p>
          <h2 className="mt-3 text-[clamp(2.2rem,5vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-slate-950">
            El cliente ve claridad. El equipo interno ve acción.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[12px] leading-6 text-slate-500">
            Cada perfil trabaja con la información que necesita sin crear dos historias distintas del mismo proyecto.
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          <AudienceCard
            eyebrow="Portal de cliente"
            title="Seguimiento sin entrar a la cocina operativa."
            description="El cliente conserva visibilidad sobre lo que le corresponde y puede participar cuando el flujo requiere una decisión o información adicional."
            items={clientJourney}
            tone="blue"
          />
          <AudienceCard
            eyebrow="Equipo interno"
            title="Contexto suficiente para mover el trabajo."
            description="Comercial, producción, calidad y logística comparten el mismo recorrido, con acciones y permisos ajustados a su responsabilidad."
            items={internalJourney}
            tone="emerald"
          />
        </div>
      </div>
    </section>
  )
}
