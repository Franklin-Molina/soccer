import {
  Home,
  CalendarDays,
  History,
  Users,
  User,
  Shield,
  LayoutDashboard,
  FileText,
  BarChart2,
  DollarSign,
  PlusCircle,
  Settings,
  Building,
} from 'lucide-react';

export const menuItems = {
  cliente: [
    { to: '/', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { to: '/client/bookings', label: 'Mis Reservas', icon: <CalendarDays className="w-5 h-5" /> },
    { to: '/client/history', label: 'Historial', icon: <History className="w-5 h-5" /> },
    { to: '/client/matches', label: 'Buscar Partido', icon: <Users className="w-5 h-5" /> },
    { to: '/client/profile', label: 'Mi Perfil', icon: <User className="w-5 h-5" /> },
  ],
  admin: [
    { type: 'header', label: 'Cuenta' },
    { to: '/dashboard/perfil', label: 'Perfil', icon: <User className="w-5 h-5" /> },

    { type: 'header', label: 'Home' },
    { to: '/', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    
    { type: 'header', label: 'Gestión' },
    {
      label: 'Reservas',
      icon: <CalendarDays className="w-5 h-5" />,
      submenu: [
        { to: '/dashboard/reservas', label: 'Gestionar Reservas', icon: <FileText className="w-5 h-5" /> },
        { to: '/dashboard/reservas/historial', label: 'Historial', icon: <History className="w-5 h-5" /> },
      ],
    },
    {
      label: 'Canchas',
      icon: <Building className="w-5 h-5" />,
      submenu: [
        { to: '/dashboard/canchas/manage', label: 'Gestionar Canchas', icon: <Settings className="w-5 h-5" /> },
        { to: '/dashboard/canchas/create', label: 'Crear Cancha', icon: <PlusCircle className="w-5 h-5" /> },
      ],
    },
    { to: '/dashboard/usuarios', label: 'Usuarios', icon: <Users className="w-5 h-5" /> },
    { to: '/dashboard/pagos', label: 'Pagos', icon: <DollarSign className="w-5 h-5" /> },
    { to: '/dashboard/estadisticas', label: 'Estadísticas', icon: <BarChart2 className="w-5 h-5" /> },
  ],
  adminglobal: [
    { to: '/adminglobal', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: '/adminglobal/manage-admins', label: 'Gestionar Admins', icon: <Shield className="w-5 h-5" /> },
    { to: '/adminglobal/register-admin', label: 'Crear Admin', icon: <User className="w-5 h-5" /> },
    { to: '/adminglobal/profile', label: 'Mi Perfil', icon: <User className="w-5 h-5" /> },
  ],
};
