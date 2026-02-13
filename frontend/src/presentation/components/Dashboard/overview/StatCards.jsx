import React from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, ShoppingBag, BarChart3 } from 'lucide-react';

// Mapeo de colores para clases de Tailwind
const iconColorClasses = {
  'blue-500': { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-500 dark:text-blue-400' },
  'emerald-500': { bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-500 dark:text-emerald-400' },
  'amber-500': { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-500 dark:text-amber-400' },
  'cyan-500': { bg: 'bg-cyan-100 dark:bg-cyan-900/50', text: 'text-cyan-500 dark:text-cyan-400' },
};

const StatCardSkeleton = () => (
    <div className="bg-white dark:bg-slate-900/70 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-3/5 h-4 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
        <div className="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-700"></div>
      </div>
      <div className="space-y-3">
        <div className="w-1/2 h-8 bg-slate-400 dark:bg-slate-600 rounded-md"></div>
        <div className="w-1/4 h-4 bg-slate-300 dark:bg-slate-700 rounded-md"></div>
      </div>
    </div>
);


const StatCard = ({ title, value, percentage, changeType, icon: Icon, loading, error }) => {
  if (loading) return <StatCardSkeleton />;
  
  const colors = iconColorClasses[Icon.color] || { bg: 'bg-slate-100', text: 'text-slate-500' };

  return (
    <div className="bg-white dark:bg-slate-900/70 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</div>
        <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center`}>
          <Icon.component className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>
      
      {error ? (
        <div className="text-red-500 dark:text-red-400 font-semibold">Error al cargar</div>
      ) : (
        <div>
          <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{value}</div>
          <div className={`flex items-center gap-1 text-sm font-semibold ${changeType === 'increase' ? 'text-emerald-500' : 'text-red-500'}`}>
            {changeType === 'increase' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{percentage}% vs mes anterior</span>
          </div>
        </div>
      )}
    </div>
  );
};


const StatCards = ({ userStats, bookingStats, loadingUserStats, errorUserStats, loadingBookingStats, errorBookingStats }) => {
  const cardData = [
    {
      title: "Ingresos Totales",
      value: "$24,580",
      percentage: "8.5",
      changeType: "increase",
      icon: { component: DollarSign, color: "blue-500" },
      loading: false, // Puedes conectar esto a un estado de carga si lo tienes
      error: null,
    },
    {
      title: "Nuevos Usuarios",
      value: userStats?.total_users?.toLocaleString() || '0',
      percentage: userStats?.percentage_change?.toFixed(1) || '0.0',
      changeType: userStats?.percentage_change >= 0 ? 'increase' : 'decrease',
      icon: { component: Users, color: "emerald-500" },
      loading: loadingUserStats,
      error: errorUserStats,
    },
    {
      title: "Reservas",
      value: bookingStats?.total_bookings?.toLocaleString() || '0',
      percentage: bookingStats?.percentage_change?.toFixed(1) || '0.0',
      changeType: bookingStats?.percentage_change >= 0 ? 'increase' : 'decrease',
      icon: { component: ShoppingBag, color: "amber-500" },
      loading: loadingBookingStats,
      error: errorBookingStats,
    },
    {
      title: "Crecimiento",
      value: "15.8%",
      percentage: "5.7",
      changeType: "increase",
      icon: { component: BarChart3, color: "cyan-500" },
      loading: false,
      error: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {cardData.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
};

export default StatCards;
