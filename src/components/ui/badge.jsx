import { cva } from 'class-variance-authority'
import { cn } from '@/lib/cn'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-5',
  {
    variants: {
      variant: {
        neutral: 'border-border bg-surface-2 text-fg-muted',
        success: 'border-success/30 bg-success/15 text-success-fg dark:text-success',
        info: 'border-info/30 bg-info/15 text-info-fg dark:text-info',
        warning: 'border-warning/40 bg-warning/15 text-warning-fg dark:text-warning',
        danger: 'border-danger/30 bg-danger/15 text-danger-text',
        accent: 'border-accent/40 bg-accent/20 text-fg',
        outline: 'border-border-strong bg-transparent text-fg-muted',
      },
    },
    defaultVariants: { variant: 'neutral' },
  }
)

const DOT = {
  neutral: 'bg-fg-subtle',
  success: 'bg-success',
  info: 'bg-info',
  warning: 'bg-warning',
  danger: 'bg-danger',
  accent: 'bg-accent',
  outline: 'bg-fg-subtle',
}

export function Badge({ className, variant = 'neutral', dot = false, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', DOT[variant])} aria-hidden="true" />}
      {children}
    </span>
  )
}
