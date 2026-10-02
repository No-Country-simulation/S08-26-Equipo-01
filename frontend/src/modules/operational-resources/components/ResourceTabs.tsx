import { cn } from '@/shared/lib/cn'

export type ResourceTab = 'machines' | 'materials'

interface ResourceTabsProps {
  value: ResourceTab
  onChange: (value: ResourceTab) => void
}

const tabs: Array<{ value: ResourceTab; label: string; description: string }> = [
  {
    value: 'machines',
    label: 'Máquinas',
    description: 'Disponibilidad y estado operativo',
  },
  {
    value: 'materials',
    label: 'Materiales y lotes',
    description: 'Existencias trazables por lote',
  },
]

export function ResourceTabs({ value, onChange }: ResourceTabsProps) {
  return (
    <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-[0_8px_24px_-24px_rgba(15,23,42,0.28)]">
      {tabs.map((tab) => {
        const active = tab.value === value

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'min-w-[180px] rounded-lg px-3 py-2 text-left transition',
              active
                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
            )}
          >
            <span className="block text-[9px] font-semibold">
              {tab.label}
            </span>
            <span className="mt-0.5 block text-[7px] leading-3 opacity-75">
              {tab.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}
