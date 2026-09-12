import { Brand } from '@/components/layout/brand'
import { ThemeToggle } from '@/components/theme/theme-toggle'

const HIGHLIGHTS = [
  'Gestiona usuarios, licencias e instalaciones desde un solo lugar.',
  'Revisa los mensajes de soporte y los contactos de la web.',
  'Datos en tiempo real de las Mac con MediFrame activo.',
]

/** Shell de páginas públicas: panel de marca (≥ lg) + tarjeta del formulario. */
export function AuthLayout({ title, description, children, footer }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-bg lg:flex-row">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <aside className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-[#6f8c5b] to-tertiary p-12 text-white lg:flex dark:from-[#2c3a25] dark:via-[#33452b] dark:to-[#1f2a1b]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-secondary/25 blur-3xl" aria-hidden="true" />
        <Brand size="lg" inverted />
        <div className="relative space-y-6">
          <h2 className="text-3xl font-semibold leading-tight text-balance">Panel de administración de MediFrame</h2>
          <ul className="space-y-3 text-base text-white/85">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/80" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/70">© {new Date().getFullYear()} Optitronic</p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="mb-8 lg:hidden">
          <Brand size="lg" />
        </div>
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-card dark:shadow-none sm:p-8">
          <header className="mb-6 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-fg">{title}</h1>
            {description && <p className="text-sm text-fg-muted">{description}</p>}
          </header>
          {children}
        </div>
        {footer && <div className="mt-6 text-center text-sm text-fg-muted">{footer}</div>}
      </main>
    </div>
  )
}
