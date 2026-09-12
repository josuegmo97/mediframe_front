import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/cn'
import { useIsTouch } from '@/hooks/use-media-query'

export const TooltipProvider = TooltipPrimitive.Provider

/** En pantallas táctiles no hay hover: se renderiza solo el hijo. */
export function Tooltip({ content, side = 'top', align = 'center', className, children, delayDuration = 300 }) {
  const isTouch = useIsTouch()
  if (isTouch || !content) return children
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={8}
          className={cn(
            'z-[60] max-w-xs rounded-md bg-fg px-2.5 py-1.5 text-xs font-medium text-bg shadow-pop animate-in fade-in-0 zoom-in-95',
            className
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
