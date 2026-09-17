import { NavLink } from 'react-router-dom'
import type { SidebarProps } from './types'

export const Sidebar = ({ tabs }: SidebarProps) => {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-8 border-r border-base-300 bg-base-100 p-6 md:flex">
      <p className="text-xl font-bold text-base-content">QualityTrack</p>

      <nav>
        <ul className="menu w-full gap-1">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <NavLink
                to={tab.destination}
                className={({ isActive }) =>
                  isActive
                    ? 'bg-primary/10 font-semibold text-primary'
                    : undefined
                }
              >
                <tab.icon className="size-5" aria-hidden="true" />
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}