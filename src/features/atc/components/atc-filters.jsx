import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SearchInput } from '@/components/ui/search-input'
import { Select } from '@/components/ui/select'

export function AtcFilters({ filters, setFilter, reset, isDirty, versions, resultCount }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_14rem_10rem_10rem_auto] xl:items-center">
      <SearchInput value={filters.q} onChange={(value) => setFilter('q', value)} placeholder="Buscar en el mensaje o dispositivo" aria-label="Buscar mensajes" className="md:col-span-2 xl:col-span-1" />
      <Input value={filters.dispositivo} onChange={(event) => setFilter('dispositivo', event.target.value)} placeholder="ID de dispositivo" aria-label="Filtrar por dispositivo" className="font-mono text-xs" autoCapitalize="characters" spellCheck={false} />
      <Select
        aria-label="Filtrar por estado"
        value={filters.estado}
        onChange={(event) => setFilter('estado', event.target.value)}
        options={[
          { value: '', label: 'Todos los estados' },
          { value: '0', label: 'Pendientes' },
          { value: '1', label: 'Atendidos' },
        ]}
      />
      <Select
        aria-label="Filtrar por versión"
        value={filters.version}
        onChange={(event) => setFilter('version', event.target.value)}
        options={[{ value: '', label: 'Todas las versiones' }, ...versions.map((v) => ({ value: v, label: `v${v}` }))]}
      />
      <div className="flex items-center justify-between gap-2 xl:justify-end">
        <span className="text-sm text-fg-muted xl:hidden">{resultCount} resultados</span>
        {isDirty && (
          <Button variant="ghost" size="sm" onClick={reset} leftIcon={<X />}>
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}
