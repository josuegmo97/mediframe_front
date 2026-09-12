import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { inputClassName } from './input'

/** Select nativo (mejor UX en móvil) con estilo del design system. */
export const Select = forwardRef(function Select({ className, invalid, options, placeholder, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(inputClassName, 'appearance-none pr-10', className)}
        aria-invalid={invalid ? 'true' : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled={props.required}>
            {placeholder}
          </option>
        )}
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))
          : children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
    </div>
  )
})
