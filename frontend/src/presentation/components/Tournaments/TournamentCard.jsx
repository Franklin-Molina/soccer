import React from 'react';
import { Calendar, Users, Trophy, ChevronRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

function TournamentCard({ tournament }) {
  // Calculamos el porcentaje de cupos llenos para la barra de progreso
  const occupancyPercentage = Math.round((tournament.registeredTeams / tournament.maxTeams) * 100);
  const isFull = tournament.registeredTeams >= tournament.maxTeams;

  // Formateamos las fechas para que se vean elegantes (ej. "15 Mar - 20 Mar, 2026")
  const startDateStr = format(new Date(tournament.startDate), 'dd MMM', { locale: es });
  const endDateStr = format(new Date(tournament.endDate), 'dd MMM, yyyy', { locale: es });

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      
      {/* 1. CABECERA: Imagen del torneo y Estado */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img 
          src={tournament.coverImage || "https://images.unsplash.com/photo-1518605368461-1ee7e543b1cb?auto=format&fit=crop&w=800&q=80"} 
          alt={tournament.name}
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badge flotante de Estado */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md shadow-lg ${
            tournament.status === 'open' 
              ? 'bg-emerald-500/90 text-white border border-emerald-400/50' 
              : tournament.status === 'in_progress'
              ? 'bg-amber-500/90 text-white border border-amber-400/50'
              : 'bg-slate-800/90 text-slate-300 border border-slate-600/50'
          }`}>
            {tournament.status === 'open' ? 'Inscripciones Abiertas' : tournament.status === 'in_progress' ? 'En Juego' : 'Finalizado'}
          </span>
        </div>
      </div>

      {/* 2. CUERPO: Info principal */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 line-clamp-2">
          {tournament.name}
        </h3>
        
        <div className="space-y-3 mt-2 mb-6">
          <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
            <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
            <span className="capitalize">{startDateStr} — {endDateStr}</span>
          </div>
          
          <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm font-medium">
            <Trophy className="w-4 h-4 mr-2 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400">Premio: {tournament.prize}</span>
          </div>

          <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
            <Clock className="w-4 h-4 mr-2 text-blue-500" />
            <span>Nivel: {tournament.level}</span>
          </div>
        </div>

        {/* 3. FOOTER: Cupos y Acción (Empujado hacia abajo con mt-auto) */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          
          {/* Indicador de Cupos (Mini Progress Bar) */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
               <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0">
                  <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-200 dark:text-slate-700" />
                  <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="transparent" 
                    strokeDasharray={18 * 2 * Math.PI} 
                    strokeDashoffset={18 * 2 * Math.PI - (occupancyPercentage / 100) * 18 * 2 * Math.PI}
                    className={`${isFull ? 'text-red-500' : 'text-emerald-500'} transition-all duration-1000`} 
                  />
               </svg>
               <Users className="w-4 h-4 text-slate-600 dark:text-slate-400 z-10" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {tournament.registeredTeams} / {tournament.maxTeams}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Equipos</p>
            </div>
          </div>

          {/* Botón Ver Detalles */}
          {/* Botón Ver Detalles (AHORA ES UN LINK) */}
          <Link 
            to={`/tournaments/${tournament.id}`} 
            className={`flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              tournament.status === 'open' && !isFull
                ? 'bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Detalles <ChevronRight className="w-4 h-4 ml-1" />
          </Link>

        </div>
      </div>
    </div>
  );
}

export default TournamentCard;