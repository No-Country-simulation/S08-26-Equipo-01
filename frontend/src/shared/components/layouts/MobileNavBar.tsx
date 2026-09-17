import { NavLink } from 'react-router-dom'
import type { MobileNavBarProps } from './types'

export const MobileNavBar = ({ tabs }: MobileNavBarProps) => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-base-300 bg-base-100 md:hidden">
      <div className="flex">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.destination}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
                isActive ? 'font-semibold text-primary' : 'text-base-content/70'
              }`
            }
          >
            <tab.icon className="size-5" aria-hidden="true" />
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}