import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trophy } from 'lucide-react';

import { useManageTournaments } from '../../hooks/tournaments/useManageTournaments'; 
import TournamentTable from '../../components/Tournaments/TournamentTable'; 

function DashboardManageTournamentsPage() {
  // Consumimos toda la lógica con una sola línea de código 😎
  const { tournaments, loading, handleDelete, handleGenerateFixture } = useManageTournaments();

  return (
    <div className="p-4 sm:p-6 lg:p-8 mx-auto animate-in fade-in duration-500">
      
      {/* Cabecera de la Página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-amber-500" />
            Gestión de Torneos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">
            Administra los torneos, controla los cupos y genera los fixtures.
          </p>
        </div>
        
        {/* Botón de Acción Principal */}
        <Link 
          to="/dashboard/tournaments/new" 
          className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Torneo
        </Link>
      </div>

      {/* La tabla recibe los datos. 
        Toda la complejidad visual está encapsulada en este componente.
      */}
      <TournamentTable 
        tournaments={tournaments} 
        loading={loading} 
        onDelete={handleDelete} 
        onGenerateFixture={handleGenerateFixture}
      />

    </div>
  );
}

export default DashboardManageTournamentsPage;