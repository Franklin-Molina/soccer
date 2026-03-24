import React, { useState } from "react";
import MatchChat from "./MatchChat";
import { format } from 'date-fns';
import { MessageCircle, LogOut, Calendar, Clock, Users, User, ShieldCheck, X } from "lucide-react";
import { toast } from 'react-toastify';

const MatchCard = ({ match, onJoin, onCancel, onRemove, onEdit, onLeave, currentUser, hasNewMessage, onOpenChat }) => {
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleToggleChat = () => {
    if (!showChat && onOpenChat) {
      onOpenChat();
    }
    setShowChat(!showChat);
  };
  const isCreator = currentUser?.id === match.creator.id;
  // El creador también es un participante. isFull ya considera al creador.
  const isFull = match.participants.length >= match.players_needed + 1;

  // Verificar si el usuario actual es participante del partido (incluyendo al creador)
  const isParticipant = isCreator || match.participants.some(
    (p) => p.user.id === currentUser?.id
  );

  const startTime = new Date(match.start_time);
  const endTime = new Date(match.end_time);

  const formatTime = (date) => format(date, 'h:mm a').toLowerCase();


  return (
    <div
      className={`relative overflow-hidden p-4 sm:p-6 rounded-2xl border transition-all duration-300 ${match.status === "CANCELLED"
          ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50"
          : isFull
            ? "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800"
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10"
        }`}
    >
      {/* Estado Badge */}
      <div className="absolute top-0 right-0">
        <div className={`px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-widest ${match.status === "CANCELLED"
            ? "bg-red-500 text-white"
            : isFull
              ? "bg-slate-500 text-white"
              : "bg-emerald-600 text-white"
          }`}>
          {match.status === "CANCELLED" ? "Cancelado" : isFull ? "Completo" : "Abierto"}
        </div>
      </div>

      <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-3 pr-14 leading-tight">
        {match.court}
      </h4>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold">{startTime.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Clock className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold">
            {formatTime(startTime)} - {formatTime(endTime)} 
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Users className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold">{match.participants.length} / {match.players_needed + 1}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <User className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold truncate">{match.creator.username}</span>
        </div>
      </div>

      {/* Participantes Section */}
      <div className="mb-4">
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          {showParticipants ? "Ocultar" : "Jugadores"}
        </button>

        {showParticipants && (
          <div className="mt-2 grid gap-1.5">
            {match.participants.map((p) => (
              <div
                key={p.user.id}
                className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-[10px] font-bold"
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="truncate max-w-[80px]">{p.user.username}</span>
                  {p.user.id === match.creator.id && <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1 py-0.5 rounded-md">Host</span>}
                </div>
                {isCreator && p.user.id !== currentUser.id && (
                  <button
                    className="p-1 hover:bg-red-500/10 text-red-500 transition-colors rounded-lg"
                    onClick={() => onRemove(match.id, p.user.id)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex flex-col gap-1.5">
        {match.status === "CANCELLED" ? (
          <div className="w-full py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-black text-center uppercase tracking-widest border border-red-500/20">
            Partido Cancelado
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1.5">
            {!isCreator && (
              <>
                {isParticipant ? (
                  <button
                    onClick={() => onLeave(match.id)}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Salir
                  </button>
                ) : (
                  <button
                    onClick={() => onJoin(match.id)}
                    disabled={isFull}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg ${isFull
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20 active:scale-95"
                      }`}
                  >
                    {isFull ? "Cerrado" : "Unirse"}
                  </button>
                )}
              </>
            )}

            {isCreator && (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onEdit(match)}
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-yellow-500/20"
                >
                  Editar
                </button>
                <button
                  onClick={() => onCancel(match.id)}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/20"
                >
                  Cancelar
                </button>
              </div>
            )}

            {isFull && isParticipant && (
              <button
                onClick={handleToggleChat}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 relative shadow-lg ${showChat ? "bg-slate-800 text-white" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
                  }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Grupal</span>
                {hasNewMessage && !showChat && (
                  <span className="absolute top-1 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {showChat && <MatchChat matchId={match.id} onClose={() => setShowChat(false)} />}
    </div>
  );
};

export default MatchCard;
