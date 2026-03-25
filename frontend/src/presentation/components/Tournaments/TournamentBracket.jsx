import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Shield, Trophy, Target } from 'lucide-react';

function TournamentBracket({ matches }) {
  const containerRef = useRef(null);
  const [matchPositions, setMatchPositions] = useState({});
  const [isReady, setIsReady] = useState(false);

  // 1. Agrupamos los partidos por ronda
  const matchesByRound = useMemo(() => {
    if (!matches) return {};
    return matches.reduce((acc, match) => {
      const roundNum = match.round_number || 1;
      if (!acc[roundNum]) acc[roundNum] = [];
      acc[roundNum].push(match);
      return acc;
    }, {});
  }, [matches]);

  // 2. Ordenamos las rondas
  const sortedRounds = useMemo(() => {
    return Object.keys(matchesByRound)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(key => ({
        roundNumber: parseInt(key),
        matches: matchesByRound[key].sort((a, b) => (a.order || 0) - (b.order || 0))
      }));
  }, [matchesByRound]);

  // 3. Medimos posiciones para las líneas SVG
  // 3. Medimos posiciones para las líneas SVG
  useEffect(() => {
    const updatePositions = () => {
      if (!containerRef.current) return;
      
      const newPositions = {};
      const matchElements = containerRef.current.querySelectorAll('[data-match-id]');
      const containerRect = containerRef.current.getBoundingClientRect();

      matchElements.forEach((el) => {
        const matchId = el.getAttribute('data-match-id');
        const rect = el.getBoundingClientRect();
        
        // 🔥 NUEVO: Buscamos el contenedor interno de los equipos para tener el centro visual perfecto
        const teamsWrapper = el.querySelector(`[data-teams-wrapper="${matchId}"]`);
        // Si existe el envoltorio usamos sus medidas para "Y", si no, usamos el borde de la tarjeta
        const verticalRect = teamsWrapper ? teamsWrapper.getBoundingClientRect() : rect;
        
        // X usa el borde externo de la tarjeta. Y usa el centro de los equipos.
        newPositions[matchId] = {
          rightX: rect.right - containerRect.left,
          leftX: rect.left - containerRect.left,
          centerY: (verticalRect.top + verticalRect.bottom) / 2 - containerRect.top,
          width: rect.width,
          height: rect.height
        };
      });

      setMatchPositions(newPositions);
      setIsReady(true);
    };

    // Pequeño delay para asegurar que el layout se asentó
    const timer = setTimeout(updatePositions, 100);
    window.addEventListener('resize', updatePositions);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositions);
    };
  }, [matches, sortedRounds]);

  if (!matches || matches.length === 0) return null;

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-inner overflow-x-auto hide-scrollbar relative">
      <div ref={containerRef} className="flex gap-16 min-w-max justify-center mx-auto relative z-10 py-4 px-2">
        
        {/* Capa SVG para conectores */}
        {isReady && (
          <svg className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible">
            {matches.map(match => {
              if (!match.next_match || !matchPositions[match.id] || !matchPositions[match.next_match]) return null;
              
              const start = matchPositions[match.id];
              const end = matchPositions[match.next_match];
              
              // Punto de salida (derecha del partido actual)
              const x1 = start.rightX;
              const y1 = start.centerY;
              
              // Punto de entrada (izquierda del siguiente partido)
              const x2 = end.leftX;
              const y2 = end.centerY;
              
              // Punto medio para el "codo"
              const midX = x1 + (x2 - x1) / 2;
              
              // Path tipo codo (elbow connector)
              const d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
              
              return (
                <path
                  key={`conn-${match.id}`}
                  d={d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-300 dark:text-slate-600 transition-all duration-500"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
          </svg>
        )}

        {sortedRounds.map((round, roundIndex) => {
          const isFinal = roundIndex === sortedRounds.length - 1;
          const isSemifinal = roundIndex === sortedRounds.length - 2 && sortedRounds.length > 1;

          return (
            <div key={`round-${round.roundNumber}`} className="flex flex-col min-w-[280px]">
              
              {/* Título de la ronda con jerarquía */}
              <div className="text-center mb-8 relative">
                <div className={`inline-flex flex-col items-center gap-1 group`}>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm ${
                    isFinal 
                      ? 'bg-amber-500 text-white shadow-amber-500/20' 
                      : isSemifinal 
                        ? 'bg-blue-600 text-white shadow-blue-500/20'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {isFinal ? 'Gran Final' : isSemifinal ? 'Semifinal' : round.matches[0]?.round_name || `Ronda ${round.roundNumber}`}
                  </span>
                  {isFinal && <Trophy className="w-5 h-5 text-amber-500 animate-bounce mt-1" />}
                </div>
              </div>

              {/* Partidos de la columna */}
              <div className="flex flex-col justify-center flex-1 gap-12 relative h-full">
                {round.matches.map((match) => (
                  <BracketMatchCard key={match.id} match={match} />
                ))}
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}

// Sub-componente: La tarjeta visual del partido

const BracketMatchCard = ({ match, isFinal, isAdmin, onUpdateScore, isUpdating }) => {
  const [scoreA, setScoreA] = useState(match.score1 || 0);
  const [scoreB, setScoreB] = useState(match.score2 || 0);

  // 🔥 Sincroniza automáticamente si el WebSocket trae nueva información
  useEffect(() => {
    setScoreA(match.score1 || 0);
    setScoreB(match.score2 || 0);
  }, [match.score1, match.score2]);

  const isFinished = match.status === 'completed';
  const teamsReady = !!match.team1 && !!match.team2;
  
  // 🔥 MAGIA AQUÍ: Si hay algún gol anotado, forzamos el estado a "En curso" visualmente
  const hasGoals = scoreA > 0 || scoreB > 0;
  const isInProgress = match.status === 'in_progress' || (teamsReady && hasGoals && !isFinished);
  const isNotStarted = !isInProgress && !isFinished;

  // 🔥 LÓGICA CORREGIDA: Determinamos qué equipo está resaltado basándonos puramente en los marcadores.
  // Un equipo se resalta si hay goles y su marcador es mayor que el del rival.
  // Esto funciona para partidos "En curso" y "Finalizado".
  const isTeam1Highlighted = hasGoals && scoreA > scoreB;
  const isTeam2Highlighted = hasGoals && scoreB > scoreA;

  // Determinar el estado para la etiqueta superior
  let statusColor = "bg-white/35";
  let statusText = "Por definir";
  if (isInProgress) {
    statusColor = "bg-[#4ade80] shadow-[0_0_6px_#4ade80] animate-pulse";
    statusText = "En curso";
  } else if (isFinished) {
    statusColor = "bg-white/35";
    statusText = "Finalizado";
  } else if (!teamsReady && match.team1) {
    statusColor = "bg-[#f59e0b]";
    statusText = "Esperando rival";
  } else if (isNotStarted) {
    statusColor = "bg-white/35";
    statusText = "Por jugar";
  }

  // 🔥 REGLA CORREGIDA: Usamos scoreA y scoreB (que se actualizan en vivo)
  const displayScore1 = isNotStarted ? '-' : scoreA;
  const displayScore2 = isNotStarted ? '-' : scoreB;

  return (
    <div 
      data-match-id={match.id}
      className={`relative bg-[#172320] border rounded-2xl overflow-hidden transition-all duration-300 ${
        isFinal ? 'border-[#f59e0b]/20 hover:border-[#f59e0b]/40 shadow-[0_0_24px_rgba(245,158,11,0.08)]' : 'border-white/5 hover:border-[#22c55e]/25 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
      }`}
    >
      
      {/* Etiqueta de Estado */}
      <div className={`flex items-center gap-2 px-3 py-1.5 border-b text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white/40 ${isFinal ? 'border-[#f59e0b]/10' : 'border-white/5'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`}></span>
        {statusText}
      </div>      

      {/* Equipo 1 */}
      <div className={`flex items-center gap-3 p-2.5 border-b transition-colors ${isFinal ? 'border-[#f59e0b]/10' : 'border-white/5'} ${isTeam1Highlighted ? 'bg-[#22c55e]/5' : ''}`}>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border transition-all ${isTeam1Highlighted ? 'bg-[#22c55e]/10 border-[#22c55e]/20 text-[#22c55e]' : 'bg-white/5 border-white/10 text-white/50'}`}>
          <Shield className="w-4 h-4 opacity-70" />
        </div>
        <span className={`flex-1 font-['Barlow_Condensed',sans-serif] text-[0.95rem] tracking-wide truncate uppercase ${isTeam1Highlighted ? 'text-[#22c55e] font-bold' : match.team1 ? 'text-[#e2e8e4] font-semibold' : 'text-white/25 italic text-[0.82rem] font-normal capitalize'}`}>
          {match.team1?.name || 'Por definir'}
        </span>
        
        {isAdmin && !isFinished && teamsReady ? (
          <input 
            type="number" min="0" value={scoreA} onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
            className="w-10 h-7 text-center text-sm font-bold rounded-md bg-white/5 border border-white/10 text-white/40 focus:border-[#22c55e] focus:text-white outline-none"
          />
        ) : (
          <div className={`min-w-[28px] h-7 px-2 flex items-center justify-center rounded-md font-['Barlow_Condensed',sans-serif] text-[1.1rem] font-bold ${isTeam1Highlighted ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-white/5 text-white/40'}`}>
            {displayScore1}
          </div>
        )}
      </div>

      {/* Equipo 2 */}
      <div className={`flex items-center gap-3 p-2.5 transition-colors ${isTeam2Highlighted ? 'bg-[#22c55e]/5' : ''}`}>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border transition-all ${isTeam2Highlighted ? 'bg-[#22c55e]/10 border-[#22c55e]/20 text-[#22c55e]' : 'bg-white/5 border-white/10 text-white/50'}`}>
          <Shield className="w-4 h-4 opacity-70" />
        </div>
        <span className={`flex-1 font-['Barlow_Condensed',sans-serif] text-[0.95rem] tracking-wide truncate uppercase ${isTeam2Highlighted ? 'text-[#22c55e] font-bold' : match.team2 ? 'text-[#e2e8e4] font-semibold' : 'text-white/25 italic text-[0.82rem] font-normal capitalize'}`}>
          {match.team2?.name || 'Por definir'}
        </span>
        
        {isAdmin && !isFinished && teamsReady ? (
          <input 
            type="number" min="0" value={scoreB} onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
            className="w-10 h-7 text-center text-sm font-bold rounded-md bg-white/5 border border-white/10 text-white/40 focus:border-[#22c55e] focus:text-white outline-none"
          />
        ) : (
          <div className={`min-w-[28px] h-7 px-2 flex items-center justify-center rounded-md font-['Barlow_Condensed',sans-serif] text-[1.1rem] font-bold ${isTeam2Highlighted ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-white/5 text-white/40'}`}>
            {displayScore2}
          </div>
        )}
      </div>

      {/* Controles Admin */}
      {isAdmin && !isFinished && teamsReady && (
        <div className="flex bg-[#111c19] border-t border-white/5 p-2 gap-2 mt-1">
          <button 
            onClick={() => onUpdateScore(match.id, scoreA, scoreB, false)} disabled={isUpdating}
            className="flex-1 py-1.5 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] rounded border border-[#22c55e]/20 flex items-center justify-center transition-colors" title="Guardar resultado"
          >
            <Save className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              if(window.confirm('¿Finalizar partido? El ganador avanzará.')) {
                onUpdateScore(match.id, scoreA, scoreB, true);
              }
            }} disabled={isUpdating}
            className="flex-[2] py-1.5 bg-[#22c55e] hover:bg-[#15803d] text-[#0b1210] font-bold text-xs rounded uppercase tracking-wider flex items-center justify-center transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Finalizar
          </button>
        </div>
      )}

    </div>
  );
};

export default TournamentBracket;