import { lazy } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { PublicOnly, RequireAdmin, RequireAuth } from '@/features/auth/guards'
import { RouteErrorPage } from '@/app/route-error'
import NotFoundPage from '@/pages/not-found-page'

const LoginPage = lazy(() => import('@/pages/login-page'))
const RegisterPage = lazy(() => import('@/pages/register-page'))
const DashboardPage = lazy(() => import('@/pages/dashboard-page'))
const ProfilePage = lazy(() => import('@/pages/profile-page'))
const UsersPage = lazy(() => import('@/pages/users-page'))
const LicensesPage = lazy(() => import('@/pages/licenses-page'))
const LicenseDetailPage = lazy(() => import('@/pages/license-detail-page'))
const InstallationsPage = lazy(() => import('@/pages/installations-page'))
const InstallationDetailPage = lazy(() => import('@/pages/installation-detail-page'))
const SupportPage = lazy(() => import('@/pages/support-page'))
const SupportDetailPage = lazy(() => import('@/pages/support-detail-page'))
const ContactsPage = lazy(() => import('@/pages/contacts-page'))
const VoiceReportsPage = lazy(() => import('@/pages/voice-reports-page'))
const VoiceReportDevicePage = lazy(() => import('@/pages/voice-report-device-page'))

const redirect = (from, to) => ({ path: from, element: <Navigate to={to} replace /> })

export const router = createBrowserRouter([
  {
    element: <PublicOnly />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: '/ingresar', element: <LoginPage />, handle: { title: 'Ingresar' } },
      { path: '/registro', element: <RegisterPage />, handle: { title: 'Crear cuenta' } },
    ],
  },
  {
    element: <RequireAuth />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage />, handle: { title: 'Inicio' } },
          { path: 'perfil', element: <ProfilePage />, handle: { title: 'Mi perfil' } },
          {
            element: <RequireAdmin />,
            children: [
              { path: 'usuarios', element: <UsersPage />, handle: { title: 'Usuarios' } },
              { path: 'licencias', element: <LicensesPage />, handle: { title: 'Licencias' } },
              { path: 'licencias/:id', element: <LicenseDetailPage />, handle: { title: 'Detalle de licencia' } },
              { path: 'instalaciones', element: <InstallationsPage />, handle: { title: 'Instalaciones' } },
              { path: 'instalaciones/:deviceId', element: <InstallationDetailPage />, handle: { title: 'Detalle de instalación' } },
              { path: 'soporte', element: <SupportPage />, handle: { title: 'Soporte' } },
              { path: 'soporte/:id', element: <SupportDetailPage />, handle: { title: 'Mensaje de soporte' } },
              { path: 'contactos', element: <ContactsPage />, handle: { title: 'Contactos' } },
              { path: 'dictado', element: <VoiceReportsPage />, handle: { title: 'Dictado por voz' } },
              { path: 'dictado/:deviceId', element: <VoiceReportDevicePage />, handle: { title: 'Dispositivo · Dictado por voz' } },
            ],
          },
          { path: '*', element: <NotFoundPage />, handle: { title: 'No encontrado' } },
        ],
      },
    ],
  },
  // Rutas heredadas del panel anterior
  redirect('/login', '/ingresar'),
  redirect('/register', '/registro'),
  redirect('/dashboard', '/'),
  redirect('/users', '/usuarios'),
  redirect('/licenses', '/licencias'),
  redirect('/profile', '/perfil'),
])
