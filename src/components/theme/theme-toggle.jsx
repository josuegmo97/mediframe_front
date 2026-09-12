import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { useTheme } from './theme-provider'

export function ThemeToggle({ className }) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const dark = resolvedTheme === 'dark'
  const label = dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
  return (
    <Tooltip content={label}>
      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={label} className={className}>
        {dark ? <Sun /> : <Moon />}
      </Button>
    </Tooltip>
  )
}
