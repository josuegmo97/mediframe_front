import { Building2, Mail, Phone } from 'lucide-react'
import { formatRelative } from '@/lib/format'
import { ContactStatusBadge } from './contact-status-badge'
import { ContactStatusButton } from './contact-status-button'

export function ContactCard({ contact, onOpen }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-card dark:shadow-none">
      <button type="button" onClick={() => onOpen(contact)} className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-fg">{contact.name}</p>
            <p className="truncate text-xs text-fg-subtle">{formatRelative(contact.created_at)}</p>
          </div>
          <ContactStatusBadge status={contact.status} />
        </div>
        <ul className="mt-2 space-y-1 text-sm text-fg-muted">
          {contact.email && (
            <li className="flex items-center gap-2 truncate">
              <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {contact.email}
            </li>
          )}
          {contact.phone && (
            <li className="flex items-center gap-2 truncate">
              <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {contact.phone}
            </li>
          )}
          {(contact.institution || contact.specialty) && (
            <li className="flex items-center gap-2 truncate">
              <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {[contact.specialty, contact.institution].filter(Boolean).join(' · ')}
            </li>
          )}
        </ul>
      </button>
      <div className="mt-3">
        <ContactStatusButton contact={contact} />
      </div>
    </article>
  )
}
