import { Contact, FileCheck2, KeyRound, LayoutDashboard, LifeBuoy, Mic, MonitorSmartphone, PauseCircle, UserCircle, Users } from 'lucide-react'

/** Única fuente de verdad de la navegación. `adminOnly` oculta el item a espectadores. */
export const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/usuarios', label: 'Usuarios', icon: Users, adminOnly: true },
  { to: '/licencias', label: 'Licencias', icon: KeyRound, adminOnly: true },
  { to: '/licencias-en-pausa', label: 'Licencias en pausa', icon: PauseCircle, adminOnly: true },
  { to: '/terminos', label: 'Términos y condiciones', icon: FileCheck2, adminOnly: true },
  { to: '/instalaciones', label: 'Instalaciones', icon: MonitorSmartphone, adminOnly: true },
  { to: '/dictado', label: 'Dictado por voz', icon: Mic, adminOnly: true },
  { to: '/soporte', label: 'Soporte', icon: LifeBuoy, adminOnly: true },
  { to: '/contactos', label: 'Contactos', icon: Contact, adminOnly: true },
  { to: '/perfil', label: 'Mi perfil', icon: UserCircle },
]

export function getNavItems(isAdmin) {
  return NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)
}
