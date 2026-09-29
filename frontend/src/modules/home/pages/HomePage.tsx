import { AppShell } from '@/shared/components/layout/AppShell'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'

const foundations = [
  'Arquitectura modular por dominio',
  'TanStack Query para estado del servidor',
  'Cliente HTTP único y errores normalizados',
  'Límites de dependencias entre app, módulos y shared',
  'Componentes base reutilizables',
  'TypeScript y ESLint estrictos',
]

export function HomePage() {
  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          eyebrow="Frontend foundation"
          title="QualityTrack"
          description="La base del frontend está preparada para implementar los flujos del producto por módulos, sin concentrar lógica, API y UI en archivos monolíticos."
        />

        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-950">
              Fundamentos activos
            </h2>
            <Badge tone="success">Base preparada</Badge>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {foundations.map((foundation) => (
              <li
                key={foundation}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                {foundation}
              </li>
            ))}
          </ul>
        </Card>
      </PageContainer>
    </AppShell>
  )
}
