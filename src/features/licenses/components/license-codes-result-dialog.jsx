import { ClipboardCopy, Download, FileSpreadsheet } from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/copy-button'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { downloadCsv, downloadText, timestampedFilename } from '@/lib/csv'
import { formatLicenseCode } from '@/lib/license-code'
import { toast } from '@/lib/toast'
import { codesToCsv, codesToText } from '../licenses.utils'

/** Muestra los códigos recién generados con opciones de copia y descarga. */
export function LicenseCodesResultDialog({ result, open, onOpenChange }) {
  const { copy } = useCopyToClipboard()
  if (!result) return null
  const codes = result.codes ?? []
  const errors = result.errors ?? []
  const single = codes.length === 1

  const copyAll = async () => {
    if (await copy(codesToText(codes))) toast.success(single ? 'Código copiado' : `${codes.length} códigos copiados`, { id: 'copy-success' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{single ? 'Licencia creada' : `${codes.length} licencias creadas`}</DialogTitle>
          <DialogDescription>
            {single ? 'Comparte este código con el cliente para activar MediFrame.' : 'Copia o descarga los códigos para entregarlos a los clientes.'} Los códigos también quedan en el listado.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
            {codes.map((item) => (
              <li key={item.code} className="flex items-center justify-between gap-3 bg-surface px-3 py-2">
                <span className="font-mono text-base tracking-wider text-fg">{formatLicenseCode(item.code)}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-fg-subtle">{item.days_permission} días</span>
                  <CopyButton value={formatLicenseCode(item.code)} label="Copiar código" />
                </span>
              </li>
            ))}
          </ul>
          {errors.length > 0 && (
            <Alert variant="warning" title={`${errors.length} ${errors.length === 1 ? 'licencia no se pudo crear' : 'licencias no se pudieron crear'}`}>
              <ul className="list-disc pl-4">
                {errors.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </Alert>
          )}
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => downloadText(timestampedFilename('codigos_licencia', 'txt'), codesToText(codes))} leftIcon={<Download />}>
              Descargar .txt
            </Button>
            {!single && (
              <Button variant="outline" onClick={() => downloadCsv(timestampedFilename('codigos_licencia'), codesToCsv(codes))} leftIcon={<FileSpreadsheet />}>
                Descargar .csv
              </Button>
            )}
          </div>
          <Button onClick={copyAll} leftIcon={<ClipboardCopy />}>
            {single ? 'Copiar código' : 'Copiar todos'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
