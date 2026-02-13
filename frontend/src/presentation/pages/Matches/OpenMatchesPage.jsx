import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useMatches } from "../../hooks/matches/useMatches";
import CreateMatchForm from "../../components/Matches/CreateMatchForm";
import MatchCard from "../../components/Matches/MatchCard";
import { Plus } from "lucide-react";

const OpenMatchesPage = () => {
  const { user } = useAuth();
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
        dark:bg-slate-950 dark:text-gray-300
      ">
        <div className="animate-pulse">Cargando partidos...</div>
      </div>
    );
  }

  const categories = ["Todos", "Mixto", "Hombres", "Mujeres"];

  return (
    <div className="
      px-6 py-10 min-h-screen transition-colors duration-300
      bg-gray-50 text-gray-900
      dark:bg-slate-900 dark:text-gray-100
    ">
      {isModalOpen && (
        <CreateMatchForm
          onClose={handleCloseModal}
          onMatchCreated={fetchAllData}
          match={editingMatch}
        />
      )}

      {/* Header */}
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Encuentra tu Partido
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Únete a partidos abiertos o gestiona tus inscripciones
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="
            flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold
            bg-blue-600 text-white
            hover:bg-blue-700 active:scale-95
            shadow-lg shadow-blue-600/20
            transition-all
          "
        >
          <Plus className="w-5 h-5" />
          Crear Partido
        </button>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-8 mb-8 border-b border-gray-200 dark:border-slate-700">
        {[
          { key: "available", label: "Partidos Disponibles", count: availableMatches.length },
          { key: "mine", label: "Mis Partidos", count: upcomingMatches.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSelectedCategory("Todos");
            }}
            className={`
              relative pb-4 text-sm font-medium transition-colors
              ${
                activeTab === tab.key
                  ? "text-blue-600 dark:text-blue-500"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }
            `}
          >
            <div className="flex items-center gap-2">
              {tab.label}
              <span
                className={`
                  px-2 py-0.5 rounded-md text-xs
                  ${
                    activeTab === tab.key
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-500"
                      : "bg-gray-200 text-gray-600 dark:bg-slate-800 dark:text-gray-400"
                  }
                `}
              >
                {tab.count}
              </span>
            </div>

            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Categorías */}
      <div className="flex flex-wrap gap-3 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`
              px-6 py-2 rounded-xl text-sm font-medium transition-all
              ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : `
                    bg-gray-100 text-gray-600 hover:bg-gray-200
                    dark:bg-slate-800 dark:text-gray-400
                    dark:hover:bg-slate-700 dark:hover:text-gray-200
                    border border-gray-200 dark:border-slate-700
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed
          bg-gray-100 border-gray-300 text-gray-600
          dark:bg-slate-800/40 dark:border-slate-700 dark:text-gray-400
        ">
          <p className="text-lg">No hay partidos en esta sección.</p>

          {activeTab === "available" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-blue-600 dark:text-blue-500 hover:underline"
            >
              ¿Por qué no creas uno?
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OpenMatchesPage;
