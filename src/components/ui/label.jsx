import { cn } from '@/lib/cn'

export function Label({ className, required, children, ...props }) {
  return (
    <label className={cn('mb-1.5 block text-sm font-medium text-fg', className)} {...props}>
      {children}
      {required && (
        <span className="ml-0.5 text-danger-text" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}
