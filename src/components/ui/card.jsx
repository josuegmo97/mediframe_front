import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

export const Card = forwardRef(function Card({ className, ...props }, ref) {
  return <div ref={ref} className={cn('rounded-xl border border-border bg-surface shadow-card dark:shadow-none', className)} {...props} />
})

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-1 p-4 sm:p-6', className)} {...props} />
}

export function CardTitle({ className, as: Comp = 'h2', ...props }) {
  return <Comp className={cn('text-base font-semibold leading-tight text-fg sm:text-lg', className)} {...props} />
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-fg-muted', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-4 pt-0 sm:p-6 sm:pt-0', className)} {...props} />
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center gap-2 border-t border-border p-4 sm:px-6', className)} {...props} />
}
