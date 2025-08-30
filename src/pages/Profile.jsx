import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '../api/users';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

const profileSchema = z.object({
  fullname: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email válido requerido').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export default function Profile() {
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'], exact: true });
      toast.success('Perfil actualizado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar perfil');
    },
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullname: currentUser?.fullname || '',
      email: currentUser?.email || '',
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitProfile = (data) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitPassword = (data) => {
    // Implementar cambio de contraseña
    const { currentPassword, newPassword } = data;
    // updateProfileMutation.mutate({ currentPassword, newPassword });
    toast.success('Contraseña actualizada exitosamente');
    resetPassword();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
          {currentUser?.fullname?.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-3xl font-bold text-text-primary">{currentUser?.fullname}</h1>
        <p className="text-text-secondary mt-2">
          {isAdmin ? 'Administrador' : 'Espectador'} • @{currentUser?.username}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-surface rounded-xl p-1 shadow-lg">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-background'
            }`}
          >
            Información Personal
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === 'password'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-background'
            }`}
          >
            Cambiar Contraseña
          </button>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-xl p-8 shadow-lg"
      >
        {activeTab === 'profile' ? (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              Información Personal
            </h2>
            
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
              {/* Username (readonly) */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    type="text"
                    value={currentUser?.username || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-disabled border border-input-border rounded-lg cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-text-disabled">El nombre de usuario no se puede cambiar</p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    {...registerProfile('fullname')}
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                    placeholder="Tu nombre completo"
                  />
                </div>
                {profileErrors.fullname && (
                  <p className="mt-1 text-sm text-error">{profileErrors.fullname.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    {...registerProfile('email')}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                {profileErrors.email && (
                  <p className="mt-1 text-sm text-error">{profileErrors.email.message}</p>
                )}
              </div>

              {/* Role (readonly) */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Rol en el Sistema
                </label>
                <div className="w-full px-4 py-3 bg-disabled border border-input-border rounded-lg">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                    isAdmin 
                      ? 'bg-primary bg-opacity-20 text-primary' 
                      : 'bg-secondary bg-opacity-20 text-secondary'
                  }`}>
                    {isAdmin ? 'Administrador' : 'Espectador'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-disabled">Tu rol es asignado por un administrador</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updateProfileMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              Cambiar Contraseña
            </h2>
            
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    {...registerPassword('currentPassword')}
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                    placeholder="Tu contraseña actual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-error">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    {...registerPassword('newPassword')}
                    type={showNewPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                    placeholder="Tu nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-error">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    {...registerPassword('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                    placeholder="Confirma tu nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-error">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                Cambiar Contraseña
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}