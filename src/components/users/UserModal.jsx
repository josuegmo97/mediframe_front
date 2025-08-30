import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Mail, Shield, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const createUserSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  fullname: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email válido requerido').optional().or(z.literal('')),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.number().int().min(1).max(2),
  status: z.number().int().min(0).max(1),
});

const updateUserSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  fullname: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email válido requerido').optional().or(z.literal('')),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  role: z.number().int().min(1).max(2),
  status: z.number().int().min(0).max(1),
});

export default function UserModal({ user, isOpen, onClose, onSave }) {
  const { currentUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(user ? updateUserSchema : createUserSchema),
    defaultValues: user ? {
      username: user.username,
      fullname: user.fullname,
      email: user.email || '',
      password: '',
      role: user.role,
      status: user.status,
    } : {
      username: '',
      fullname: '',
      email: '',
      password: '',
      role: 2,
      status: 1,
    }
  });

  const onSubmit = (data) => {
    // Si es edición y password está vacío, no enviarlo
    const cleanData = { ...data };
    if (user && !cleanData.password) {
      delete cleanData.password;
    }
    onSave(cleanData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface rounded-xl shadow-xl w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Usuario
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                {...register('username')}
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                placeholder="Nombre de usuario"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-error">{errors.username.message}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                {...register('fullname')}
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                placeholder="Nombre completo"
              />
            </div>
            {errors.fullname && (
              <p className="mt-1 text-sm text-error">{errors.fullname.message}</p>
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
                {...register('email')}
                type="email"
                className="w-full pl-10 pr-4 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                placeholder="correo@ejemplo.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-error">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Contraseña {!user && <span className="text-error">*</span>}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                {...register('password')}
                type="password"
                className="w-full pl-10 pr-4 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                placeholder={user ? "Dejar vacío para mantener actual" : "Mínimo 6 caracteres"}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-error">{errors.password.message}</p>
            )}
            {!user && (
              <p className="mt-1 text-sm text-text-secondary">
                La contraseña debe tener al menos 6 caracteres
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Rol
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <select
                {...register('role', { valueAsNumber: true })}
                className="w-full pl-10 pr-4 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
              >
                <option value={1}>Administrador</option>
                <option value={2}>Espectador</option>
              </select>
            </div>
            {errors.role && (
              <p className="mt-1 text-sm text-error">{errors.role.message}</p>
            )}
          </div>

          {/* Status - Only show for editing and not for current user */}
          {user && user._id !== currentUser?._id && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Estado
              </label>
              <select
                {...register('status', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-error">{errors.status.message}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-background transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              {user ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}