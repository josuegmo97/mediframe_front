import { Check, Copy } from 'lucide-react'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { toast } from '@/lib/toast'
import { Button } from './button'
import { Tooltip } from './tooltip'

export function CopyButton({ value, label = 'Copiar', size = 'icon-sm', variant = 'ghost', showLabel = false, successMessage = 'Copiado al portapapeles', className, onCopied }) {
  const { copied, copy } = useCopyToClipboard()

  const handleCopy = async (event) => {
    event.stopPropagation()
    const ok = await copy(value)
    if (ok) {
      toast.success(successMessage, { id: 'copy-success' })
      onCopied?.()
    } else {
      toast.error('No se pudo copiar', { id: 'copy-error' })
    }
  }

  const icon = copied ? <Check className="text-success-fg dark:text-success" /> : <Copy />

  if (showLabel) {
    return (
      <Button variant={variant} size={size === 'icon-sm' ? 'sm' : size} onClick={handleCopy} leftIcon={icon} className={className}>
        {copied ? 'Copiado' : label}
      </Button>
    )
  }

  return (
    <Tooltip content={copied ? 'Copiado' : label}>
      <Button variant={variant} size={size} onClick={handleCopy} aria-label={label} className={className}>
        {icon}
      </Button>
    </Tooltip>
  )
}
