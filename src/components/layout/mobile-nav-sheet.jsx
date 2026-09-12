import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { APP_VERSION } from '@/lib/constants'
import { Brand } from './brand'
import { NavList } from './nav-list'

/** Navegación en drawer para < lg. Se cierra al navegar. */
export function MobileNavSheet() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú de navegación">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(85vw,18rem)]">
        <SheetTitle className="sr-only">Navegación</SheetTitle>
        <SheetDescription className="sr-only">Secciones del panel de administración</SheetDescription>
        <div className="flex h-16 items-center px-5">
          <Brand to="/" />
        </div>
        <NavList className="flex-1 overflow-y-auto px-3 py-2" onNavigate={() => setOpen(false)} />
        <p className="border-t border-border px-5 py-3 text-[11px] text-fg-subtle safe-bottom">v{APP_VERSION}</p>
      </SheetContent>
    </Sheet>
  )
}
