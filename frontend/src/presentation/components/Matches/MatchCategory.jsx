import React from "react";
import MatchCard from "./MatchCard";

const MatchCategory = ({ category, matches, onJoin, onCancel, onRemove, onEdit, onLeave, currentUser }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3 border-b border-gray-300 dark:border-gray-700 pb-1">
        {category}
      </h2>
      <div className="space-y-4">
        {matches.length > 0 ? (
          matches.map((match) => (
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
          ))
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay partidos abiertos en esta categoría.
          </p>
        )}
      </div>
    </div>
  );
};

export default MatchCategory;
