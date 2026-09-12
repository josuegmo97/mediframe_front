import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './button'
import { overlayClassName } from './dialog'

/**
 * Confirmación accesible (foco atrapado, Esc cancela). Bottom-sheet en móvil, centrado en ≥ sm.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
  onConfirm,
  children,
}) {
  const danger = variant === 'danger'
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className={overlayClassName} />
        <AlertDialogPrimitive.Content
          className={cn(
            'fixed z-50 flex flex-col gap-4 bg-surface p-5 text-fg shadow-pop focus:outline-none',
            'inset-x-0 bottom-0 rounded-t-2xl border-t border-border safe-bottom data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
            'sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:border sm:p-6',
            'sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:fade-out-0 sm:data-[state=open]:fade-in-0'
          )}
        >
          <div className="flex gap-3">
            {danger && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/15 text-danger-text">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0 space-y-1">
              <AlertDialogPrimitive.Title className="text-lg font-semibold leading-tight">{title}</AlertDialogPrimitive.Title>
              {description && (
                <AlertDialogPrimitive.Description className="text-sm text-fg-muted">{description}</AlertDialogPrimitive.Description>
              )}
            </div>
          </div>
          {children}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline" disabled={loading}>
                {cancelLabel}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild onClick={(event) => event.preventDefault()}>
              <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  )
}
