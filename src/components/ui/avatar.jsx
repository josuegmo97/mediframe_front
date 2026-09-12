import { cn } from '@/lib/cn'
import { initials } from '@/lib/format'

const SIZES = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' }

export function Avatar({ name, size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full bg-accent/25 font-semibold uppercase text-fg ring-1 ring-accent/30',
        SIZES[size],
        className
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
