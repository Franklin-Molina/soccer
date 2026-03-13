import React from 'react';
import { Clock, Check, Users } from 'lucide-react';

function StatsCards({ stats }) {
  return (
    // Contenedor principal unificado: menos margen inferior (mb-6 en vez de mb-8)
    <div className="mb-6 bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Forzamos 3 columnas siempre y usamos divide-x para las líneas separadoras */}
      <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700">
        
        {/* Tarjeta 1: Disponibles */}
        <div className="p-3 sm:p-4 text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 mb-1">
            <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            {/* Texto muy pequeño en móvil (text-[10px]) para que no se desborde */}
            <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Libres</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-500 dark:text-emerald-400 leading-none">
            {stats.availableSlots}
          </p>
        </div>

        {/* Tarjeta 2: Ocupación */}
        <div className="p-3 sm:p-4 text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Uso</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-500 dark:text-blue-400 leading-none">
            {stats.occupancy}%
          </p>
        </div>

        {/* Tarjeta 3: Ocupados */}
        <div className="p-3 sm:p-4 text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            <span className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Reserv.</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-500 dark:text-rose-400 leading-none">
            {stats.occupiedSlots}
          </p>
        </div>

      </div>
    </div>
  );
}

export default StatsCards;