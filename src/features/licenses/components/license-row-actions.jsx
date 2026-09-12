import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { LICENSE_STATUS } from '@/lib/constants'
import { effectiveLicenseStatus, formatLicenseCode } from '@/lib/license-code'
import { toast } from '@/lib/toast'
import { DeleteLicenseDialog } from './delete-license-dialog'

export function LicenseRowActions({ license }) {
  const navigate = useNavigate()
  const { copy } = useCopyToClipboard()
  const [deleting, setDeleting] = useState(false)
  const deletable = effectiveLicenseStatus(license) === LICENSE_STATUS.AVAILABLE

  const handleCopy = async () => {
    if (await copy(formatLicenseCode(license.code))) toast.success('Código copiado', { id: 'copy-success' })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Acciones para la licencia ${formatLicenseCode(license.code)}`} onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem icon={<Eye />} onSelect={() => navigate(`/licencias/${license._id}`)}>
            Ver detalle
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Copy />} onSelect={handleCopy}>
            Copiar código
          </DropdownMenuItem>
          {deletable && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive icon={<Trash2 />} onSelect={() => setDeleting(true)}>
                Eliminar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteLicenseDialog license={license} open={deleting} onOpenChange={setDeleting} />
    </>
  )
}
