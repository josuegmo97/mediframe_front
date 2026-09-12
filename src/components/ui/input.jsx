import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

export const inputClassName =
  'flex h-11 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-fg shadow-sm transition-colors placeholder:text-fg-subtle focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:opacity-70 md:h-10 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/30'

export const Input = forwardRef(function Input({ className, leftIcon, rightSlot, invalid, ...props }, ref) {
  const control = (
    <input
      ref={ref}
      className={cn(inputClassName, leftIcon && 'pl-10', rightSlot && 'pr-11', className)}
      aria-invalid={invalid ? 'true' : undefined}
      {...props}
    />
  )
  if (!leftIcon && !rightSlot) return control
  return (
    <div className="relative">
      {leftIcon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle [&_svg]:h-4 [&_svg]:w-4">
          {leftIcon}
        </span>
      )}
      {control}
      {rightSlot && <span className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">{rightSlot}</span>}
    </div>
  )
})
