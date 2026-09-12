import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import { Spinner } from './spinner'

export const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-fg shadow-sm hover:bg-primary/90',
        secondary: 'border border-border bg-surface-2 text-fg hover:bg-border/60',
        outline: 'border border-border-strong bg-surface text-fg shadow-sm hover:bg-surface-2',
        ghost: 'text-fg-muted hover:bg-surface-2 hover:text-fg',
        danger: 'bg-danger text-danger-fg shadow-sm hover:bg-danger/90',
        link: 'h-auto p-0 text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 rounded-md px-3 text-sm [&_svg]:h-4 [&_svg]:w-4',
        md: 'h-11 rounded-lg px-4 text-sm md:h-10 [&_svg]:h-4 [&_svg]:w-4',
        lg: 'h-12 rounded-lg px-6 text-base [&_svg]:h-5 [&_svg]:w-5',
        icon: 'h-11 w-11 rounded-lg md:h-10 md:w-10 [&_svg]:h-5 [&_svg]:w-5',
        'icon-sm': 'h-9 w-9 rounded-md [&_svg]:h-4 [&_svg]:w-4',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export const Button = forwardRef(function Button(
  { className, variant, size, asChild = false, loading = false, disabled, leftIcon, rightIcon, type = 'button', children, ...props },
  ref
) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading ? <Spinner size="sm" /> : leftIcon}
          {children}
          {!loading && rightIcon}
        </>
      )}
    </Comp>
  )
})
