import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from '@tanstack/react-query';
import { MatchService } from "../../../infrastructure/services/matchService";
import { useMatches } from "../../hooks/matches/useMatches";
import CreateMatchForm from "../../components/Matches/CreateMatchForm";
import MatchCard from "../../components/Matches/MatchCard";
import { Plus } from "lucide-react";

const OpenMatchesPage = () => {
  const { user } = useAuth();

  // Pre-cargar datos del formulario (canchas y categorías) para evitar delay al abrir modal
  useQuery({
    queryKey: ['matchInitialData'],
    queryFn: MatchService.getInitialFormData,
    staleTime: 10 * 60 * 1000,
  });

  const {
    matches: matchesByCategory,
    upcomingMatches,
    loading,
    newMessages,
    fetchAllData,
    handleJoinMatch,
    handleLeaveMatch,
    handleCancelMatch,
    handleRemoveParticipant,
    clearNewMessage,
  } = useMatches();

  const [activeTab, setActiveTab] = useState("available");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);

  const handleEditMatch = (match) => {
    setEditingMatch(match);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMatch(null);
  };

  const allOpenMatches = useMemo(
    () => Object.values(matchesByCategory).flat(),
    [matchesByCategory]
  );

  const availableMatches = useMemo(() => {
    return allOpenMatches.filter((match) => {
      const isFull = match.participants.length >= match.players_needed + 1;
      return match.status === "OPEN" && !isFull;
    });
  }, [allOpenMatches]);

  const filteredMatches = useMemo(() => {
    const source =
      activeTab === "available" ? availableMatches : upcomingMatches;
    if (selectedCategory === "Todos") return source;
    return source.filter((m) => m.category === selectedCategory);
  }, [activeTab, selectedCategory, availableMatches, upcomingMatches]);

  if (loading) {
    return (
      <div className="
        flex justify-center items-center h-screen text-lg
        bg-gray-50 text-gray-600
        dark:bg-gray-900 dark:text-gray-300
      ">
        <div className="animate-pulse">Cargando partidos...</div>
      </div>
    );
  }

  const categories = ["Todos", "Mixto", "Hombres", "Mujeres"];

  return (
    <div className="
      px-3 sm:px-6 py-6 sm:py-24 min-h-screen transition-colors duration-300
      bg-slate-50 text-slate-900
      dark:bg-gray-900 dark:text-slate-100
    ">
      {isModalOpen && (
        <CreateMatchForm
          onClose={handleCloseModal}
          onMatchCreated={fetchAllData}
          match={editingMatch}
        />
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pt-16 sm:pt-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
            Partidos Abiertos
          </h1>
          <p className="text-xs sm:text-base text-slate-500 dark:text-slate-400 font-medium">
            Únete a la comunidad y juega hoy
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="
            flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm
            bg-emerald-600 text-white
            hover:bg-emerald-700 active:scale-95
            shadow-lg shadow-emerald-600/20
            transition-all duration-300
          "
        >
          <Plus className="w-5 h-5" />
          Crear Partido
        </button>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 sm:gap-8 mb-6 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800">
        {[
          { key: "available", label: "Disponibles", count: availableMatches.length },
          { key: "mine", label: "Mis Partidos", count: upcomingMatches.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSelectedCategory("Todos");
            }}
            className={`
              relative pb-3 px-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap
              ${
                activeTab === tab.key
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300"
              }
            `}
          >
            <div className="flex items-center gap-1.5">
              {tab.label}
              <span
                className={`
                  px-1.5 py-0.5 rounded-md text-[10px] font-black
                  ${
                    activeTab === tab.key
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500"
                  }
                `}
              >
                {tab.count}
              </span>
            </div>

            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Categorías */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`
              px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border
              ${
                selectedCategory === cat
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/30"
                  : `
                    bg-white text-slate-500 border-slate-200 hover:border-slate-300
                    dark:bg-slate-900 dark:text-slate-500
                    dark:border-slate-800 dark:hover:border-slate-700
                  `
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredMatches.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onJoin={handleJoinMatch}
              onLeave={handleLeaveMatch}
              onCancel={handleCancelMatch}
              onRemove={handleRemoveParticipant}
              onEdit={handleEditMatch}
              currentUser={user}
              hasNewMessage={!!newMessages[match.id]}
              onOpenChat={() => clearNewMessage(match.id)}
            />
          ))}
        </div>
      ) : (
        <div className="
          flex flex-col items-center justify-center py-12 sm:py-24 rounded-3xl border border-dashed
          bg-white dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 text-slate-500
          animate-in fade-in zoom-in duration-500
        ">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
             <Plus className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">No hay partidos</p>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-6 px-6 text-center">
            Prueba cambiando los filtros o crea uno nuevo.
          </p>

          {activeTab === "available" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Crear Partido Ahora
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OpenMatchesPage;
