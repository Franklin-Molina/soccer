import React from 'react';

function CourtInfoSection({ court }) {
  return (
    (court.description || court.characteristics) && (
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-6">
        {court.description && (
          <div className="mb-4">
            <h3 className="text-xl font-bold text-emerald-500 dark:text-emerald-400 mb-2">Descripción</h3>
            <p className="text-slate-600 dark:text-slate-300">{court.description}</p>
          </div>
        )}
        {court.characteristics && (
          <div>
            <h3 className="text-xl font-bold text-emerald-500 dark:text-emerald-400 mb-2">Características</h3>
            <p className="text-slate-600 dark:text-slate-300">{court.characteristics}</p>
          </div>
        )}
      </div>
    )
  );
}

export default CourtInfoSection;
