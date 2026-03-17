import React from 'react';
import TournamentCard from '../../components/Tournaments/TournamentCard'
import { Trophy, Loader2 } from 'lucide-react';
import { useTournaments } from '../../hooks/tournaments/useTournaments';

function TournamentsPage() {
  const { tournaments, loading, error } = useTournaments();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabecera Épica */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-2xl mb-4">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Torneos <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">Sintética God</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Arma tu equipo, compite contra los mejores y demuestra quién manda en la cancha. ¡Inscríbete antes de que se agoten los cupos!
          </p>
        </div>

        {/* Cuadrícula de Torneos (Responsiva) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Cargando torneos...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-2xl text-center">
             <p className="text-red-600 dark:text-red-400 font-bold">Error al cargar los torneos</p>
             <p className="text-red-500 text-sm mt-1">Por favor, intenta nuevamente más tarde.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tournaments && tournaments.length > 0 ? (
              tournaments.map(tournament => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-500 text-lg">No hay torneos disponibles en este momento.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default TournamentsPage;
