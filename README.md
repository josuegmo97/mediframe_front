# MediFrame Admin

Panel de administración web de **MediFrame** (Optitronic). Lo usa el equipo de Optitronic para gestionar
las cuentas del panel, las licencias de la app de escritorio, la telemetría de las instalaciones, los
mensajes de soporte y los contactos que llegan desde la web.

Consume la API Lambda [`mediframe_lambda_backend`](https://github.com/josuegmo97/mediframe_lambda_backend)
(`https://api.optitronic.net/api` en producción).

## Stack

- React 18 + Vite 5 (JavaScript/JSX)
- Tailwind CSS 3 con tokens de color en CSS variables (modo claro/oscuro)
- TanStack Query 5 (cache y mutaciones), axios
- React Router 6, react-hook-form + zod
- Radix UI (diálogos, menús, tooltips accesibles), lucide-react, sonner, recharts, date-fns
- Vitest para las utilidades puras de `src/lib`

## Puesta en marcha

```bash
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:3000/api
npm run dev               # http://localhost:5173
```

Scripts:

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | ESLint (sin avisos permitidos) |
| `npm run test` | Tests unitarios (vitest) |
| `npm run check` | lint + test + build |

Variables de entorno:

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API **incluyendo** `/api`. Local: `http://localhost:3000/api`. Producción: `https://api.optitronic.net/api`. |

## Estructura

```
src/
├── app/            providers (query, tema, auth, toasts), router, error boundary
├── api/            cliente axios (http.js) y un módulo por recurso (*.api.js)
├── components/
│   ├── ui/         primitivas del design system (Button, Input, Dialog, DataTable, …)
│   ├── charts/     helpers de recharts (tema, tooltip, ChartCard con vista de tabla)
│   ├── layout/     AppShell, Sidebar, Topbar, drawer móvil, menú de usuario
│   └── theme/      ThemeProvider (claro / oscuro / sistema)
├── features/       una carpeta por dominio: auth, users, licenses, usage, atc, contacts, dashboard, profile
│   └── <feature>/  *.queries.js (TanStack Query), *.utils.js (filtros, CSV), schemas.js (zod), components/
├── hooks/          useListFilters (filtros en la URL), usePagination, useMediaQuery, …
├── lib/            utilidades puras: api-error (normalización de errores), jwt, csv, format,
│                   license-code, device-description, constants, query-keys, query-client
├── pages/          una página por ruta (lazy)
└── styles/         globals.css con los tokens
```

Rutas: `/ingresar`, `/registro`, `/` (inicio), `/usuarios`, `/licencias`, `/licencias/:id`,
`/instalaciones`, `/instalaciones/:deviceId`, `/soporte`, `/soporte/:id`, `/contactos`, `/perfil`.
Las rutas del panel anterior (`/login`, `/dashboard`, `/users`, …) redirigen a las nuevas.

## Roles

| Rol | Valor | Acceso |
|---|---|---|
| Administrador | `role: 1` (con `status: 1`) | Todo el panel |
| Espectador | `role: 2` | Solo Inicio y Mi perfil |

Los registros públicos (`/registro`) quedan con `status: 0` (pendiente) hasta que un administrador
los active desde Usuarios.

## Restricciones de la API que condicionan el diseño

- **JWT de 15 minutos sin refresh token.** El panel renueva el token con `POST /auth/refresh`
  un minuto antes de que expire, solo con la pestaña visible y una única vez por token
  (`src/features/auth/session-manager.js`). Un token vencido se descarta sin llamar a la red.
- **`/api/auth` limita a 5 respuestas fallidas cada 15 minutos por IP.** Por eso los formularios
  validan en cliente exactamente lo mismo que el servidor, el refresh nunca se reintenta tras un
  401 y el logout es solo local.
- **Los listados no tienen paginación.** Cada lista se descarga una vez, se guarda en cache
  (10 min para licencias/soporte/telemetría/contactos, 2 min para usuarios) y se filtra, ordena y
  pagina en el cliente. El botón "Actualizar" tiene un enfriamiento de 60 s.
- **`status` y `role` deben viajar como números JSON** en los `PUT`/`PATCH`; los módulos de
  `src/api` lo garantizan.
- **No existe "crear usuario" para administradores:** se usa `POST /auth/register` y después
  `PUT /users/:id` para fijar rol y estado.
- **Las licencias no se editan ni se revocan** por API; solo se crean (individual o en lote) y se
  eliminan cuando siguen disponibles. La activación, verificación y transferencia las hace la app
  de escritorio con HMAC y no son accesibles desde el navegador.

## Despliegue en Vercel

`vercel.json` ya incluye el rewrite de SPA y cabeceras de cache/seguridad.

```bash
npx vercel login
npx vercel link                              # proyecto nuevo: mediframe-admin
npx vercel env add VITE_API_URL production   # https://api.optitronic.net/api
npx vercel env add VITE_API_URL preview      # (misma URL o la de staging)
npx vercel --prod
```

Para auto-deploys desde GitHub: `npx vercel git connect`.

## Licencia

Propietario. © Optitronic.
