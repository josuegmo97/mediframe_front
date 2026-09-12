import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { Select } from '@/components/ui/select'

export function ContactsFilters({ filters, setFilter, reset, isDirty, resultCount }) {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_auto] md:items-center">
      <SearchInput value={filters.q} onChange={(value) => setFilter('q', value)} placeholder="Nombre, correo, institución, especialidad…" aria-label="Buscar contactos" />
      <Select
        aria-label="Filtrar por estado"
        value={filters.estado}
        onChange={(event) => setFilter('estado', event.target.value)}
        options={[
          { value: '', label: 'Todos los estados' },
          { value: '0', label: 'Pendientes' },
          { value: '1', label: 'Contactados' },
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
