import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Copy, Eye, MoreHorizontal, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { ATC_STATUS } from '@/lib/constants'
import { toast, toastApiError } from '@/lib/toast'
import { useUpdateAtcStatus } from '../atc.queries'

export function AtcRowActions({ message }) {
  const navigate = useNavigate()
  const { copy } = useCopyToClipboard()
  const mutation = useUpdateAtcStatus()
  const handled = Number(message.status) === ATC_STATUS.HANDLED

  const toggle = async () => {
    try {
      await mutation.mutateAsync({ id: message._id, status: handled ? ATC_STATUS.PENDING : ATC_STATUS.HANDLED })
      toast.success(handled ? 'Mensaje marcado como pendiente' : 'Mensaje marcado como atendido')
    } catch (error) {
      toastApiError(error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Acciones del mensaje" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem icon={<Eye />} onSelect={() => navigate(`/soporte/${message._id}`)}>
          Ver mensaje
        </DropdownMenuItem>
        <DropdownMenuItem icon={<Copy />} onSelect={async () => (await copy(message.device)) && toast.success('Identificador copiado', { id: 'copy-success' })}>
          Copiar dispositivo
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={handled ? <RotateCcw /> : <CheckCircle2 />} onSelect={toggle} disabled={mutation.isPending}>
          {handled ? 'Marcar como pendiente' : 'Marcar como atendido'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
