import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Key,
  Calendar,
  Users as UsersIcon,
  Info,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';
import { getLicenses, deleteLicense, createLicense, createBatchLicenses } from '../api/licenses';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Licenses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMode, setCreateMode] = useState('single'); // 'single' or 'batch'
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const itemsPerPage = 10;

  const queryClient = useQueryClient();

  const { data: licensesData = [], isLoading } = useQuery({
    queryKey: ['licenses'],
    queryFn: getLicenses,
  });

  // Asegurar que licenses sea siempre un array
  const licenses = Array.isArray(licensesData) ? licensesData : (licensesData?.licenses || []);
  
  console.log('📝 Licenses data from server:', licensesData);
  console.log('📋 Processed licenses array:', licenses);
  console.log('🔢 Licenses count:', licenses.length);
  console.log('⏳ isLoading state:', isLoading);

  const deleteMutation = useMutation({
    mutationFn: deleteLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'], exact: true });
      toast.success('Licencia eliminada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar licencia');
    },
  });

  const createMutation = useMutation({
    mutationFn: createLicense,
    onSuccess: (data) => {
      console.log('✅ License created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['licenses'], exact: true });
      toast.success('Licencia creada exitosamente');
      setShowCreateModal(false);
    },
    onError: (error) => {
      console.error('❌ Error creating license:', error);
      toast.error(error.response?.data?.message || 'Error al crear licencia');
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: createBatchLicenses,
    onSuccess: (data) => {
      console.log('✅ Batch licenses created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['licenses'], exact: true });
      toast.success(`${Array.isArray(data) ? data.length : 'Las'} licencias creadas exitosamente`);
      setShowCreateModal(false);
    },
    onError: (error) => {
      console.error('❌ Error creating batch licenses:', error);
      toast.error(error.response?.data?.message || 'Error al crear licencias');
    },
  });

  // Filtrar licencias
  const filteredLicenses = licenses.filter(license => {
    // Si no hay término de búsqueda, coincide con todos
    const matchesSearch = !searchTerm || 
                          license.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          license.device_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'available' && (license.status === 1 || license.status === "1")) ||
                          (filterStatus === 'inuse' && (license.status === 2 || license.status === "2")) ||
                          (filterStatus === 'expired' && (license.status === 3 || license.status === "3"));
    
    return matchesSearch && matchesStatus;
  });
  
  console.log('✅ Total licenses:', licenses.length);
  console.log('🎯 Filtered licenses:', filteredLicenses.length);
  console.log('📑 Filtered data:', filteredLicenses);

  // Paginación
  const totalPages = Math.ceil(filteredLicenses.length / itemsPerPage);
  const paginatedLicenses = filteredLicenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  console.log('📄 Pagination info:', {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedCount: paginatedLicenses.length,
    startIndex: (currentPage - 1) * itemsPerPage,
    endIndex: currentPage * itemsPerPage
  });
  console.log('📋 Paginated licenses to render:', paginatedLicenses);

  const getStatusInfo = (status) => {
    // Convertir a número para comparar
    const numStatus = Number(status);
    switch(numStatus) {
      case 1:
        return { text: 'Disponible', color: 'bg-success bg-opacity-20 text-success', icon: CheckCircle };
      case 2:
        return { text: 'En Uso', color: 'bg-info bg-opacity-20 text-info', icon: UsersIcon };
      case 3:
        return { text: 'Expirada', color: 'bg-error bg-opacity-20 text-error', icon: XCircle };
      default:
        return { text: 'Desconocido', color: 'bg-gray-100 text-gray-600', icon: Clock };
    }
  };

  const handleDelete = (license) => {
    if (confirm('¿Estás seguro de eliminar esta licencia?')) {
      deleteMutation.mutate(license._id);
    }
  };

  const handleShowInfo = (license) => {
    setSelectedLicense(license);
    setShowInfoModal(true);
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

    // Función para pad strings para mejor alineación visual
    const padRight = (str, length) => {
      const stringValue = String(str || '');
      return stringValue.padEnd(length, ' ');
    };

    // Crear encabezados elegantes
    const headers = [
      'CLAVE DE LICENCIA',
      'ID DISPOSITIVO', 
      'ESTADO',
      'DÍAS PERMITIDOS',
      'DÍAS RESTANTES',
      'FECHA CREACIÓN',
      'DESCRIPCIÓN'
    ];

    // Crear filas de datos con formato mejorado
    const rows = filteredLicenses.map(license => [
      license.code || 'N/A',
      license.device_id || 'Sin asignar',
      getStatusInfo(license.status).text.toUpperCase(),
      license.days_permission ? `${license.days_permission} días` : 'N/A',
      license.days_remaining ? `${license.days_remaining} días restantes` : 'Sin asignar',
      format(new Date(license.created_at), 'dd/MM/yyyy HH:mm', { locale: es }),
      license.description || 'Sin descripción'
    ]);

    // Crear el contenido CSV con mejor formato
    const csvContent = [
      // Título del reporte
      [`REPORTE DE LICENCIAS - ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`],
      [''], // Línea vacía
      [`Total de licencias: ${filteredLicenses.length}`],
      [`Disponibles: ${filteredLicenses.filter(l => l.status === 1).length}`],
      [`En uso: ${filteredLicenses.filter(l => l.status === 2).length}`],
      [`Expiradas: ${filteredLicenses.filter(l => l.status === 3).length}`],
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
    a.download = `MediFrame_Licencias_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Gestión de Licencias</h1>
          <p className="text-text-secondary mt-2">
            Administra las licencias del sistema
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
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Licencia
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-success bg-opacity-20 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {licenses.filter(l => l.status === 1).length}
              </p>
              <p className="text-sm text-text-secondary">Disponibles</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-info bg-opacity-20 p-3 rounded-lg">
              <UsersIcon className="w-6 h-6 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {licenses.filter(l => l.status === 2).length}
              </p>
              <p className="text-sm text-text-secondary">En Uso</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-error bg-opacity-20 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-error" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {licenses.filter(l => l.status === 3).length}
              </p>
              <p className="text-sm text-text-secondary">Expiradas</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-primary bg-opacity-20 p-3 rounded-lg">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{licenses.length}</p>
              <p className="text-sm text-text-secondary">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-xl p-4 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Buscar licencias..."
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
            <option value="available">Disponibles</option>
            <option value="inuse">En Uso</option>
            <option value="expired">Expiradas</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center justify-end text-text-secondary">
            <Filter className="w-4 h-4 mr-2" />
            {filteredLicenses.length} resultados
          </div>
        </div>
      </div>

      {/* Licenses Table */}
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
                      Clave de Licencia
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      ID Dispositivo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      Días Permitidos
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                      Días Restantes
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {console.log('🔄 About to map paginatedLicenses:', paginatedLicenses.length, 'items')}
                  {paginatedLicenses.map((license, index) => {
                    console.log(`🔄 Rendering license ${index}:`, license.code);
                    const statusInfo = getStatusInfo(license.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <tr key={license._id} className="hover:bg-background transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-text-secondary" />
                            <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                              {license.code}
                            </code>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-text-secondary">
                            {license.device_id || 'No asignado'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-text-secondary" />
                            <span className="text-text-secondary text-sm">
                              {license.days_permission || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-text-secondary text-sm">
                            {license.days_remaining 
                              ? `${license.days_remaining} días`
                              : 'No asignado'
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {license.description && (
                              <button
                                onClick={() => handleShowInfo(license)}
                                className="p-2 text-info hover:bg-background rounded-lg transition-all"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(license)}
                              className="p-2 text-text-secondary hover:text-error hover:bg-background rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <p className="text-sm text-text-secondary">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredLicenses.length)} de {filteredLicenses.length} licencias
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

      {/* Create License Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-surface rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-text-primary">
                Nueva Licencia
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-background rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCreateMode('single')}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      createMode === 'single' 
                        ? 'bg-primary text-white' 
                        : 'bg-background text-text-secondary'
                    }`}
                  >
                    Individual
                  </button>
                  <button
                    onClick={() => setCreateMode('batch')}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      createMode === 'batch' 
                        ? 'bg-primary text-white' 
                        : 'bg-background text-text-secondary'
                    }`}
                  >
                    Lote
                  </button>
                </div>

                {createMode === 'single' ? (
                  <div className="space-y-4">
                    <p className="text-sm text-text-secondary">
                      Se creará una nueva licencia con clave generada automáticamente
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Días de permiso
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        defaultValue="30"
                        id="single-days-permission"
                        className="w-full px-4 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Descripción (opcional)
                      </label>
                      <textarea
                        placeholder="Descripción de la licencia..."
                        maxLength="500"
                        id="single-description"
                        rows="3"
                        className="w-full px-4 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors resize-none"
                        onChange={(e) => {
                          const count = e.target.value.length;
                          document.getElementById('single-description-count').textContent = count;
                        }}
                      />
                      <div className="text-right text-xs text-text-secondary mt-1">
                        <span id="single-description-count">0</span>/500 caracteres
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const daysPermission = parseInt(document.getElementById('single-days-permission').value);
                        const description = document.getElementById('single-description').value.trim();
                        
                        const payload = { days_permission: daysPermission };
                        
                        if (description) {
                          payload.description = description;
                        }
                        
                        createMutation.mutate(payload);
                      }}
                      disabled={createMutation.isPending}
                      className="w-full bg-primary text-white py-3 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                    >
                      {createMutation.isPending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : (
                        'Crear Licencia'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Cantidad de licencias
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        defaultValue="10"
                        id="batch-count"
                        className="w-full px-4 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Días de permiso
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        defaultValue="30"
                        id="batch-days-permission"
                        className="w-full px-4 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Descripción (opcional)
                      </label>
                      <textarea
                        placeholder="Descripción para todas las licencias del lote..."
                        maxLength="500"
                        id="batch-description"
                        rows="3"
                        className="w-full px-4 py-3 bg-input-background border border-input-border rounded-lg focus:outline-none focus:border-primary transition-colors resize-none"
                        onChange={(e) => {
                          const count = e.target.value.length;
                          document.getElementById('batch-description-count').textContent = count;
                        }}
                      />
                      <div className="text-right text-xs text-text-secondary mt-1">
                        <span id="batch-description-count">0</span>/500 caracteres
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const quantity = parseInt(document.getElementById('batch-count').value);
                        const daysPermission = parseInt(document.getElementById('batch-days-permission').value);
                        const description = document.getElementById('batch-description').value.trim();
                        
                        const payload = { 
                          quantity, 
                          days_permission: daysPermission 
                        };
                        
                        if (description) {
                          payload.description = description;
                        }
                        
                        createBatchMutation.mutate(payload);
                      }}
                      disabled={createBatchMutation.isPending}
                      className="w-full bg-primary text-white py-3 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                    >
                      {createBatchMutation.isPending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : (
                        'Crear Lote'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* License Info Modal */}
      {showInfoModal && selectedLicense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-surface rounded-xl shadow-xl w-full max-w-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-text-primary">
                Información de Licencia
              </h2>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-2 hover:bg-background rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Clave de Licencia</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Key className="w-4 h-4 text-text-secondary" />
                    <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                      {selectedLicense.code}
                    </code>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-text-secondary">ID Dispositivo</label>
                  <p className="text-text-primary mt-1">
                    {selectedLicense.device_id || 'No asignado'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-text-secondary">Estado</label>
                  <div className="mt-1">
                    {(() => {
                      const statusInfo = getStatusInfo(selectedLicense.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.text}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-text-secondary">Días Permitidos</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Timer className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-primary">
                      {selectedLicense.days_permission || 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-text-secondary">Días Restantes</label>
                  <p className="text-text-primary mt-1">
                    {selectedLicense.days_remaining 
                      ? `${selectedLicense.days_remaining} días`
                      : 'No asignado'
                    }
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-text-secondary">Fecha de Creación</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-primary">
                      {format(new Date(selectedLicense.created_at), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedLicense.description && (
                <div className="pt-4 border-t border-border">
                  <label className="text-sm font-medium text-text-secondary">Descripción</label>
                  <div className="mt-2 p-4 bg-background rounded-lg">
                    <p className="text-text-primary whitespace-pre-wrap">
                      {selectedLicense.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}