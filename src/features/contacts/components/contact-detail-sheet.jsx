import { DescriptionList } from '@/components/ui/description-list'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { formatDateTime, formatRelative } from '@/lib/format'
import { ContactStatusBadge } from './contact-status-badge'
import { ContactStatusButton } from './contact-status-button'

export function ContactDetailSheet({ contact, open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        {contact && (
          <>
            <SheetHeader>
              <SheetTitle className="text-lg font-semibold leading-tight text-fg">{contact.name}</SheetTitle>
              <SheetDescription className="text-sm text-fg-muted">
                Recibido {formatDateTime(contact.created_at)} · {formatRelative(contact.created_at)}
              </SheetDescription>
              <div className="pt-1">
                <ContactStatusBadge status={contact.status} />
              </div>
            </SheetHeader>
            <SheetBody className="space-y-6">
              <DescriptionList
                columns={1}
                items={[
                  { label: 'Correo', value: contact.email, href: contact.email ? `mailto:${contact.email}` : undefined, copyable: Boolean(contact.email) },
                  { label: 'Teléfono', value: contact.phone, href: contact.phone ? `tel:${contact.phone}` : undefined, copyable: Boolean(contact.phone) },
                  { label: 'Especialidad', value: contact.specialty },
                  { label: 'Institución', value: contact.institution },
                ]}
              />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">Interés</p>
                <p className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-surface-2 p-3 text-sm text-fg">{contact.interest || 'Sin detalle.'}</p>
              </div>
            </SheetBody>
            <SheetFooter>
              <ContactStatusButton contact={contact} size="md" variant={Number(contact.status) === 1 ? 'outline' : 'primary'} />
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
