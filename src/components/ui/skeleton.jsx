import { cn } from '@/lib/cn'

export function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-border/70', className)} aria-hidden="true" {...props} />
}
