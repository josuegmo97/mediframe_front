import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

export const Switch = forwardRef(function Switch({ checked, onCheckedChange, disabled, label, className, id, ...props }, ref) {
  return (
    <label className={cn('inline-flex min-h-touch cursor-pointer items-center gap-3 md:min-h-0', disabled && 'cursor-not-allowed opacity-60', className)}>
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          checked ? 'bg-primary' : 'bg-border-strong'
        )}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
      {label && <span className="text-sm text-fg">{label}</span>}
    </label>
  )
})
