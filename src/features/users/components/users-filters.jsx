import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { Select } from '@/components/ui/select'

export function UsersFilters({ filters, setFilter, reset, isDirty, resultCount }) {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem_12rem_auto] md:items-center">
      <SearchInput value={filters.q} onChange={(value) => setFilter('q', value)} placeholder="Buscar por usuario, nombre o correo" aria-label="Buscar usuarios" />
      <Select
        aria-label="Filtrar por estado"
        value={filters.estado}
        onChange={(event) => setFilter('estado', event.target.value)}
        options={[
          { value: '', label: 'Todos los estados' },
          { value: '1', label: 'Activos' },
          { value: '0', label: 'Pendientes' },
        ]}
      />
      <Select
        aria-label="Filtrar por rol"
        value={filters.rol}
        onChange={(event) => setFilter('rol', event.target.value)}
        options={[
          { value: '', label: 'Todos los roles' },
          { value: '1', label: 'Administradores' },
          { value: '2', label: 'Espectadores' },
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
