import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
}

const sections = [
  'Inicio',
  'Expedientes',
  'Cotizaciones',
  'Órdenes de trabajo',
  'Producción',
  'Calidad',
]

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden min-h-screen bg-slate-950 px-5 py-6 text-slate-200 lg:block">
        <div className="mb-8 text-lg font-bold text-white">QualityTrack</div>
        <nav aria-label="Navegación principal">
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section}>
                <span className="block rounded-lg px-3 py-2 text-sm text-slate-400">
                  {section}
                </span>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="flex h-16 items-center border-b border-slate-200 bg-white px-6">
          <span className="text-sm font-medium text-slate-500">
            Planta Tepic · Operación interna
          </span>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
