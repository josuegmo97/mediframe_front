import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Key, Shield, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { activateLicense, verifyLicense } from '../api/licenses';
import { toast } from 'sonner';

const activationSchema = z.object({
  licenseKey: z.string()
    .min(1, 'Clave de licencia requerida')
    .regex(/^[A-Z0-9-]{19}$/, 'Formato de clave inválido (ej: ABCD-1234-EFGH-5678)'),
  deviceId: z.string().min(1, 'ID de dispositivo requerido'),
});

export default function ActivateLicense() {
  const [step, setStep] = useState('input'); // 'input', 'success', 'error'
  const [activatedLicense, setActivatedLicense] = useState(null);

  const activateMutation = useMutation({
    mutationFn: activateLicense,
    onSuccess: (data) => {
      setActivatedLicense(data);
      setStep('success');
      toast.success('¡Licencia activada exitosamente!');
    },
    onError: (error) => {
      setStep('error');
      toast.error(error.response?.data?.message || 'Error al activar la licencia');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    resolver: zodResolver(activationSchema),
  });

  const licenseKey = watch('licenseKey', '');

  const onSubmit = (data) => {
    activateMutation.mutate(data);
  };

  const handleNewActivation = () => {
    setStep('input');
    setActivatedLicense(null);
    reset();
  };

  const formatLicenseKey = (value) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    
    // Add hyphens every 4 characters
    const formatted = cleaned.replace(/(.{4})/g, '$1-').slice(0, 19);
    
    return formatted;
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-4">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Activar Licencia</h1>
        <p className="text-text-secondary mt-2">
          Activa tu dispositivo médico con una clave de licencia válida
        </p>
      </div>

      {step === 'input' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-xl p-8 shadow-lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* License Key */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Clave de Licencia
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  {...register('licenseKey')}
                  type="text"
                  value={formatLicenseKey(licenseKey)}
                  onChange={(e) => {
                    const formatted = formatLicenseKey(e.target.value);
                    e.target.value = formatted;
                    register('licenseKey').onChange(e);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors font-mono text-center text-lg tracking-wider"
                  placeholder="ABCD-1234-EFGH-5678"
                  maxLength="19"
                />
              </div>
              {errors.licenseKey && (
                <p className="mt-1 text-sm text-error">{errors.licenseKey.message}</p>
              )}
              <p className="mt-1 text-xs text-text-disabled">
                Ingresa la clave de 16 caracteres proporcionada por tu administrador
              </p>
            </div>

            {/* Device ID */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                ID del Dispositivo
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  {...register('deviceId')}
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                  placeholder="Ej: MED-2024-001"
                />
              </div>
              {errors.deviceId && (
                <p className="mt-1 text-sm text-error">{errors.deviceId.message}</p>
              )}
              <p className="mt-1 text-xs text-text-disabled">
                Identificador único de tu dispositivo médico
              </p>
            </div>

            {/* Info Card */}
            <div className="bg-info bg-opacity-10 border border-info border-opacity-20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-semibold text-info mb-1">Información importante</h4>
                  <ul className="text-text-secondary space-y-1 list-disc list-inside ml-2">
                    <li>La clave de licencia es de un solo uso</li>
                    <li>Una vez activada, quedará vinculada a este dispositivo</li>
                    <li>Verifica que los datos sean correctos antes de continuar</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={activateMutation.isPending}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {activateMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Activar Licencia
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {step === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-xl p-8 shadow-lg text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-success rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            ¡Licencia Activada!
          </h2>
          
          <p className="text-text-secondary mb-6">
            Tu dispositivo ha sido activado exitosamente y está listo para usar.
          </p>

          {activatedLicense && (
            <div className="bg-background rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-text-primary mb-4">Detalles de Activación</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Clave de Licencia:</span>
                  <code className="bg-surface px-2 py-1 rounded font-mono text-sm">
                    {activatedLicense.license_key}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">ID Dispositivo:</span>
                  <span className="font-semibold">{activatedLicense.device_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Fecha de Activación:</span>
                  <span className="font-semibold">
                    {new Date().toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {activatedLicense.expires_at && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Fecha de Expiración:</span>
                    <span className="font-semibold">
                      {new Date(activatedLicense.expires_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleNewActivation}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-opacity-90 transition-all"
          >
            Activar Otra Licencia
          </button>
        </motion.div>
      )}

      {step === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-xl p-8 shadow-lg text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-error rounded-full mb-6">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Error en la Activación
          </h2>
          
          <p className="text-text-secondary mb-6">
            No se pudo activar la licencia. Verifica que la clave sea válida y el dispositivo no esté ya activado.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleNewActivation}
              className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-opacity-90 transition-all"
            >
              Intentar de Nuevo
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}