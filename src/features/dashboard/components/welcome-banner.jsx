import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Avatar } from '@/components/ui/avatar'
import { RoleBadge } from '@/features/users/components/user-badges'

function greeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function WelcomeBanner({ user, children }) {
  const today = format(new Date(), "EEEE d 'de' MMMM", { locale: es })
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card dark:shadow-none sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-center gap-4">
        <Avatar name={user?.fullname} size="lg" />
        <div>
          <p className="text-xs capitalize text-fg-muted">{today}</p>
          <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">
            {greeting()}, {user?.fullname?.split(' ')[0] ?? user?.username}
          </h1>
          <div className="mt-1">
            <RoleBadge role={user?.role} />
          </div>
        </div>
      </div>
      {children}
    </section>
  )
}
