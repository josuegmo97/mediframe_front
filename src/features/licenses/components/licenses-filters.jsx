import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export function LicensesFilters({ filters, setFilter, reset, isDirty, days, resultCount }) {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_10rem_auto_auto] md:items-center">
      <SearchInput value={filters.q} onChange={(value) => setFilter('q', value)} placeholder="Código, propietario, correo, dispositivo…" aria-label="Buscar licencias" />
      <Select
        aria-label="Filtrar por estado"
        value={filters.estado}
        onChange={(event) => setFilter('estado', event.target.value)}
        options={[
          { value: '', label: 'Todos los estados' },
          { value: '1', label: 'Disponibles' },
          { value: '2', label: 'En uso' },
          { value: '3', label: 'Expiradas' },
        ]}
      />
      <Select
        aria-label="Filtrar por días de permiso"
        value={filters.dias}
        onChange={(event) => setFilter('dias', event.target.value)}
        options={[{ value: '', label: 'Todos los días' }, ...days.map((d) => ({ value: String(d), label: `${d} días` }))]}
      />
      <Switch checked={filters.pronto === '1'} onCheckedChange={(checked) => setFilter('pronto', checked ? '1' : '')} label="Vencen pronto" />
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
