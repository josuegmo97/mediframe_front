import { useState } from 'react';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const { currentUser, isAdmin } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <header className="bg-surface border-b border-border h-16 flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Buscar en el sistema..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 hover:bg-background rounded-lg transition-colors"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 hover:bg-background rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-text-primary">
              {currentUser?.fullname}
            </p>
            <p className="text-xs text-text-secondary">
              {isAdmin ? 'Administrador' : 'Espectador'}
            </p>
          </div>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
            {currentUser?.fullname?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}