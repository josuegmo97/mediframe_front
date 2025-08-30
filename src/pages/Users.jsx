import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { getUsers, createUser, updateUser, deleteUser } from '../api/users';
import UserModal from '../components/users/UserModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  const { data: usersData = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // Asegurar que users sea siempre un array
  const users = Array.isArray(usersData) ? usersData : (usersData?.users || []);
  
  console.log('Users data:', usersData, 'Users array:', users);

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'], exact: true });
      toast.success('Usuario creado exitosamente');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear usuario');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'], exact: true });
      toast.success('Usuario actualizado exitosamente');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar usuario');
    },
  });

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && user.status === 1) ||
                          (filterStatus === 'inactive' && user.status === 0);
    
    const matchesRole = filterRole === 'all' || 
                       (filterRole === 'admin' && user.role === 1) ||
                       (filterRole === 'viewer' && user.role === 2);
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusToggle = (user) => {
    updateMutation.mutate({
      id: user._id,
      data: { status: user.status === 1 ? 0 : 1 }
    });
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    // Función para escapar comillas en CSV
    const escapeCSV = (str) => {
      if (str == null) return '';
      const stringValue = String(str);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Crear encabezados elegantes
    const headers = [
      'NOMBRE DE USUARIO',
      'NOMBRE COMPLETO', 
      'EMAIL',
      'ROL',
      'ESTADO',
      'FECHA REGISTRO',
      'ÚLTIMA ACTUALIZACIÓN'
    ];

    // Crear filas de datos con formato mejorado
    const rows = filteredUsers.map(user => [
      user.username || 'Sin usuario',
      user.fullname || 'Sin nombre',
      user.email || 'Sin email',
      user.role === 1 ? 'ADMINISTRADOR' : 'USUARIO ESTÁNDAR',
      user.status === 1 ? 'ACTIVO' : 'INACTIVO',
      format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: es }),
      user.updated_at ? format(new Date(user.updated_at), 'dd/MM/yyyy HH:mm', { locale: es }) : 'Sin actualizar'
    ]);

    // Calcular estadísticas
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter(u => u.status === 1).length;
    const inactiveUsers = filteredUsers.filter(u => u.status === 0).length;
    const adminUsers = filteredUsers.filter(u => u.role === 1).length;
    const standardUsers = filteredUsers.filter(u => u.role !== 1).length;

    // Crear el contenido CSV con mejor formato
    const csvContent = [
      // Título del reporte
      [`REPORTE DE USUARIOS - ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`],
      [''], // Línea vacía
      [`Total de usuarios: ${totalUsers}`],
      [`Usuarios activos: ${activeUsers}`],
      [`Usuarios inactivos: ${inactiveUsers}`],
      [`Administradores: ${adminUsers}`],
      [`Usuarios estándar: ${standardUsers}`],
      [''], // Línea vacía
      headers, // Encabezados
      ...rows // Datos
    ];

    // Convertir a CSV con escape adecuado
    const csv = csvContent
      .map(row => row.map(cell => escapeCSV(cell)).join(','))
      .join('\n');

    // Crear archivo con BOM para mejor compatibilidad con Excel
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MediFrame_Usuarios_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Gestión de Usuarios</h1>
          <p className="text-text-secondary mt-2">
            Administra los usuarios del sistema
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-surface border border-border rounded-lg hover:bg-background transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-xl p-4 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="viewer">Espectadores</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center justify-end text-text-secondary">
            <Filter className="w-4 h-4 mr-2" />
            {filteredUsers.length} resultados
          </div>
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-surface rounded-xl shadow-lg overflow-hidden"
      >
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      Fecha Registro
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                            {user.fullname.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary">{user.fullname}</p>
                            <p className="text-sm text-text-secondary">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-text-secondary">
                          {user.email || 'No especificado'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 1 
                            ? 'bg-primary bg-opacity-20 text-primary' 
                            : 'bg-secondary bg-opacity-20 text-secondary'
                        }`}>
                          {user.role === 1 ? 'Admin' : 'Espectador'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user._id === currentUser?._id ? (
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            user.status === 1
                              ? 'bg-success bg-opacity-20 text-success'
                              : 'bg-error bg-opacity-20 text-error'
                          }`}>
                            {user.status === 1 ? (
                              <>
                                <UserCheck className="w-3 h-3" />
                                Activo
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3" />
                                Inactivo
                              </>
                            )}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleStatusToggle(user)}
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                              user.status === 1
                                ? 'bg-success bg-opacity-20 text-success hover:bg-opacity-30'
                                : 'bg-error bg-opacity-20 text-error hover:bg-opacity-30'
                            }`}
                          >
                            {user.status === 1 ? (
                              <>
                                <UserCheck className="w-3 h-3" />
                                Activo
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3" />
                                Inactivo
                              </>
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-text-secondary text-sm">
                          {format(new Date(user.created_at), 'dd MMM yyyy', { locale: es })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-text-secondary hover:text-primary hover:bg-background rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Estás seguro de eliminar este usuario?')) {
                                // Implementar eliminación
                              }
                            }}
                            className="p-2 text-text-secondary hover:text-error hover:bg-background rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <p className="text-sm text-text-secondary">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg transition-colors ${
                        currentPage === i + 1
                          ? 'bg-primary text-white'
                          : 'hover:bg-background'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* User Modal */}
      {isModalOpen && (
        <UserModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(data) => {
            if (selectedUser) {
              updateMutation.mutate({ id: selectedUser._id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
}