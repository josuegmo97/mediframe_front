import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { APP_NAME } from '@/lib/constants'

export function BrandMark({ className }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('h-9 w-9', className)} aria-hidden="true">
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#9DB582" />
      <rect x="11" y="11" width="42" height="42" rx="10" fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="3" />
      <path d="M32 20v24M20 32h24" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />
    </svg>
  )
}

/** Logotipo: marca + "MediFrame Admin". `to` lo convierte en enlace. */
export function Brand({ size = 'md', inverted = false, to, className }) {
  const content = (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <BrandMark className={size === 'lg' ? 'h-12 w-12' : 'h-9 w-9'} />
      <span className="flex flex-col leading-none">
        <span className={cn('font-semibold tracking-tight', size === 'lg' ? 'text-xl' : 'text-base', inverted ? 'text-white' : 'text-fg')}>{APP_NAME}</span>
        <span className={cn('text-xs font-medium uppercase tracking-[0.18em]', inverted ? 'text-white/70' : 'text-fg-subtle')}>Admin</span>
      </span>
    </span>
  )
  if (!to) return content
  return (
    <Link to={to} className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" aria-label={`${APP_NAME} Admin, ir al inicio`}>
      {content}
    </Link>
  )
}
