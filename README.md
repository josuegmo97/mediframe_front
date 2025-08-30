# MediFrame Dashboard

Dashboard médico profesional con React + Vite + TanStack Query para gestión de usuarios y licencias de dispositivos médicos.

## 🚀 Características

### ✨ Autenticación Completa
- Login con JWT y refresh tokens
- Registro de nuevos usuarios
- Manejo automático de renovación de tokens
- Logout con limpieza de sesión
- Protección de rutas por roles

### 📊 Dashboard Interactivo
- Tarjetas de estadísticas animadas
- Gráficos de tendencias (Area, Bar, Pie)
- Actividad reciente en tiempo real
- Indicadores KPI principales
- Vista responsiva para móviles

### 👥 Gestión de Usuarios
- CRUD completo de usuarios
- Filtros avanzados (búsqueda, estado, rol)
- Paginación del lado del cliente
- Activación/desactivación rápida
- Exportación a CSV
- Modal de edición con validación

### 🔑 Gestión de Licencias
- Creación individual y en lote
- Estados visuales (disponible/en uso/expirada)
- Activación con código de dispositivo
- Verificación de licencias
- Historial de activaciones
- Estadísticas detalladas

### 👤 Perfil de Usuario
- Edición de información personal
- Cambio de contraseña seguro
- Avatar personalizable
- Historial de actividad
- Preferencias del sistema

### 🎨 UI/UX Premium
- Diseño moderno con Tailwind CSS
- Animaciones fluidas con Framer Motion
- Tema de colores médico profesional
- Tipografía Urbanist elegante
- Modo claro optimizado
- Notificaciones toast informativas
- Sidebar colapsable
- Tablas interactivas
- Modales y formularios validados

## 🛠️ Stack Tecnológico

- **React 18.3.1** con Vite 5.4
- **TanStack Query** (React Query) para manejo de estado del servidor
- **Axios** para peticiones HTTP
- **React Router DOM v6** para navegación
- **Tailwind CSS** para estilos
- **Recharts** para gráficos
- **React Hook Form** para formularios
- **Sonner** para notificaciones toast
- **Lucide React** para iconos
- **Date-fns** para manejo de fechas
- **Framer Motion** para animaciones

## 📋 Prerrequisitos

- Node.js 16+ 
- npm o yarn
- Backend API corriendo en `http://localhost:3000`

## 🚀 Instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Edita .env con tus configuraciones
   ```

3. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

4. **Build para producción**
   ```bash
   npm run build
   ```

5. **Preview de producción**
   ```bash
   npm run preview
   ```

## 📁 Estructura del Proyecto

```
src/
├── api/                 # Cliente HTTP y endpoints
│   ├── client.js       # Configuración de Axios
│   ├── auth.js         # Endpoints de autenticación
│   ├── users.js        # Endpoints de usuarios
│   └── licenses.js     # Endpoints de licencias
├── components/         # Componentes reutilizables
│   ├── auth/          # Componentes de autenticación
│   ├── dashboard/     # Componentes del dashboard
│   ├── layout/        # Layout principal
│   ├── licenses/      # Componentes de licencias
│   ├── ui/           # Componentes base
│   └── users/        # Componentes de usuarios
├── hooks/             # Custom hooks
│   └── useAuth.js    # Hook de autenticación
├── pages/            # Páginas principales
│   ├── Login.jsx     # Página de login
│   ├── Dashboard.jsx # Dashboard principal
│   ├── Users.jsx     # Gestión de usuarios
│   ├── Licenses.jsx  # Gestión de licencias
│   └── Profile.jsx   # Perfil de usuario
├── services/         # Servicios
│   └── token.service.js # Manejo de tokens
├── styles/           # Estilos globales
│   └── globals.css   # CSS con Tailwind
├── utils/           # Utilidades
│   └── cn.js       # Función de className
├── App.jsx         # Componente principal
└── main.jsx       # Punto de entrada
```

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build
- `npm run lint` - Linting del código

## 🌐 API Endpoints

### Autenticación
- `POST /auth/login` - Login con username/password
- `POST /auth/register` - Registro de nuevos usuarios
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/verify` - Verificar token actual

### Usuarios
- `GET /users` - Listar todos los usuarios (Solo Admin)
- `GET /users/:id` - Obtener usuario por ID (Solo Admin)
- `GET /users/profile` - Perfil del usuario actual
- `PUT /users/profile` - Actualizar perfil propio
- `PUT /users/:id` - Actualizar usuario (Solo Admin)
- `GET /users/stats` - Estadísticas de usuarios (Solo Admin)

### Licencias
- `POST /licenses` - Crear licencia (Solo Admin)
- `POST /licenses/batch` - Crear múltiples licencias (Solo Admin)
- `GET /licenses` - Listar licencias (Solo Admin)
- `GET /licenses/:id` - Obtener licencia por ID (Solo Admin)
- `DELETE /licenses/:id` - Eliminar licencia (Solo Admin)
- `POST /licenses/activate` - Activar licencia
- `POST /licenses/verify` - Verificar licencia
- `GET /licenses/stats` - Estadísticas de licencias (Solo Admin)

## 👥 Roles y Permisos

- **Admin (role: 1)**: Acceso total al sistema
- **Espectador (role: 2)**: Solo puede ver su perfil y activar licencias
- **Status**: 0 = Inactivo, 1 = Activo

## 📊 Estados de Licencia

- **1** = Disponible
- **2** = En uso
- **3** = Expirada

## 🎨 Tema de Colores

```css
:root {
  /* Backgrounds */
  --color-background: #F1F4F2;
  --color-surface: #FFFFFF;
  
  /* Primary */
  --color-primary: #9DB582;
  --color-on-primary: #FFFFFF;
  
  /* Secondary */
  --color-secondary: #73AFDC;
  --color-on-secondary: #FFFFFF;
  
  /* Tertiary */
  --color-tertiary: #82947B;
  --color-on-tertiary: #FFFFFF;
  
  /* Text */
  --color-text-primary: #2E2E2E;
  --color-text-secondary: #5A5A5A;
  --color-text-accent: #9DB582;
  
  /* States */
  --color-error: #D9534F;
  --color-success: #9DB582;
  --color-warning: #F39C12;
  --color-info: #73AFDC;
}
```

## 📱 Responsive Design

El dashboard está completamente optimizado para:
- **Desktop**: Experiencia completa con sidebar y layout completo
- **Tablet**: Layout adaptativo con navegación optimizada
- **Mobile**: Vista móvil con navegación colapsable

## 🔒 Seguridad

- Sanitización de inputs con Zod
- Validación en cliente y servidor
- Tokens JWT con refresh automático
- Protección XSS y CSRF
- Roles y permisos granulares

## 🚀 Optimizaciones

- Cache inteligente con React Query
- Lazy loading de componentes
- Debounce en búsquedas
- Optimistic updates
- Error boundaries
- Skeleton loaders
- Code splitting automático

## 📝 Notas de Desarrollo

1. **Backend API**: Asegúrate de que el backend esté corriendo en `http://localhost:3000`
2. **CORS**: El backend debe permitir peticiones desde `http://localhost:5173`
3. **Tokens**: Los tokens se almacenan en localStorage
4. **Validación**: Todos los formularios tienen validación con Zod
5. **Accesibilidad**: Componentes con ARIA labels apropiados

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@mediframe.com
- Documentación: [docs.mediframe.com](https://docs.mediframe.com)
- Issues: [GitHub Issues](https://github.com/mediframe/dashboard/issues)

---

**MediFrame Dashboard** - Sistema de Gestión Médica Profesional ⚕️