import { Children, cloneElement, isValidElement } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Label } from './label'

/**
 * Envuelve un control con label, ayuda y error, cableando aria-describedby/aria-invalid.
 * El hijo debe recibir `id` (se usa `htmlFor`) o se toma el prop `htmlFor`.
 */
export function FormField({ label, htmlFor, error, hint, required, className, children, labelExtra }) {
  const child = Children.only(children)
  const id = htmlFor ?? child.props.id
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [child.props['aria-describedby'], hintId, errorId].filter(Boolean).join(' ') || undefined

  const control = isValidElement(child)
    ? cloneElement(child, {
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? 'true' : child.props['aria-invalid'],
        invalid: child.props.invalid ?? Boolean(error),
      })
    : child

  return (
    <div className={cn('space-y-0', className)}>
      {label && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <Label htmlFor={id} required={required} className="mb-0">
            {label}
          </Label>
          {labelExtra}
        </div>
      )}
      {control}
      {error ? (
        <p id={errorId} className="mt-1.5 flex items-start gap-1 text-xs text-danger-text" role="alert">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-fg-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
