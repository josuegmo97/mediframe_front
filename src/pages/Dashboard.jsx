import { motion } from 'framer-motion';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Activity,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getUserStats } from '../api/users';
import { getLicenseStats } from '../api/licenses';
import { useAuth } from '../hooks/useAuth';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { currentUser, isAdmin } = useAuth();
  
  const { data: userStats } = useQuery({
    queryKey: ['userStats'],
    queryFn: getUserStats,
    enabled: isAdmin,
  });

  const { data: licenseStats } = useQuery({
    queryKey: ['licenseStats'],
    queryFn: getLicenseStats,
    enabled: isAdmin,
  });

  // Mock data para gráficos
  const monthlyData = [
    { month: 'Ene', usuarios: 65, licencias: 45 },
    { month: 'Feb', usuarios: 78, licencias: 52 },
    { month: 'Mar', usuarios: 90, licencias: 61 },
    { month: 'Abr', usuarios: 81, licencias: 73 },
    { month: 'May', usuarios: 96, licencias: 89 },
    { month: 'Jun', usuarios: 112, licencias: 95 },
  ];

  const licenseDistribution = [
    { name: 'Disponibles', value: licenseStats?.available || 45, color: '#9DB582' },
    { name: 'En Uso', value: licenseStats?.inUse || 30, color: '#73AFDC' },
    { name: 'Expiradas', value: licenseStats?.expired || 25, color: '#D9534F' },
  ];

  const statsCards = [
    {
      title: 'Usuarios Totales',
      value: userStats?.total || '0',
      icon: Users,
      change: '+12%',
      changeType: 'positive',
      color: 'bg-primary',
    },
    {
      title: 'Licencias Activas',
      value: licenseStats?.active || '0',
      icon: CreditCard,
      change: '+8%',
      changeType: 'positive',
      color: 'bg-secondary',
    },
    {
      title: 'Tasa de Activación',
      value: '78%',
      icon: TrendingUp,
      change: '+3%',
      changeType: 'positive',
      color: 'bg-tertiary',
    },
    {
      title: 'Actividad Mensual',
      value: '1,234',
      icon: Activity,
      change: '-2%',
      changeType: 'negative',
      color: 'bg-info',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          ¡Bienvenido, {currentUser?.fullname}!
        </h1>
        <p className="text-text-secondary mt-2">
          Aquí está el resumen de tu sistema MediFrame
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-surface rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-semibold ${
                stat.changeType === 'positive' ? 'text-success' : 'text-error'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-text-primary">{stat.value}</h3>
            <p className="text-text-secondary text-sm mt-1">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart - Tendencia Mensual */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:col-span-2 bg-surface rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Tendencia Mensual
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5E2" />
              <XAxis dataKey="month" stroke="#5A5A5A" />
              <YAxis stroke="#5A5A5A" />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="usuarios" 
                stackId="1"
                stroke="#9DB582" 
                fill="#9DB582" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="licencias" 
                stackId="1"
                stroke="#73AFDC" 
                fill="#73AFDC"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart - Distribución de Licencias */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-surface rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Estado de Licencias
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={licenseDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {licenseDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {licenseDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-text-secondary">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-text-primary">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-surface rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Actividad Reciente
        </h3>
        <div className="space-y-4">
          {[
            {
              icon: CheckCircle,
              color: 'text-success',
              title: 'Nueva licencia activada',
              description: 'Dispositivo MED-2024-001 activado exitosamente',
              time: 'Hace 5 minutos',
            },
            {
              icon: Users,
              color: 'text-primary',
              title: 'Nuevo usuario registrado',
              description: 'Dr. Juan Pérez se ha unido al sistema',
              time: 'Hace 2 horas',
            },
            {
              icon: XCircle,
              color: 'text-error',
              title: 'Licencia expirada',
              description: 'La licencia ABCD-1234-5678-9012 ha expirado',
              time: 'Hace 5 horas',
            },
            {
              icon: Clock,
              color: 'text-warning',
              title: 'Licencia por expirar',
              description: '3 licencias expirarán en los próximos 7 días',
              time: 'Hace 1 día',
            },
          ].map((activity, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className={`p-2 rounded-lg bg-background ${activity.color}`}>
                <activity.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-text-primary">{activity.title}</h4>
                <p className="text-sm text-text-secondary">{activity.description}</p>
                <p className="text-xs text-text-disabled mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}