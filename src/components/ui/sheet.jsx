import { forwardRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './button'
import { DialogOverlay } from './dialog'

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close
export const SheetTitle = DialogPrimitive.Title
export const SheetDescription = DialogPrimitive.Description

const SIDES = {
  left: 'inset-y-0 left-0 h-full w-[85vw] max-w-xs border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
  right: 'inset-y-0 right-0 h-full w-full border-l sm:max-w-md data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
  bottom: 'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-2xl border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
}

export const SheetContent = forwardRef(function SheetContent({ side = 'right', className, hideClose = false, children, ...props }, ref) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 flex flex-col border-border bg-surface text-fg shadow-pop focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300',
          SIDES[side],
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
    </DialogPrimitive.Portal>
  )
})

export function SheetHeader({ className, ...props }) {
  return <div className={cn('shrink-0 space-y-1 border-b border-border px-5 py-4 pr-14', className)} {...props} />
}

export function SheetBody({ className, ...props }) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto px-5 py-4 scrollbar-thin', className)} {...props} />
}

export function SheetFooter({ className, ...props }) {
  return <div className={cn('flex shrink-0 flex-col-reverse gap-2 border-t border-border px-5 py-4 safe-bottom sm:flex-row sm:justify-end', className)} {...props} />
}
