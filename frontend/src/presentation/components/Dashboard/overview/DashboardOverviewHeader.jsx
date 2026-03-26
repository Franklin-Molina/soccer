import React from 'react';
import { Filter, Plus, MapPin, Calendar, Trophy } from 'lucide-react';

const DashboardOverviewHeader = ({
  activeTab,
  setActiveTab,
  isFilterOpen,
  setIsFilterOpen,
  navigate,
}) => {
  const getHeaderContent = () => {
    switch (activeTab) {
      case 'canchas':
        return {
          title: 'Gestión de Canchas',
          description: 'Administra y controla tus espacios deportivos',
          buttonText: 'Nueva Cancha',
          navigatePath: '/dashboard/canchas/create',
        };
      case 'reservas':
        return {
          title: 'Gestión de Reservas',
          description: 'Administra y controla las reservas de tus canchas',
          buttonText: 'Nueva Reserva',
          navigatePath: null, // No path provided for new booking in original code
        };
      case 'torneos':
        return {
          title: 'Gestión de Torneos',
          description: 'Administra los torneos, controla los cupos y genera los fixtures',
          buttonText: 'Nuevo Torneo',
          navigatePath: '/dashboard/tournaments/new',
        };
      default:
        return {};
    }
  };

  const { title, description, buttonText, navigatePath } = getHeaderContent();

  return (
    <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {description}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {activeTab !== 'torneos' && (
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800
                         hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700
                         text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium w-full sm:w-auto"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          )}

          <button
            onClick={navigatePath ? () => navigate(navigatePath) : () => {}}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500
                       text-white rounded-lg text-sm font-semibold shadow-lg shadow-emerald-600/20 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            {buttonText}
          </button>
        </div>
      </div>

      {/* TABS responsive: scroll en móvil */}
      <div className="mt-6 overflow-x-auto scrollbar-hide">
        <div className="flex w-max bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('canchas')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
              activeTab === 'canchas'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Canchas
          </button>

          <button
            onClick={() => setActiveTab('reservas')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
              activeTab === 'reservas'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Reservas
          </button>

          <button
            onClick={() => setActiveTab('torneos')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
              activeTab === 'torneos'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Torneos
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewHeader;
