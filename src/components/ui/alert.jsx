import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

const STYLES = {
  info: { box: 'border-info/40 bg-info/10 text-fg', icon: 'text-secondary-deep', Icon: Info },
  success: { box: 'border-success/40 bg-success/10 text-fg', icon: 'text-success-fg dark:text-success', Icon: CheckCircle2 },
  warning: { box: 'border-warning/50 bg-warning/10 text-fg', icon: 'text-warning-fg dark:text-warning', Icon: AlertTriangle },
  danger: { box: 'border-danger/40 bg-danger/10 text-fg', icon: 'text-danger-text', Icon: XCircle },
}

export function Alert({ variant = 'info', title, icon, action, className, children }) {
  const style = STYLES[variant] ?? STYLES.info
  const Icon = icon ?? style.Icon
  return (
    <div
      role={variant === 'danger' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-lg border px-4 py-3 text-sm', style.box, className)}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', style.icon)} aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-1">
        {title && <p className="font-semibold leading-snug">{title}</p>}
        {children && <div className="text-fg-muted [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline">{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  )
}
