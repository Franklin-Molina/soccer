import React from 'react';
import { Calendar } from 'lucide-react';
import { formatPrice } from '../../utils/formatters.js';

function CourtHeader({ court }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 sm:p-4 rounded-2xl shadow-lg shrink-0">
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent leading-tight">
            {court.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 line-clamp-1">{court.location || 'Complejo Deportivo'}</p>
        </div>
      </div>
      <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center bg-emerald-600 to-red-600 text-white px-6 py-4 rounded-2xl shadow-lg w-full sm:w-auto">
        <span className="text-xs sm:text-sm font-medium opacity-90 uppercase tracking-wider">Precio / Hora</span>
        <span className="text-xl sm:text-3xl font-black sm:mt-1">${formatPrice(court.price)}</span>
      </div>
    </div>
  );
}

export default CourtHeader;
