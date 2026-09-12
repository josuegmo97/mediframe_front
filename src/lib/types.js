/**
 * Tipos de dominio (JSDoc) que devuelve la API. Solo para autocompletado del editor.
 *
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} username
 * @property {string} fullname
 * @property {string} [email]
 * @property {1|2} role        1 = administrador, 2 = espectador
 * @property {0|1} status      0 = inactivo, 1 = activo
 * @property {string} created_at
 * @property {string} updated_at
 *
 * @typedef {Object} License
 * @property {string} _id
 * @property {string} code                16 caracteres (nuevos: 16 dígitos)
 * @property {string|null} device         UUID de la máquina o null si está disponible
 * @property {string|null} description
 * @property {string} owner_name
 * @property {string} owner_phone
 * @property {string} owner_identification
 * @property {string} owner_email
 * @property {string} device_description  "Mac=Model:MacBookPro18,3|ComputerName:X|Arch:arm64"
 * @property {string} version             versión de la app cliente
 * @property {1|2|3} status               1 disponible, 2 en uso, 3 expirada
 * @property {number} days_permission
 * @property {string|null} expired_at
 * @property {number|null} days_remaining
 * @property {{_id: string, username: string, fullname: string}|string} created_by
 * @property {string} created_at
 * @property {string} updated_at
 *
 * @typedef {Object} AtcMessage
 * @property {string} _id
 * @property {string} device
 * @property {string} message
 * @property {string} version
 * @property {0|1} status                 0 pendiente, 1 atendido
 * @property {string} created_at
 *
 * @typedef {Object} UsageLicense
 * @property {string} code
 * @property {string} owner_name
 * @property {string} owner_email
 * @property {string} owner_phone
 * @property {string} owner_identification
 * @property {string} device_description
 * @property {1|2|3} status
 * @property {string} status_text
 * @property {number} days_permission
 * @property {string|null} expired_at
 * @property {number|null} days_remaining
 * @property {string} version
 *
 * @typedef {Object} UsageItem
 * @property {string} device_id
 * @property {string} version
 * @property {'patients'|'histories'|'users'|'pdf'|'flush'} trigger
 * @property {number} patients
 * @property {number} histories
 * @property {number} users
 * @property {number} pdf
 * @property {string} received_at
 * @property {string} created_at
 * @property {string} updated_at
 * @property {UsageLicense|null} license
 *
 * @typedef {Object} Contact
 * @property {string} _id
 * @property {string} name
 * @property {string} specialty
 * @property {string} institution
 * @property {string} email
 * @property {string} phone
 * @property {string} interest
 * @property {0|1} status                 0 pendiente, 1 contactado
 * @property {string} created_at
 */

export {}
