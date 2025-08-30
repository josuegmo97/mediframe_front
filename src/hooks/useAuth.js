import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import * as authAPI from '../api/auth';
import { setTokens, clearAll, hasValidTokens, setUserData, getUserData } from '../services/token.service';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Estado local para el usuario que persiste independientemente de React Query
  const [persistedUser, setPersistedUser] = useState(() => getUserData());
  
  // Sincronizar persistedUser si localStorage cambia externamente
  useEffect(() => {
    const storedUser = getUserData();
    if (storedUser && JSON.stringify(storedUser) !== JSON.stringify(persistedUser)) {
      setPersistedUser(storedUser);
    }
  }, [persistedUser]);

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      const { token, user } = data.data;
      setTokens(token, token);
      setUserData(user);
      setPersistedUser(user);
      queryClient.setQueryData(['currentUser'], user);
      toast.success('¡Bienvenido de nuevo!');
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: () => {
      toast.success('Registro exitoso. Espere activación del administrador');
      navigate('/login');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al registrar');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      clearAll();
      setPersistedUser(null);
      queryClient.clear();
      navigate('/login');
      toast.success('Sesión cerrada exitosamente');
    },
  });

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authAPI.getCurrentUser,
    retry: false,
    staleTime: Infinity, // Nunca considerar stale
    cacheTime: Infinity, // Nunca limpiar del cache
    enabled: hasValidTokens(),
    initialData: getUserData(), // Siempre empezar con datos de localStorage
    onSuccess: (user) => {
      if (user) {
        setUserData(user);
        setPersistedUser(user);
      }
    },
  });

  // Usar el usuario persistido como fuente principal de verdad
  const effectiveUser = currentUser || persistedUser;
  const isAdmin = effectiveUser?.role === 1 || effectiveUser?.role === "1";
  
  console.log('👤 Current user from query:', currentUser);
  console.log('👤 Persisted user from state:', persistedUser);
  console.log('👤 Effective user:', effectiveUser);
  console.log('📧 Effective user fullname:', effectiveUser?.fullname);
  console.log('🔑 Role value:', effectiveUser?.role, 'Type:', typeof effectiveUser?.role);
  console.log('👑 isAdmin calculated:', isAdmin);

  return {
    currentUser: effectiveUser,
    isLoading,
    isAuthenticated: !!effectiveUser,
    isAdmin,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};