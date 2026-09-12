import { cn } from '@/lib/cn'

/** Control segmentado (radiogroup) para 2–4 opciones excluyentes. */
export function Segmented({ value, onValueChange, options, label, className, size = 'md' }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex w-full rounded-lg border border-border bg-surface-2 p-1', className)}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={option.disabled}
            onClick={() => onValueChange(option.value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50',
              size === 'sm' ? 'h-8 px-2 text-xs' : 'h-9 px-3 text-sm',
              selected ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
            )}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
