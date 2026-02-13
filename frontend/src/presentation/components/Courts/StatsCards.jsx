import React from 'react';
import { Clock, Check, Users } from 'lucide-react';
import { formatPrice } from '../../utils/formatters.js'; // Assuming formatPrice is needed here too, or passed down

function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Slots Disponibles</span>
          <Check className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
        </div>
        <p className="text-3xl font-bold text-emerald-500 dark:text-emerald-400">{stats.availableSlots}</p>
      </div>
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Ocupación</span>
          <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        </div>
        <p className="text-3xl font-bold text-blue-500 dark:text-blue-400">{stats.occupancy}%</p>
      </div>
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 dark:text-slate-400 text-sm">Slots Ocupados</span>
          <Users className="w-5 h-5 text-rose-500 dark:text-rose-400" />
        </div>
        <p className="text-3xl font-bold text-rose-500 dark:text-rose-400">{stats.occupiedSlots}</p>
      </div>
    </div>
  );
}

export default StatsCards;
