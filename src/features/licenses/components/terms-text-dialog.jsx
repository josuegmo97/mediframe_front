import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TERMS_TEXT, TERMS_TITLE } from '../terms-text'

/** Texto de los términos tal como lo lee el usuario en la app (español). */
export function TermsTextDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{TERMS_TITLE}</DialogTitle>
          <DialogDescription>Texto que el usuario debe leer hasta el final y aceptar en la app.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="whitespace-pre-line text-sm leading-relaxed text-fg">{TERMS_TEXT}</p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
