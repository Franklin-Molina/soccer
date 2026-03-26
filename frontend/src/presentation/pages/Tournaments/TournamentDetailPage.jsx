import React from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy, Calendar, Users, MapPin, Shield,
  ChevronLeft, Info, GitMerge, Clock, X, User, Loader2
} from 'lucide-react';

import AdminMatchManager from '../../components/Tournaments/AdminMatchManager';
import TournamentBracket from '../../components/Tournaments/TournamentBracket';
import { formatPrice } from '../../utils/formatters.js';
import { useTournamentDetailLogic } from '../../hooks/tournaments/useTournamentDetailLogic';
import Spinner from '../../components/common/Spinner.jsx';
import { useAuth } from '../../context/AuthContext';

function TournamentDetailPage() {
  const { isAuthenticated } = useAuth();
  const {
    tournament,
    loading,
    error,
    isSubmitting,
    activeTab,
    setActiveTab,
    showLoginModal,
    setShowLoginModal,
    showRegistrationModal,
    setShowRegistrationModal,
    teamName,
    setTeamName,
    user,
    handleEnrollClick,
    handleSubmitRegistration,
    handleGenerateFixture,
    refresh
  } = useTournamentDetailLogic();

  if (loading) {
    return (      
        <Spinner/>          
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-center max-w-md">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Torneo no encontrado</h2>
          <p className="text-slate-500 mb-6">El torneo que buscas no existe o ha sido eliminado.</p>
          <Link to="/tournaments" className="inline-flex items-center text-emerald-600 font-bold hover:underline">
            <ChevronLeft className="w-5 h-5 mr-1" /> Volver a torneos
          </Link>
        </div>
      </div>
    );
  }

  const isFull = tournament.registeredTeams >= tournament.maxTeams;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">

      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/60 z-10"></div>
        <img src={tournament.coverImage || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1920&q=80'} alt="Torneo Cover" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute z-20 top-4 left-4 md:top-8 md:left-8">
          <Link to="/tournaments" className="flex items-center text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm">
            <ChevronLeft className="w-5 h-5 mr-1" /> Volver a Torneos
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 -mt-24 md:-mt-32">

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  tournament.status === 'open' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                  tournament.status === 'closed' ? 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30' :
                  tournament.status === 'finished' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30' :
                  'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}>
                {tournament.status === 'open' ? 'Inscripciones Abiertas' : 
                 tournament.status === 'closed' ? 'Inscripciones Cerradas' :
                 tournament.status === 'finished' ? 'Torneo Finalizado' : 'En Juego'}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center">
                <MapPin className="w-4 h-4 mr-1" /> {tournament.location}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
              {tournament.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Cupos: <span className="text-slate-900 dark:text-white font-bold">{tournament.registeredTeams} / {tournament.maxTeams}</span> equipos inscritos
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col gap-3 shrink-0">
            <button
              onClick={handleEnrollClick}
              disabled={isFull || tournament.status !== 'open'}
              className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center ${isFull || tournament.status !== 'open'
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/30'
                }`}
            >
              <Shield className="w-5 h-5 mr-2" />
              {tournament.status === 'open' ? (isFull ? 'Cupos Agotados' : 'Inscribir a mi Equipo') : 
               tournament.status === 'finished' ? 'Torneo Finalizado' : 'Inscripciones Cerradas'}
            </button>
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              Costo de inscripción: ${formatPrice(tournament.registrationFee)}
            </p>
          </div>
        </div>

        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700 mt-8 mb-6 hide-scrollbar">
          <button onClick={() => setActiveTab('info')} className={`flex items-center px-6 py-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'info' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            <Info className="w-4 h-4 mr-2" /> Información General
          </button>
          <button onClick={() => setActiveTab('teams')} className={`flex items-center px-6 py-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'teams' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            <Users className="w-4 h-4 mr-2" /> Equipos Inscritos
          </button>
          <button onClick={() => setActiveTab('fixture')} className={`flex items-center px-6 py-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'fixture' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            <GitMerge className="w-4 h-4 mr-2" /> Sorteo & Llaves
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700 min-h-[400px]">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Sobre el Torneo</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{tournament.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Formato</p>
                    <p className="font-bold text-slate-900 dark:text-white">{tournament.format}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Nivel</p>
                    <p className="font-bold text-slate-900 dark:text-white">{tournament.level}</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700 h-fit space-y-5">
                <div className="flex items-start">
                  <Trophy className="w-6 h-6 text-amber-500 mr-3 shrink-0" />
                  <div><p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Premio Mayor</p><p className="font-bold text-slate-900 dark:text-white">{formatPrice(tournament.prize)}</p></div>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-6 h-6 text-emerald-500 mr-3 shrink-0" />
                  <div><p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Fecha de Inicio</p><p className="font-bold text-slate-900 dark:text-white">{new Date(tournament.startDate).toLocaleDateString()}</p></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Equipos Confirmados ({tournament.teams?.length || 0})</h3>
              {tournament.teams?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournament.teams.map((team) => (
                    <div key={team.id} className="flex items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mr-4 shrink-0"><Shield className="w-6 h-6 text-slate-400" /></div>
                      <div><p className="font-bold text-slate-900 dark:text-white">{team.name}</p><p className="text-xs text-slate-500">Capitán: {team.captain?.username || 'N/A'}</p></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">Aún no hay equipos inscritos. ¡Sé el primero!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'fixture' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Encuentros del Torneo</h3>
                {user?.is_staff && (
                  <button
                    onClick={handleGenerateFixture}
                    disabled={isSubmitting || tournament.registeredTeams < 2}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                  >
                    <GitMerge size={16} />
                    {tournament.matches?.length > 0 ? 'Regenerar Sorteo' : 'Generar Sorteo Automático'}
                  </button>
                )}
              </div>

              {tournament.matches && tournament.matches.length > 0 ? (
                <div className="space-y-6">
                  {user?.is_staff ? (
                    <AdminMatchManager initialMatches={tournament.matches} onRefresh={() => refresh(true)} />
                  ) : (
                    <TournamentBracket matches={tournament.matches} />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><Clock className="w-10 h-10 text-slate-400" /></div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Preparando Sorteo</h3>
                  <p className="text-slate-500 text-sm">Los encuentros se generarán una vez que se cierren las inscripciones.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-500 dark:text-emerald-400">Acceso Requerido</h2>
              <button onClick={() => setShowLoginModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-4 text-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                Para inscribir a tu equipo en el torneo, debes estar registrado e iniciar sesión.
              </p>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700">
              <Link to="/register" className="w-full flex justify-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                Iniciar Sesión / Registrarse
              </Link>
            </div>
          </div>
        </div>
      )}

      {showRegistrationModal && (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 ${isAuthenticated ? 'md:pl-72' : ''}`}>
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-500 dark:text-emerald-400">Inscripción Oficial</h2>
              <button onClick={() => setShowRegistrationModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitRegistration} className="p-6 space-y-6">
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Estás a un paso de inscribirte en <span className="font-bold text-slate-900 dark:text-white">{tournament.name}</span>.
              </p>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Nombre de tu Equipo
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Ej. Los Galácticos FC"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Capitán (Tú)</p>
                  <p className="font-bold text-slate-900 dark:text-white">{user?.username || 'Usuario Actual'}</p>
                </div>
                <User className="w-6 h-6 text-emerald-500" />
              </div>

              <div className="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20 flex justify-between items-center">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-sm tracking-wider">Total a Pagar</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">${formatPrice(tournament.registrationFee)}</span>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowRegistrationModal(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white px-6 py-4 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !teamName.trim()}
                  className="flex-[2] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? "Procesando..." : "Confirmar e Inscribir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default TournamentDetailPage;
