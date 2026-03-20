import React from 'react';
import { CheckCircle, Save, ShieldAlert, Trophy } from 'lucide-react';
import { useManageMatches } from '../../hooks/tournaments/useManageMatches';

function AdminMatchManager({ initialMatches = [], onRefresh }) {
  const { matches, handleUpdateScore, isUpdating } = useManageMatches(initialMatches);

  const handleUpdateScoreWrapped = async (matchId, scoreA, scoreB, isFinished) => {
    await handleUpdateScore(matchId, scoreA, scoreB, isFinished);
    if (onRefresh) onRefresh();
  };

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
        <ShieldAlert className="w-12 h-12 mx-auto text-slate-400 mb-3" />
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Aún no hay partidos generados</h3>
        <p className="text-slate-500 text-sm mt-1">Genera el fixture primero para poder administrar los resultados.</p>
      </div>
    );
  }

  // Agrupamos los partidos por ronda (Ej: "Cuartos de final", "Semifinal")
  const matchesByRound = matches.reduce((acc, match) => {
    const roundName = match.round_name || `Ronda ${match.round_number || 1}`;
    if (!acc[roundName]) acc[roundName] = [];
    acc[roundName].push(match);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {Object.entries(matchesByRound).map(([roundName, roundMatches]) => (
        <div key={roundName} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          
          {/* Header de la Ronda */}
          <div className="bg-slate-100 dark:bg-slate-900/80 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center">
            <Trophy className="w-5 h-5 text-amber-500 mr-2" />
            <h3 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-wider">
              {roundName}
            </h3>
          </div>

          {/* Lista de Partidos */}
          <div className="p-4 md:p-6 space-y-4">
            {roundMatches.map((match) => (
              <MatchScoreCard 
                key={match.id} 
                match={match} 
                onUpdateScore={handleUpdateScoreWrapped} 
                isUpdating={isUpdating} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Sub-componente: La tarjeta individual de cada partido (CORREGIDO)
const MatchScoreCard = ({ match, onUpdateScore, isUpdating }) => {
  // Usamos los nombres correctos que manda tu backend: score1 y score2
  const [scoreA, setScoreA] = React.useState(match.score1 || 0);
  const [scoreB, setScoreB] = React.useState(match.score2 || 0);

  // Extraemos los nombres y estados correctamente
  const team1Name = match.team1?.name;
  const team2Name = match.team2?.name;
  const isFinished = match.status === 'completed';
  const teamsReady = !!team1Name && !!team2Name;

  return (
    <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
      isFinished 
        ? 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 opacity-80' 
        : 'bg-white border-blue-100 dark:bg-slate-800 dark:border-blue-900/30 shadow-sm'
    }`}>
      
      {/* Equipo 1 */}
      <div className="flex-1 flex items-center justify-end w-full md:w-auto">
        <span className={`font-bold mr-4 text-right line-clamp-2 ${match.winner?.id === match.team1?.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
          {team1Name || 'Por definir...'}
        </span>
        <input 
          type="number" min="0" 
          disabled={isFinished || !teamsReady}
          value={scoreA} 
          onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
          className="w-16 h-12 text-center text-xl font-black rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
        />
      </div>

      {/* VS Badge */}
      <div className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest">
        VS
      </div>

      {/* Equipo 2 */}
      <div className="flex-1 flex items-center justify-start w-full md:w-auto">
        <input 
          type="number" min="0" 
          disabled={isFinished || !teamsReady}
          value={scoreB} 
          onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
          className="w-16 h-12 text-center text-xl font-black rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
        />
        <span className={`font-bold ml-4 text-left line-clamp-2 ${match.winner?.id === match.team2?.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
          {team2Name || 'Por definir...'}
        </span>
      </div>

      {/* Botones de Acción */}
      <div className="w-full md:w-auto flex justify-center gap-2 mt-2 md:mt-0">
        {!isFinished && teamsReady && (
          <>
            <button 
              onClick={() => onUpdateScore(match.id, scoreA, scoreB, false)}
              disabled={isUpdating}
              className="p-3 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 rounded-xl transition-colors tooltip" 
              title="Guardar marcador sin finalizar"
            >
              <Save className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                if(window.confirm('¿Finalizar partido? El ganador avanzará a la siguiente ronda y este partido no podrá modificarse.')) {
                  onUpdateScore(match.id, scoreA, scoreB, true);
                }
              }}
              disabled={isUpdating}
              className="px-4 py-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-xl transition-colors flex items-center font-bold text-sm"
            >
              <CheckCircle className="w-5 h-5 mr-2" /> Finalizar
            </button>
          </>
        )}
        
        {isFinished && (
          <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-bold text-sm flex items-center border border-slate-200 dark:border-slate-700">
            <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" /> Finalizado
          </div>
        )}
        
        {!isFinished && !teamsReady && (
          <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-xl font-bold text-sm border border-amber-200 dark:border-amber-800/50">
            Esperando rivales
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMatchManager;