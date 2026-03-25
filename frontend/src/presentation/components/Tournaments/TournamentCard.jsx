import React from 'react';
import { Calendar, Users, Trophy, ChevronRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters.js';


function TournamentCard({ tournament }) {
  // Calculamos el porcentaje de cupos llenos para la barra de progreso
  const occupancyPercentage = Math.round((tournament.registeredTeams / tournament.maxTeams) * 100);
  const isFull = tournament.registeredTeams >= tournament.maxTeams;

  // Formateamos las fechas para que se vean elegantes (ej. "15 Mar - 20 Mar, 2026")
  const startDateStr = format(new Date(tournament.startDate), 'dd MMM', { locale: es });
  const endDateStr = format(new Date(tournament.endDate), 'dd MMM, yyyy', { locale: es });
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (occupancyPercentage / 100) * circumference;
  const percentage = (tournament.registeredTeams / tournament.maxTeams) * 100;

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
          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md shadow-lg ${tournament.status === 'open'
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
            <span className="text-amber-600 dark:text-amber-400">Premio: {formatPrice(tournament.prize)}</span>
          </div>

          <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
            <Clock className="w-4 h-4 mr-2 text-blue-500" />
            <span>Nivel: {tournament.level}</span>
          </div>
        </div>

        {/* 3. FOOTER: Cupos y Acción (Empujado hacia abajo con mt-auto) */}
        {/* 3. FOOTER: Cupos y Acción (Empujado hacia abajo con mt-auto) */}
{/* FOOTER: Cupos y Acción 
  Contenedor principal con flex-col para móviles y flex-row para escritorio.
  Mantiene la separación y alineación vertical responsive.
*/}
<div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-0">

  {/* Indicador de Cupos (Nuevo diseño Lineal basado en imagen_0.png) 
    Ocupa todo el ancho en móviles y ancho automático en escritorio.
  */}
  <div className="flex-1 w-full sm:w-auto sm:max-w-xs pr-4">
    {/* Fila superior: Texto y Cifras (Flex con justify-between) */}
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Equipos
      </p>
      <p className="text-base font-bold text-slate-900 dark:text-white">
        {tournament.registeredTeams} / {tournament.maxTeams}
      </p>
    </div>

    {/* Contenedor de la Barra de Progreso Lineal */}
    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
      {/* Barra de progreso rellena (Dinámica) */}
      <div 
        className={`h-full rounded-full transition-all duration-500 ${percentage >= 100 ? 'bg-red-500' : 'bg-emerald-500'}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>

    {/* Badge de Cupos Disponibles (Alineado a la izquierda) */}
    <div className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/50">
      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
        {tournament.maxTeams - tournament.registeredTeams} cupos disponibles
      </span>
    </div>
  </div>

  {/* Botón Ver Detalles (Mantiene la lógica responsive anterior) */}
  <Link
    to={`/tournaments/${tournament.id}`}
    className="
      flex-shrink-0 flex items-center justify-center gap-2 
      w-full sm:w-auto px-6 py-3 
      rounded-xl font-bold text-sm bg-emerald-600 text-white
      hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-600/20
      transition-all duration-300 
      focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
    "
  >
    Ver más <ChevronRight className="w-4 h-4 text-white" />
  </Link>

</div>
      </div>
    </div>
  );
}

export default TournamentCard;