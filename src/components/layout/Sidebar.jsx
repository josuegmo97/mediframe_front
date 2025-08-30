import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Shield,
  Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { currentUser, logout, isAdmin } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: 'Usuarios',
      href: '/users',
      icon: Users,
      show: isAdmin,
    },
    {
      name: 'Licencias',
      href: '/licenses',
      icon: CreditCard,
      show: isAdmin,
    },
    {
      name: 'Mi Perfil',
      href: '/profile',
      icon: User,
      show: true,
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="bg-surface border-r border-border h-screen flex flex-col relative"
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <motion.div
            initial={false}
            animate={{ opacity: isCollapsed ? 0 : 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-primary text-sm font-bold">
                M
              </div>
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-text-primary">MediFrame</h2>
                <p className="text-xs text-text-secondary">v1.0.0</p>
              </div>
            )}
          </motion.div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
              {currentUser?.fullname?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-text-primary">
                {currentUser?.fullname}
              </p>
              <p className="text-xs text-text-secondary">
                {isAdmin ? 'Administrador' : 'Espectador'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.filter(item => item.show).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-background hover:text-text-primary'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.name}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border space-y-1">
        <button
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-background hover:text-text-primary transition-all w-full"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Configuración</span>}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-error hover:bg-error hover:bg-opacity-10 transition-all w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </div>

      {/* Activity Indicator */}
      {!isCollapsed && (
        <div className="px-4 pb-4">
          <div className="bg-background rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-success" />
              <span className="text-xs font-semibold text-text-primary">
                Sistema Operativo
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>CPU: 23%</span>
              <span>RAM: 4.2GB</span>
              <span>Red: OK</span>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}