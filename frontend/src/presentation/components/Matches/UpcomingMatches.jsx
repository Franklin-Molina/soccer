import React from "react";
import MatchCard from "./MatchCard";

const UpcomingMatches = ({ matches, onJoin, onCancel, onRemove, onEdit, onLeave, currentUser }) => {
  if (matches.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-center mb-4 text-indigo-600 dark:text-indigo-400">
        Mis Próximos Partidos
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onJoin={onJoin}
            onCancel={onCancel}
            onRemove={onRemove}
            onEdit={onEdit}
            onLeave={onLeave}
            currentUser={currentUser}
          />
        ))}
      </div>
    </section>
  );
};

export default UpcomingMatches;
