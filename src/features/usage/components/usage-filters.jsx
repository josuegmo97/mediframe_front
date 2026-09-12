import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { Select } from '@/components/ui/select'

export function UsageFilters({ filters, setFilter, reset, isDirty, versions, resultCount }) {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_11rem_auto] md:items-center">
      <SearchInput value={filters.q} onChange={(value) => setFilter('q', value)} placeholder="Dispositivo, código, propietario, equipo…" aria-label="Buscar instalaciones" />
      <Select
        aria-label="Filtrar por licencia"
        value={filters.licencia}
        onChange={(event) => setFilter('licencia', event.target.value)}
        options={[
          { value: '', label: 'Con y sin licencia' },
          { value: 'con', label: 'Con licencia' },
          { value: 'sin', label: 'Sin licencia' },
        ]}
      />
      <Select
        aria-label="Filtrar por versión"
        value={filters.version}
        onChange={(event) => setFilter('version', event.target.value)}
        options={[{ value: '', label: 'Todas las versiones' }, ...versions.map((v) => ({ value: v, label: `v${v}` }))]}
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
