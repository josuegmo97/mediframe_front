import { CheckCircle2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CONTACT_STATUS } from '@/lib/constants'
import { toast, toastApiError } from '@/lib/toast'
import { useUpdateContactStatus } from '../contacts.queries'

export function ContactStatusButton({ contact, size = 'sm', variant }) {
  const mutation = useUpdateContactStatus()
  const contacted = Number(contact.status) === CONTACT_STATUS.CONTACTED

  const toggle = async (event) => {
    event?.stopPropagation?.()
    try {
      await mutation.mutateAsync({ id: contact._id, status: contacted ? CONTACT_STATUS.PENDING : CONTACT_STATUS.CONTACTED })
      toast.success(contacted ? 'Contacto marcado como pendiente' : 'Contacto marcado como contactado')
    } catch (error) {
      toastApiError(error)
    }
  }

  return (
    <Button size={size} variant={variant ?? (contacted ? 'ghost' : 'outline')} onClick={toggle} loading={mutation.isPending} leftIcon={contacted ? <RotateCcw /> : <CheckCircle2 />}>
      {contacted ? 'Marcar pendiente' : 'Marcar contactado'}
    </Button>
  )
}
