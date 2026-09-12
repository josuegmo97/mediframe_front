import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

export const Textarea = forwardRef(function Textarea({ className, invalid, showCount, maxLength, value, ...props }, ref) {
  const length = typeof value === 'string' ? value.length : 0
  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        maxLength={maxLength}
        className={cn(
          'flex min-h-[96px] w-full resize-y rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-fg shadow-sm transition-colors placeholder:text-fg-subtle focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-70 aria-[invalid=true]:border-danger',
          showCount && 'pb-7',
          className
        )}
        aria-invalid={invalid ? 'true' : undefined}
        {...props}
      />
      {showCount && maxLength && (
        <span className="pointer-events-none absolute bottom-2 right-3 text-xs tabular-nums text-fg-subtle" aria-live="polite">
          {length}/{maxLength}
        </span>
      )}
    </div>
  )
})
