export interface LandingStoryStage {
  id: string
  step: string
  eyebrow: string
  title: string
  description: string
  signal: string
  detail: string
  side: 'left' | 'right'
  accent: 'blue' | 'cyan' | 'amber' | 'violet' | 'emerald'
  hero?: boolean
}

export const landingStory: LandingStoryStage[] = [
  {
    id: 'inicio',
    step: '00',
    eyebrow: 'Operación industrial conectada',
    title: 'De una solicitud a una entrega. Sin perder el hilo.',
    description:
      'QualityTrack conecta el trabajo comercial, operativo y de calidad en un solo recorrido. Desplázate y sigue una pieza desde la necesidad del cliente hasta la evidencia de entrega.',
    signal: 'Sistema en vivo',
    detail:
      'Solicitud · Expediente · Cotización · Producción · Calidad · Entrega',
    side: 'left',
    accent: 'blue',
    hero: true,
  },
  {
    id: 'solicitud',
    step: '01',
    eyebrow: 'Solicitud',
    title: 'El trabajo empieza con contexto, no con mensajes sueltos.',
    description:
      'El cliente documenta qué necesita, adjunta archivos y define información de entrega. La solicitud entra al flujo con una referencia única desde el primer minuto.',
    signal: 'Solicitud recibida',
    detail: 'Requisitos, documentos y destino quedan vinculados desde origen.',
    side: 'right',
    accent: 'cyan',
  },
  {
    id: 'expediente',
    step: '02',
    eyebrow: 'Expediente 360',
    title:
      'La solicitud deja de ser un formulario. Se convierte en una historia.',
    description:
      'Documentos, revisiones, aclaraciones y decisiones crecen alrededor del mismo expediente, sin perder el vínculo con su origen.',
    signal: 'Contexto consolidado',
    detail: 'Una historia operativa navegable que crece con el trabajo real.',
    side: 'left',
    accent: 'blue',
  },
  {
    id: 'cotizacion',
    step: '03',
    eyebrow: 'Cotización',
    title: 'El contexto técnico se convierte en una decisión comercial.',
    description:
      'Conceptos, cantidades, plazo y condiciones se construyen desde el expediente. La propuesta se revisa y, al aprobarse, libera el siguiente paso de ejecución.',
    signal: 'Cotización aprobada',
    detail:
      'Importe, plazo y aprobación permanecen ligados al caso que los originó.',
    side: 'right',
    accent: 'amber',
  },
  {
    id: 'orden-trabajo',
    step: '04',
    eyebrow: 'Orden de trabajo',
    title: 'La aprobación deja de ser papel y se convierte en ejecución.',
    description:
      'La orden concentra planeación, materiales, documentos y hoja de ruta. Las operaciones se encadenan para que cada equipo sepa qué sigue y qué debe estar listo antes.',
    signal: 'Ruta liberada',
    detail: 'Máquinas, materiales y operaciones quedan preparados para piso.',
    side: 'left',
    accent: 'violet',
  },
  {
    id: 'produccion',
    step: '05',
    eyebrow: 'Producción',
    title: 'La ruta deja de ser un plan y empieza a moverse.',
    description:
      'La pieza avanza operación por operación mientras QualityTrack conserva lote, material, máquina y progreso dentro de la misma trazabilidad.',
    signal: 'Operación en curso',
    detail:
      'Cada paso deja evidencia y prepara el siguiente sin perder el origen.',
    side: 'right',
    accent: 'blue',
  },
  {
    id: 'calidad',
    step: '06',
    eyebrow: 'Calidad',
    title: 'La pieza ya existe. Ahora hay que demostrar que cumple.',
    description:
      'Dimensión, acabado y evidencia se verifican sobre la misma pieza. Cada resultado queda ligado al lote antes de liberarla para el siguiente movimiento.',
    signal: 'Inspección conforme',
    detail:
      'Tres verificaciones, una decisión y la misma trazabilidad de origen.',
    side: 'left',
    accent: 'emerald',
  },
  {
    id: 'entrega',
    step: '07',
    eyebrow: 'Entrega',
    title: 'La pieza termina su recorrido. La trazabilidad no.',
    description:
      'Destino, transportista, recepción y evidencia cierran la entrega. Al confirmar el último movimiento, QualityTrack reconstruye el caso completo desde la solicitud hasta el producto recibido.',
    signal: 'Entrega confirmada',
    detail: 'Siete etapas, una sola historia y evidencia de principio a fin.',
    side: 'right',
    accent: 'cyan',
  },
]

export const operationalCapabilities = [
  {
    title: 'Solicitudes',
    eyebrow: 'Entrada ordenada',
    description:
      'Requisitos, archivos y destino llegan con estructura desde el portal.',
    glyph: '01',
  },
  {
    title: 'Expediente 360',
    eyebrow: 'Contexto compartido',
    description:
      'Revisión, documentos y trazabilidad reunidos alrededor del mismo caso.',
    glyph: '02',
  },
  {
    title: 'Cotizaciones',
    eyebrow: 'Decisión comercial',
    description:
      'Conceptos, condiciones y aprobación sin perder el origen técnico.',
    glyph: '03',
  },
  {
    title: 'Órdenes de trabajo',
    eyebrow: 'Plan ejecutable',
    description: 'Materiales, documentos y hoja de ruta listos para operación.',
    glyph: '04',
  },
  {
    title: 'Producción',
    eyebrow: 'Ejecución visible',
    description:
      'Operaciones encadenadas, consumo de material y avance en contexto.',
    glyph: '05',
  },
  {
    title: 'Calidad',
    eyebrow: 'Evidencia antes de avanzar',
    description:
      'Inspecciones flexibles, mediciones y decisiones sobre no conformidades.',
    glyph: '06',
  },
  {
    title: 'Entregas',
    eyebrow: 'Cierre verificable',
    description:
      'Destino, transportista y evidencia forman parte del caso, no un apéndice.',
    glyph: '07',
  },
  {
    title: 'Trazabilidad',
    eyebrow: 'Hilo transversal',
    description:
      'Los eventos conectan cada etapa para reconstruir qué pasó y cuándo.',
    glyph: '∞',
  },
] as const
