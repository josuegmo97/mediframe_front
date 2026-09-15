import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { Select } from '@/components/ui/select'

export function VoiceReportFilters({ filters, setFilter, reset, isDirty, resultCount }) {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_11rem_auto] md:items-center">
      <SearchInput value={filters.q} onChange={(value) => setFilter('q', value)} placeholder="Dispositivo, código, propietario, notas…" aria-label="Buscar dispositivos" />
      <Select
        aria-label="Filtrar por estado"
        value={filters.estado}
        onChange={(event) => setFilter('estado', event.target.value)}
        options={[
          { value: '', label: 'Todos los estados' },
          { value: 'available', label: 'Disponible' },
          { value: 'blocked', label: 'Bloqueado' },
          { value: 'hidden', label: 'Oculto' },
        ]}
      />
      <Select
        aria-label="Filtrar por habilitación"
        value={filters.habilitado}
        onChange={(event) => setFilter('habilitado', event.target.value)}
        options={[
          { value: '', label: 'Habilitados y no' },
          { value: 'si', label: 'Habilitados' },
          { value: 'no', label: 'No habilitados' },
        ]}
      />
      <div className="flex items-center justify-between gap-2 md:justify-end">
        <span className="text-sm text-fg-muted md:hidden">{resultCount} resultados</span>
        {isDirty && (
          <Button variant="ghost" size="sm" onClick={reset} leftIcon={<X />}>
            Limpiar
          </Button>
        )}
      </div>
    </div>
  )
}
