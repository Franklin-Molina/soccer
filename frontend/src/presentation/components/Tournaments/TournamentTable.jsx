import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Calendar, Trophy, Eye, Zap, SearchX } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatPrice } from '../../utils/formatters.js';

const ActionButton = ({ onClick, icon: Icon, title, className, to, target }) => {
  const content = (
    <div className={`p-2 rounded-lg transition-all text-slate-500 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 ${className}`} title={title}>
      <Icon size={16} />
    </div>
  );

  if (to) {
    return <Link to={to} target={target}>{content}</Link>;
  }

  return (
    <button onClick={onClick}>
      {content}
    </button>
  );
};

const TournamentStatus = ({ status }) => {
  const config = {
    open: { label: 'Abierto', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20' },
    in_progress: { label: 'En Juego', class: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20' },
    finished: { label: 'Finalizado', class: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-500/20' }
  };

  const { label, class: className } = config[status] || config.finished;

  return (
    <span className={`inline-flex px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${className}`}>
      {label}
    </span>
  );
};

const TournamentTableRow = ({ t, onDelete, onGenerateFixture }) => {
  const isFull = t.registeredTeams >= t.maxTeams;
  const occupancyPct = Math.round((t.registeredTeams / t.maxTeams) * 100);

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors group">
      {/* COLUMNA 1: Info e Imagen */}
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
            {t.coverImage ? (
              <img src={t.coverImage} alt={t.name} className="h-full w-full object-cover" />
            ) : (
              <Trophy className="h-6 w-6 m-3 text-slate-400" />
            )}
          </div>
          <div className="ml-4">
            <div className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{t.name}</div>
            <div className="text-xs text-slate-500 font-medium flex items-center mt-1">
              <Trophy className="w-3 h-3 mr-1 text-amber-500" /> {formatPrice(t.prize)}
            </div>
          </div>
        </div>
      </td>

      {/* COLUMNA 2: Fechas */}
      <td className="px-6 py-4">
        <div className="text-sm text-slate-900 dark:text-white font-medium flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-slate-400" />
          {format(new Date(t.startDate), 'dd MMM', { locale: es })} - {format(new Date(t.endDate), 'dd MMM', { locale: es })}
        </div>
      </td>

      {/* COLUMNA 3: Cupos */}
      <td className="px-6 py-4">
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            {t.registeredTeams} / {t.maxTeams}
          </span>
          <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} 
              style={{ width: `${occupancyPct}%` }}
            ></div>
          </div>
        </div>
      </td>

      {/* COLUMNA 4: Estado */}
      <td className="px-6 py-4 text-center">
        <TournamentStatus status={t.status} />
      </td>

      {/* COLUMNA 5: Acciones */}
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          {/* Generar Fixture (Solo si está abierto y hay al menos 2 equipos) */}
          {t.status === 'open' && t.registeredTeams >= 2 && (
            <ActionButton 
              onClick={() => onGenerateFixture(t.id)} 
              icon={Zap} 
              title="Generar Sorteo" 
              className="hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" 
            />
          )}

          <ActionButton 
            to={`/tournaments/${t.id}`} 
            target="_blank" 
            icon={Eye} 
            title="Ver página pública" 
            className="hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10" 
          />
          
          <ActionButton 
            to={`/dashboard/tournaments/edit/${t.id}`} 
            icon={Edit} 
            title="Editar Torneo" 
            className="hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10" 
          />
          
          <ActionButton 
            onClick={() => onDelete(t.id)} 
            icon={Trash2} 
            title="Eliminar Torneo" 
            className="hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10" 
          />
        </div>
      </td>
    </tr>
  );
};

const TournamentCard = ({ t, onDelete, onGenerateFixture }) => {
  const isFull = t.registeredTeams >= t.maxTeams;
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
            {t.coverImage ? (
              <img src={t.coverImage} alt={t.name} className="h-full w-full object-cover" />
            ) : (
              <Trophy className="h-6 w-6 m-3 text-slate-400" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</h4>
            <p className="text-xs text-slate-500 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(t.startDate), 'dd MMM', { locale: es })}
            </p>
          </div>
        </div>
        <TournamentStatus status={t.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-100 dark:border-slate-700">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Inscritos</p>
          <p className={`text-sm font-black ${isFull ? 'text-red-500' : 'text-emerald-500'}`}>
            {t.registeredTeams} / {t.maxTeams}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Premio</p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{t.prize}</p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {t.status === 'open' && t.registeredTeams >= 2 && (
          <ActionButton onClick={() => onGenerateFixture(t.id)} icon={Zap} title="Generar Fixture" className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" />
        )}
        <ActionButton to={`/tournaments/${t.id}`} target="_blank" icon={Eye} title="Ver" />
        <ActionButton to={`/dashboard/tournaments/edit/${t.id}`} icon={Edit} title="Editar" className="text-amber-500 bg-amber-50 dark:bg-amber-500/10" />
        <ActionButton onClick={() => onDelete(t.id)} icon={Trash2} title="Eliminar" className="text-red-500 bg-red-50 dark:bg-red-500/10" />
      </div>
    </div>
  );
};

const NoResults = () => (
  <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
    <SearchX className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aún no hay torneos</h3>
    <p className="text-slate-500 dark:text-slate-400 mb-6">Crea tu primer torneo para empezar a recibir inscripciones.</p>
    <Link to="/dashboard/tournaments/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg">
      Crear mi primer Torneo
    </Link>
  </div>
);

function TournamentTable({ tournaments, loading, onDelete, onGenerateFixture }) {
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return <NoResults />;
  }

  return (
    <div className="space-y-4">
      {/* Vista de tarjetas para móviles */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:hidden gap-4">
        {tournaments.map((t) => (
          <TournamentCard key={t.id} t={t} onDelete={onDelete} onGenerateFixture={onGenerateFixture} />
        ))}
      </div>

      {/* Vista de tabla para escritorio */}
      <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                <th className="px-6 py-4">Torneo</th>
                <th className="px-6 py-4">Fechas</th>
                <th className="px-6 py-4 text-center">Cupos</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {tournaments.map((t) => (
                <TournamentTableRow key={t.id} t={t} onDelete={onDelete} onGenerateFixture={onGenerateFixture} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TournamentTable;