/**
 * Parser del campo `device_description` que envía la app de escritorio, p. ej.:
 *   "Mac=Model:MacBookPro18,3|ComputerName:Consultorio 2|Arch:arm64"
 * Tolerante a valores vacíos, sin prefijo de plataforma o con claves faltantes.
 */

const MAC_FAMILIES = [
  ['MacBookPro', 'MacBook Pro'],
  ['MacBookAir', 'MacBook Air'],
  ['MacBook', 'MacBook'],
  ['iMacPro', 'iMac Pro'],
  ['iMac', 'iMac'],
  ['Macmini', 'Mac mini'],
  ['MacPro', 'Mac Pro'],
  ['MacStudio', 'Mac Studio'],
  ['Mac', 'Mac'],
]

export function humanizeMacModel(model) {
  if (!model) return null
  const text = String(model).trim()
  if (!text) return null
  const match = text.match(/^([A-Za-z]+?)(\d+),(\d+)$/)
  if (!match) return { family: text, label: text, generation: null }
  const [, prefix, major, minor] = match
  const family = (MAC_FAMILIES.find(([key]) => key === prefix) || [null, prefix])[1]
  return { family, label: `${family} (${major},${minor})`, generation: `${major},${minor}` }
}

export function parseDeviceDescription(raw) {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  const eq = trimmed.indexOf('=')
  const platform = eq > 0 ? trimmed.slice(0, eq).trim() : null
  const rest = eq > 0 ? trimmed.slice(eq + 1) : trimmed

  const fields = {}
  rest.split('|').forEach((part) => {
    const idx = part.indexOf(':')
    if (idx > 0) {
      fields[part.slice(0, idx).trim().toLowerCase()] = part.slice(idx + 1).trim()
    }
  })

  const model = fields.model || null
  const humanized = humanizeMacModel(model)
  const computerName = fields.computername || null
  const arch = fields.arch || null
  const isParsed = Boolean(model || computerName || arch)

  return {
    platform,
    model,
    modelFamily: humanized?.family ?? null,
    modelLabel: humanized?.label ?? null,
    computerName,
    arch,
    raw: trimmed,
    isParsed,
  }
}

/**
 * Etiqueta corta para listados: "MacBook Pro (18,3) · Consultorio 2".
 * Si no se puede parsear devuelve el texto original o `fallback`.
 */
export function deviceLabel(raw, fallback = null) {
  const parsed = parseDeviceDescription(raw)
  if (!parsed) return fallback
  if (!parsed.isParsed) return parsed.raw || fallback
  const parts = [parsed.modelLabel ?? parsed.model, parsed.computerName].filter(Boolean)
  return parts.length ? parts.join(' · ') : parsed.raw || fallback
}

/** Normaliza un identificador de dispositivo como lo hace el backend: trim, sin llaves, mayúsculas. */
export function normalizeDeviceId(value) {
  return String(value ?? '').trim().replace(/[{}]/g, '').toUpperCase()
}
