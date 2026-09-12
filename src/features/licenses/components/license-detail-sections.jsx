import { Link } from 'react-router-dom'
import { Activity, LifeBuoy, MonitorSmartphone, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DescriptionList } from '@/components/ui/description-list'
import { LICENSE_STATUS } from '@/lib/constants'
import { parseDeviceDescription } from '@/lib/device-description'
import { formatDate, formatDateTime, formatNumber, formatRelative, shortId } from '@/lib/format'
import { effectiveLicenseStatus, licenseDaysRemaining } from '@/lib/license-code'
import { approximateActivationDate, createdByLabel } from '../licenses.utils'
import { AtcStatusBadge } from '@/features/atc/components/atc-status-badge'

function VigenciaCard({ license }) {
  const status = effectiveLicenseStatus(license)
  const days = licenseDaysRemaining(license)
  const total = Number(license.days_permission) || 0
  const used = days != null ? Math.max(0, total - days) : total
  const percent = total ? Math.min(100, Math.round((used / total) * 100)) : 0
  const activation = approximateActivationDate(license)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vigencia</CardTitle>
        <CardDescription>
          {status === LICENSE_STATUS.AVAILABLE && 'La licencia aún no ha sido activada; los días empiezan a contar al activarla.'}
          {status === LICENSE_STATUS.IN_USE && `Quedan ${days} de ${total} días.`}
          {status === LICENSE_STATUS.EXPIRED && 'La licencia expiró. Las licencias expiradas no se pueden reactivar ni eliminar.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status !== LICENSE_STATUS.AVAILABLE && (
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-fg-muted">
              <span>Días consumidos</span>
              <span className="tabular-nums">{formatNumber(used)} / {formatNumber(total)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-accent/20" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Porcentaje de vigencia consumido">
              <div className={status === LICENSE_STATUS.EXPIRED ? 'h-full bg-danger' : percent >= 90 ? 'h-full bg-warning' : 'h-full bg-primary'} style={{ width: `${percent}%` }} />
            </div>
          </div>
        )}
        <DescriptionList
          items={[
            { label: 'Días de permiso', value: `${formatNumber(total)} días` },
            { label: 'Activada (aprox.)', value: activation ? formatDate(activation) : null, hint: activation ? 'Calculada como expiración − días de permiso' : undefined },
            { label: 'Expira', value: license.expired_at ? `${formatDateTime(license.expired_at)} (${formatRelative(license.expired_at)})` : null },
            { label: 'Días restantes', value: days != null ? `${formatNumber(days)} días` : null },
          ]}
        />
      </CardContent>
    </Card>
  )
}

export function LicenseDetailSections({ license, usageItem, atcMessages, atcLoaded }) {
  const status = effectiveLicenseStatus(license)
  const activated = status !== LICENSE_STATUS.AVAILABLE
  const device = parseDeviceDescription(license.device_description)

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Licencia</CardTitle>
        </CardHeader>
        <CardContent>
          <DescriptionList
            items={[
              { label: 'Código', value: license.code, mono: true, copyable: true },
              { label: 'Descripción', value: license.description, span: true },
              { label: 'Creada por', value: createdByLabel(license) },
              { label: 'Creada el', value: formatDateTime(license.created_at) },
              { label: 'Última actualización', value: formatDateTime(license.updated_at) },
            ]}
          />
        </CardContent>
      </Card>

      <VigenciaCard license={license} />

      <Card>
        <CardHeader className="flex-row items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-fg-muted">
            <User className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>Propietario</CardTitle>
            <CardDescription>Datos enviados por la app al activar.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {activated ? (
            <DescriptionList
              items={[
                { label: 'Nombre', value: license.owner_name },
                { label: 'Identificación', value: license.owner_identification, copyable: true },
                { label: 'Teléfono', value: license.owner_phone, href: license.owner_phone ? `tel:${license.owner_phone}` : undefined },
                { label: 'Correo', value: license.owner_email, href: license.owner_email ? `mailto:${license.owner_email}` : undefined },
              ]}
            />
          ) : (
            <p className="text-sm text-fg-muted">Esta licencia aún no ha sido activada, por lo que no tiene propietario asociado.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-fg-muted">
            <MonitorSmartphone className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>Dispositivo</CardTitle>
            <CardDescription>Mac donde está activa la licencia.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activated && license.device ? (
            <>
              <DescriptionList
                items={[
                  { label: 'Identificador', value: license.device, mono: true, copyable: true, span: true },
                  { label: 'Modelo', value: device?.modelLabel ?? device?.model ?? (device?.isParsed === false ? device.raw : null) },
                  { label: 'Nombre del equipo', value: device?.computerName },
                  { label: 'Arquitectura', value: device?.arch },
                  { label: 'Versión de la app', value: license.version },
                ]}
              />
              {license.device_description && (
                <details className="text-xs text-fg-subtle">
                  <summary className="cursor-pointer select-none hover:text-fg">Descripción original</summary>
                  <code className="mt-1 block break-all rounded bg-surface-2 p-2 font-mono">{license.device_description}</code>
                </details>
              )}
            </>
          ) : (
            <p className="text-sm text-fg-muted">Sin dispositivo asociado.</p>
          )}
        </CardContent>
      </Card>

      {activated && license.device && (
        <>
          <Card>
            <CardHeader className="flex-row items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-fg-muted">
                <Activity className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <CardTitle>Telemetría</CardTitle>
                <CardDescription>Contadores reportados por esta instalación.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {usageItem ? (
                <div className="space-y-4">
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ['Pacientes', usageItem.patients],
                      ['Historias', usageItem.histories],
                      ['Usuarios', usageItem.users],
                      ['PDF', usageItem.pdf],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg bg-surface-2 p-3">
                        <dt className="text-xs text-fg-muted">{label}</dt>
                        <dd className="text-xl font-semibold text-fg">{formatNumber(value)}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="text-xs text-fg-subtle">
                    Última sincronización {formatRelative(usageItem.received_at)} · versión {usageItem.version}
                  </p>
                  <Button asChild variant="link" size="sm" className="h-auto p-0">
                    <Link to={`/instalaciones/${encodeURIComponent(license.device)}`}>Ver instalación</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-fg-muted">
                  No hay telemetría guardada para este dispositivo.{' '}
                  <Link to="/instalaciones" className="text-primary underline-offset-2 hover:underline">
                    Ver instalaciones
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-fg-muted">
                <LifeBuoy className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <CardTitle>Soporte</CardTitle>
                <CardDescription>Mensajes enviados desde este dispositivo.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {!atcLoaded ? (
                <Button asChild variant="outline" size="sm">
                  <Link to={`/soporte?dispositivo=${encodeURIComponent(license.device)}`}>Ver mensajes de este dispositivo</Link>
                </Button>
              ) : atcMessages.length === 0 ? (
                <p className="text-sm text-fg-muted">Este dispositivo no ha enviado mensajes de soporte.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {atcMessages.slice(0, 5).map((message) => (
                    <li key={message._id} className="py-2.5 first:pt-0 last:pb-0">
                      <Link to={`/soporte/${message._id}`} className="group block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-fg-subtle">{formatDateTime(message.created_at)}</span>
                          <AtcStatusBadge status={message.status} />
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-fg group-hover:text-primary">{message.message}</p>
                      </Link>
                    </li>
                  ))}
                  {atcMessages.length > 5 && (
                    <li className="pt-2.5">
                      <Link to={`/soporte?dispositivo=${encodeURIComponent(license.device)}`} className="text-sm text-primary underline-offset-2 hover:underline">
                        Ver los {atcMessages.length} mensajes ({shortId(license.device)})
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
