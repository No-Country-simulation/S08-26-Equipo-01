import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/shared/lib/cn'

export function Card({
  className,
  ...props
}: ComponentPropsWithoutRef<'section'>) {
  return (
    <section
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        className,
      )}
      {...props}
    />
  )
}
