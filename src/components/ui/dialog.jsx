import { forwardRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './button'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close
export const DialogPortal = DialogPrimitive.Portal

export const overlayClassName =
  'fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'

export const DialogOverlay = forwardRef(function DialogOverlay({ className, ...props }, ref) {
  return <DialogPrimitive.Overlay ref={ref} className={cn(overlayClassName, className)} {...props} />
})

const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' }

/**
 * Pantalla completa en móvil (< sm), centrado con ancho máximo en pantallas mayores.
 * Estructura esperada: DialogHeader + DialogBody (scroll) + DialogFooter.
 */
export const DialogContent = forwardRef(function DialogContent({ className, size = 'md', hideClose = false, children, ...props }, ref) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 flex h-[100dvh] w-full flex-col bg-surface text-fg shadow-pop focus:outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[90dvh] sm:w-full sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:border sm:border-border',
          'sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95',
          SIZES[size],
          className
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="icon-sm" className="absolute right-3 top-3 text-fg-muted" aria-label="Cerrar">
              <X />
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})

export function DialogHeader({ className, ...props }) {
  return <div className={cn('shrink-0 space-y-1 border-b border-border px-5 py-4 pr-14 sm:px-6', className)} {...props} />
}

export function DialogBody({ className, ...props }) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto px-5 py-4 scrollbar-thin sm:px-6', className)} {...props} />
}

export function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex shrink-0 flex-col-reverse gap-2 border-t border-border px-5 py-4 safe-bottom sm:flex-row sm:justify-end sm:px-6', className)}
      {...props}
    />
  )
}

export const DialogTitle = forwardRef(function DialogTitle({ className, ...props }, ref) {
  return <DialogPrimitive.Title ref={ref} className={cn('text-lg font-semibold leading-tight text-fg', className)} {...props} />
})

export const DialogDescription = forwardRef(function DialogDescription({ className, ...props }, ref) {
  return <DialogPrimitive.Description ref={ref} className={cn('text-sm text-fg-muted', className)} {...props} />
})
