import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8">
      {children}
    </div>
  )
}
