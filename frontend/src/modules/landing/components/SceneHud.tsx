const stageHud = [
  {
    eyebrow: 'Sistema en vivo',
    title: 'Celda conectada',
    metrics: ['7 etapas', '4 áreas', '1 trazabilidad'],
    footer: 'La pieza y la operación continúan activas aunque no hagas scroll.',
    accent: 'blue',
  },
  {
    eyebrow: 'Solicitud recibida',
    title: 'SOL-2026-001',
    metrics: ['3 documentos', 'Destino confirmado', 'Prioridad normal'],
    footer: 'El documento entra al flujo y queda ligado a la pieza desde origen.',
    accent: 'cyan',
  },
  {
    eyebrow: 'Expediente 360',
    title: 'EXP-0042',
    metrics: ['6 eventos', '3 archivos', '2 revisiones'],
    footer: 'Planos, aclaraciones y decisiones orbitan el mismo caso.',
    accent: 'blue',
  },
  {
    eyebrow: 'Cotización aprobada',
    title: 'QT-0042 · V1',
    metrics: ['2 conceptos', '$38,400 MXN', '10 días'],
    footer: 'La propuesta comercial conserva el contexto técnico que la originó.',
    accent: 'amber',
  },
  {
    eyebrow: 'Orden liberada',
    title: 'OT-0042',
    metrics: ['4 operaciones', 'AISI 4140', 'CNC-01'],
    footer: 'Ruta, material y máquina ya están listos para ejecutar.',
    accent: 'violet',
  },
  {
    eyebrow: 'Operación en curso',
    title: 'OP 02 · Torneado CNC',
    metrics: ['68% avance', 'LOT-4140-2026-01', 'CNC-01'],
    footer: 'La herramienta, el husillo y los indicadores siguen trabajando en reposo.',
    accent: 'blue',
  },
  {
    eyebrow: 'Inspección conforme',
    title: 'Control dimensional',
    metrics: ['Ø 24.98 mm ✓', '±0.05 mm ✓', 'Conforme'],
    footer: 'El escáner continúa realizando pasadas mientras la pieza permanece en calidad.',
    accent: 'emerald',
  },
  {
    eyebrow: 'Entrega confirmada',
    title: 'Recorrido completo',
    metrics: ['Empaque listo', 'Evidencia ligada', 'Caso cerrado'],
    footer: 'Solicitud → Cotización → Producción → Calidad → Entrega',
    accent: 'cyan',
  },
] as const

const accentClass = {
  blue: 'border-blue-400/20 bg-blue-500/10 text-blue-200',
  cyan: 'border-cyan-400/20 bg-cyan-500/10 text-cyan-200',
  amber: 'border-amber-400/20 bg-amber-500/10 text-amber-200',
  violet: 'border-violet-400/20 bg-violet-500/10 text-violet-200',
  emerald: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200',
} as const

export function SceneHud({ activeIndex }: { activeIndex: number }) {
  const content = stageHud[activeIndex] ?? stageHud[0]

  return (
    <div className="qt-scene-hud pointer-events-none absolute bottom-7 right-5 z-[4] hidden w-[min(360px,30vw)] lg:block xl:right-10">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/62 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.95)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-45" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {content.eyebrow}
            </span>
          </div>
          <span className="font-mono text-[8px] text-slate-500">QT · LIVE</span>
        </div>

        <div className="px-4 py-4">
          <h3 className="text-lg font-semibold tracking-[-0.035em] text-white">
            {content.title}
          </h3>
          <div className="mt-3 grid gap-2">
            {content.metrics.map((metric, index) => (
              <div
                key={metric}
                className="flex items-center justify-between rounded-xl border border-white/7 bg-white/[0.035] px-3 py-2"
              >
                <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className={`rounded-lg border px-2 py-1 text-[9px] font-semibold ${accentClass[content.accent]}`}
                >
                  {metric}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[9px] leading-4 text-slate-400">
            {content.footer}
          </p>
        </div>
      </div>
    </div>
  )
}
