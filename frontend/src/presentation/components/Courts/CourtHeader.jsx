import React from 'react';
import { Calendar } from 'lucide-react';
import { formatPrice } from '../../utils/formatters.js';

function CourtHeader({ court }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            {court.name}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">{court.description || 'Detalles de la cancha y reservas.'}</p>
        </div>
      </div>
      <div className="flex flex-col items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-lg">
        <span className="text-sm font-medium opacity-90">Precio por hora</span>
        <span className="text-2xl font-bold mt-1">${formatPrice(court.price)}</span>
      </div>
    </div>
  );
}

export default CourtHeader;
