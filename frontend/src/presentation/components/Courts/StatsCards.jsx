import React from 'react';
import { Clock, Check, Users } from 'lucide-react';
import { formatPrice } from '../../utils/formatters.js'; // Assuming formatPrice is needed here too, or passed down

function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Disponibles</span>
          <div className="bg-emerald-500/10 p-2 rounded-lg">
            <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
        </div>
        <p className="text-3xl font-black text-emerald-500 dark:text-emerald-400">{stats.availableSlots}</p>
      </div>
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Ocupación</span>
          <div className="bg-blue-500/10 p-2 rounded-lg">
            <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
        </div>
        <p className="text-3xl font-black text-blue-500 dark:text-blue-400">{stats.occupancy}%</p>
      </div>
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Ocupados</span>
          <div className="bg-rose-500/10 p-2 rounded-lg">
            <Users className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>
        </div>
        <p className="text-3xl font-black text-rose-500 dark:text-rose-400">{stats.occupiedSlots}</p>
      </div>
    </div>
  );
}

export default StatsCards;
