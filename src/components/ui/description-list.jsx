import { cn } from '@/lib/cn'
import { EMPTY } from '@/lib/format'
import { CopyButton } from './copy-button'

/**
 * items: [{ label, value, mono, copyable, href, hint, span }]
 */
export function DescriptionList({ items, columns = 2, className }) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-4', columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-3' : '', className)}>
      {items.map((item) => {
        const empty = item.value == null || item.value === ''
        return (
          <div key={item.label} className={cn('min-w-0', item.span && 'sm:col-span-full')}>
            <dt className="text-xs font-medium uppercase tracking-wide text-fg-muted">{item.label}</dt>
            <dd className={cn('mt-1 flex min-w-0 items-center gap-1 text-sm text-fg', item.mono && 'font-mono tracking-wide')}>
              {empty ? (
                <span className="text-fg-subtle">{EMPTY}</span>
              ) : item.href ? (
                <a href={item.href} className="truncate text-primary underline-offset-2 hover:underline" target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  {item.value}
                </a>
              ) : (
                <span className="min-w-0 break-words">{item.value}</span>
              )}
              {!empty && item.copyable && <CopyButton value={item.copyable === true ? String(item.value) : item.copyable} className="-my-2" />}
            </dd>
            {item.hint && <p className="mt-0.5 text-xs text-fg-subtle">{item.hint}</p>}
          </div>
        )
      })}
    </dl>
  )
}
