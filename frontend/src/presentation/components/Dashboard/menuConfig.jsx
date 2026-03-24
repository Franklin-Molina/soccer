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
  List,
  Trophy,
} from 'lucide-react';

export const menuItems = {
  cliente: [
    { to: '/', label: 'Inicio', icon: <Home className="w-5 h-5 text-slate-400" /> },
    { to: '/client/bookings', label: 'Mis Reservas', icon: <CalendarDays className="w-5 h-5 text-emerald-400" /> },
    { to: '/client/history', label: 'Historial', icon: <History className="w-5 h-5 text-cyan-400" /> },
    { to: '/client/matches', label: 'Buscar Partido', icon: <Users className="w-5 h-5 text-indigo-400" /> },
    { to: '/tournaments', label: 'Torneos', icon: <Trophy className="w-5 h-5 text-amber-400 " /> },
    { to: '/client/profile', label: 'Mi Perfil', icon: <User className="w-5 h-5 text-violet-400" /> },
  ],
  admin: [
    { type: 'header', label: 'Cuenta' },
    { to: '/dashboard/perfil', label: 'Perfil', icon: <User className="w-5 h-5 text-violet-500 dark:text-violet-400" /> },

    { type: 'header', label: 'Home' },
    { to: '/', label: 'Inicio', icon: <Home className="w-5 h-5 text-slate-500 dark:text-slate-400" /> },
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 text-blue-500 dark:text-blue-400" /> },
    
    { type: 'header', label: 'Gestión' },
    {
      label: 'Reservas',
      icon: <CalendarDays className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
      submenu: [
        { to: '/dashboard/reservas', label: 'Gestionar Reservas', icon: <FileText className="w-5 h-5 text-emerald-500/80" /> },
        { to: '/dashboard/reservas/historial', label: 'Historial', icon: <History className="w-5 h-5 text-emerald-500/80" /> },
      ],
    },
    {
      label: 'Canchas',
      icon: <Building className="w-5 h-5 text-sky-500 dark:text-sky-400" />,
      submenu: [
        { to: '/dashboard/canchas/manage', label: 'Gestionar Canchas', icon: <Settings className="w-5 h-5 text-sky-500/80" /> },
        { to: '/dashboard/canchas/create', label: 'Crear Cancha', icon: <PlusCircle className="w-5 h-5 text-sky-500/80" /> },
        { to: '/dashboard/canchas/categories', label: 'Gestionar Categorías', icon: <List className="w-5 h-5 text-sky-500/80" /> },
      ],
    },

    {
      label: 'Torneos',
      icon: <Trophy  className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
      submenu: [
        
        { to: '/dashboard/tournaments/new', label: 'Crear Torneo', icon: <PlusCircle className="w-5 h-5 text-amber-500/80" /> },
        { to: '/tournaments', label: 'Torneos', icon: <LayoutDashboard className="w-5 h-5 text-amber-500/80" /> },
        { to: '/dashboard/tournaments/', label: 'Gestinar torneos', icon: <Settings className="w-5 h-5 text-amber-500/80" /> },     
      ],
    },

    { to: '/dashboard/usuarios', label: 'Usuarios', icon: <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> },
    { to: '/dashboard/pagos', label: 'Pagos', icon: <DollarSign className="w-5 h-5 text-rose-500 dark:text-rose-400" /> },
    { to: '/dashboard/estadisticas', label: 'Estadísticas', icon: <BarChart2 className="w-5 h-5 text-orange-500 dark:text-orange-400" /> },
  ],
  adminglobal: [
    { to: '/adminglobal', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5 text-blue-500 dark:text-blue-400" /> },
    { to: '/adminglobal/manage-admins', label: 'Gestionar Admins', icon: <Shield className="w-5 h-5 text-red-500 dark:text-red-400" /> },
    { to: '/adminglobal/register-admin', label: 'Crear Admin', icon: <PlusCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> },
    { to: '/adminglobal/profile', label: 'Mi Perfil', icon: <User className="w-5 h-5 text-violet-500 dark:text-violet-400" /> },
  ],
};