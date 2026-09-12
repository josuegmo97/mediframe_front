import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Input } from './input'
import { Button } from './button'

/** Input de búsqueda con debounce interno; `onChange` recibe el texto ya "asentado". */
export function SearchInput({ value, onChange, placeholder = 'Buscar…', delay = 250, className, ...props }) {
  const [text, setText] = useState(value ?? '')

  useEffect(() => {
    setText(value ?? '')
  }, [value])

  useEffect(() => {
    if (text === (value ?? '')) return undefined
    const id = setTimeout(() => onChange(text), delay)
    return () => clearTimeout(id)
  }, [text, value, delay, onChange])

  return (
    <Input
      type="search"
      value={text}
      onChange={(event) => setText(event.target.value)}
      placeholder={placeholder}
      leftIcon={<Search />}
      autoComplete="off"
      className={cn('[&::-webkit-search-cancel-button]:hidden', className)}
      rightSlot={
        text ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Limpiar búsqueda"
            onClick={() => {
              setText('')
              onChange('')
            }}
          >
            <X />
          </Button>
        ) : null
      }
      {...props}
    />
  )
}
