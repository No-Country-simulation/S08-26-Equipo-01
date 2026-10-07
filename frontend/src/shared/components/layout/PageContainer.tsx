import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({
  children,
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8',
        className,
      )}
    >
      {children}
    </div>
  )
}
